import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Command, FileText, Plus, Settings as SettingsIcon, LogOut, Search, Wand2,
} from 'lucide-react';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Brief } from '@/types/brief';

type Props = { onNewBrief: () => void };

export function CommandBar({ onNewBrief }: Props) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const { data: briefs = [] } = useQuery({
    queryKey: ['briefs-cmd', user?.id],
    enabled: !!user && open,
    queryFn: async () => {
      const { data } = await supabase
        .from('briefs')
        .select('id, title, client_name')
        .order('updated_at', { ascending: false })
        .limit(10);
      return (data ?? []) as Pick<Brief, 'id' | 'title' | 'client_name'>[];
    },
  });

  const go = (path: string) => { setOpen(false); navigate(path); };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ring-focus group flex w-full items-center gap-2 rounded-md border border-border bg-surface-elev/50 px-3 py-1.5 text-sm text-muted-foreground transition hover:border-foreground/20 hover:bg-surface-elev"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search briefs, jump to…</span>
        <span className="sm:hidden">Search…</span>
        <kbd className="ml-auto hidden items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search briefs or jump anywhere…" />
        <CommandList>
          <CommandEmpty>No matches.</CommandEmpty>

          <CommandGroup heading="Quick actions">
            <CommandItem onSelect={() => { setOpen(false); onNewBrief(); }}>
              <Plus className="mr-2 h-4 w-4" /> New brief
            </CommandItem>
            <CommandItem onSelect={() => go('/app/build')}>
              <Wand2 className="mr-2 h-4 w-4" /> Live builder
            </CommandItem>
            <CommandItem onSelect={() => go('/app/briefs')}>
              <FileText className="mr-2 h-4 w-4" /> All briefs
            </CommandItem>
            <CommandItem onSelect={() => go('/app/settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" /> Settings
            </CommandItem>
          </CommandGroup>

          {briefs.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent briefs">
                {briefs.map((b) => (
                  <CommandItem
                    key={b.id}
                    value={`${b.title} ${b.client_name ?? ''}`}
                    onSelect={() => go(`/app/briefs/${b.id}`)}
                  >
                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">{b.title}</span>
                    {b.client_name && (
                      <span className="ml-3 text-xs text-muted-foreground">{b.client_name}</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Account">
            <CommandItem onSelect={() => { setOpen(false); signOut(); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
