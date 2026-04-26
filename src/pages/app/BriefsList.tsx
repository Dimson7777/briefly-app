import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { Plus, Search, Trash2, Pencil, MoreVertical, FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/StatusBadge';
import type { Brief, BriefStatus } from '@/types/brief';
import type { ShellContext } from '@/components/AppShell';
import { useToast } from '@/hooks/use-toast';
import { formatRelative, formatDate } from '@/utils/format';
import { FREE_LIMITS, isPro } from '@/services/billing';

const TABS: { value: 'all' | BriefStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'needs_changes', label: 'Needs changes' },
  { value: 'approved', label: 'Approved' },
];

export default function BriefsList() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const ctx = useOutletContext<ShellContext>();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | BriefStatus>('all');

  useEffect(() => { document.title = 'Briefs · Briefly'; }, []);

  const { data: briefs = [] } = useQuery({
    queryKey: ['briefs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from('briefs').select('*').order('updated_at', { ascending: false });
      return (data ?? []) as Brief[];
    },
  });

  const filtered = briefs.filter((b) => {
    if (tab !== 'all' && b.status !== tab) return false;
    if (q.trim()) {
      const hay = `${b.title} ${b.client_name ?? ''} ${b.client_company ?? ''}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const remove = async (id: string) => {
    const { error } = await supabase.from('briefs').delete().eq('id', id);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
    } else {
      qc.invalidateQueries({ queryKey: ['briefs'] });
      toast({ title: 'Brief deleted' });
    }
  };

  const atLimit = !isPro(profile) && briefs.length >= FREE_LIMITS.briefs;

  return (
    <div className="anim-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {briefs.length} {briefs.length === 1 ? 'brief' : 'briefs'}
          </h1>
        </div>
        <Button onClick={ctx.openNewBrief} disabled={atLimit}>
          <Plus className="mr-1.5 h-4 w-4" /> New brief
        </Button>
      </div>

      {atLimit && (
        <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-md border border-primary/30 bg-primary/5 p-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm">You've reached the Free plan limit of {FREE_LIMITS.briefs} briefs.</p>
          </div>
          <Button asChild size="sm">
            <Link to="/app/billing">Upgrade to Pro</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'all' | BriefStatus)}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative max-w-sm flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="pl-9" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="panel mt-6 p-12 text-center">
          <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {briefs.length === 0
              ? 'Create your first brief to get started.'
              : 'No briefs match this filter.'}
          </p>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elev/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Brief</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Status</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Deadline</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Updated</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border last:border-0 transition hover:bg-surface-elev/40">
                  <td className="px-4 py-3">
                    <Link to={`/app/briefs/${b.id}`} className="font-medium hover:text-primary hover:underline">
                      {b.title}
                    </Link>
                    {(b.client_name || b.client_company) && (
                      <p className="text-xs text-muted-foreground">
                        {b.client_name}{b.client_company ? ` · ${b.client_company}` : ''}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-2 md:hidden">
                      <StatusBadge status={b.status} />
                      <span className="text-xs text-muted-foreground">{formatRelative(b.updated_at)}</span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell"><StatusBadge status={b.status} /></td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{formatDate(b.deadline)}</td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">{formatRelative(b.updated_at)}</td>
                  <td className="px-2 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="ring-focus rounded p-1.5 hover:bg-secondary">
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/briefs/${b.id}`}><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</Link>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this brief?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This permanently removes the brief and every deliverable, exclusion,
                                assumption and timeline item attached to it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => remove(b.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
