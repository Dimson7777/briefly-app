import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { structureNotes } from '@/services/structure';
import { FREE_LIMITS, isPro } from '@/services/billing';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };

const PROJECT_TYPES = [
  'Website', 'Web app', 'Brand identity', 'Landing page',
  'Mobile app', 'Marketing campaign', 'Content', 'Other',
];

export function NewBriefDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [projectType, setProjectType] = useState<string>('Website');
  const [deadline, setDeadline] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [rawNotes, setRawNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(''); setClientName(''); setClientCompany('');
    setProjectType('Website'); setDeadline('');
    setBudgetMin(''); setBudgetMax(''); setRawNotes('');
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Free plan limit
    if (!isPro(profile)) {
      const { count } = await supabase
        .from('briefs').select('id', { count: 'exact', head: true });
      if ((count ?? 0) >= FREE_LIMITS.briefs) {
        toast({
          title: 'Free plan limit reached',
          description: `Upgrade to Pro to create more than ${FREE_LIMITS.briefs} briefs.`,
          variant: 'destructive',
        });
        return;
      }
    }

    setBusy(true);
    try {
      const structured = rawNotes.trim() ? structureNotes(rawNotes) : null;

      const { data: brief, error } = await supabase.from('briefs').insert({
        user_id: user.id,
        title: title.trim() || 'Untitled brief',
        client_name: clientName.trim() || null,
        client_company: clientCompany.trim() || null,
        project_type: projectType || null,
        deadline: deadline || null,
        budget_min: budgetMin ? parseInt(budgetMin, 10) : null,
        budget_max: budgetMax ? parseInt(budgetMax, 10) : null,
        raw_notes: rawNotes.trim() || null,
        overview: structured?.overview ?? null,
        goals: structured?.goals ?? null,
        status: 'draft',
      }).select('id').single();

      if (error || !brief) throw error ?? new Error('No brief returned');

      // Seed scope items from structured notes
      if (structured) {
        if (structured.deliverables.length) {
          await supabase.from('deliverables').insert(
            structured.deliverables.map((d, i) => ({
              brief_id: brief.id, title: d, sort_order: i,
            })),
          );
        }
        if (structured.exclusions.length) {
          await supabase.from('exclusions').insert(
            structured.exclusions.map((c) => ({ brief_id: brief.id, content: c })),
          );
        }
        if (structured.assumptions.length) {
          await supabase.from('assumptions').insert(
            structured.assumptions.map((c) => ({ brief_id: brief.id, content: c })),
          );
        }
      }

      qc.invalidateQueries({ queryKey: ['briefs'] });
      onOpenChange(false);
      navigate(`/app/briefs/${brief.id}`);
      toast({
        title: 'Brief created',
        description: structured ? 'Notes structured. Refine in the editor.' : 'Open and start adding scope.',
      });
    } catch (err) {
      toast({
        title: 'Could not create brief',
        description: err instanceof Error ? err.message : 'Try again.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Sparkles className="h-5 w-5 text-primary" /> New brief
          </DialogTitle>
          <DialogDescription>
            Drop in raw client notes — Briefly will pull out an overview, deliverables,
            exclusions and assumptions for you to refine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Brief title *</Label>
              <Input
                id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Acme Co. — Website refresh" required maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cn">Client name</Label>
              <Input id="cn" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Jane Doe" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cc">Company</Label>
              <Input id="cc" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Acme Co." maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label>Project type</Label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dl">Deadline</Label>
              <Input id="dl" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bmin">Budget min ($)</Label>
              <Input id="bmin" type="number" inputMode="numeric" min={0} value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} placeholder="2000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bmax">Budget max ($)</Label>
              <Input id="bmax" type="number" inputMode="numeric" min={0} value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} placeholder="5000" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="raw" className="flex items-center gap-1.5">
              <Wand2 className="h-3.5 w-3.5 text-violet" /> Raw client notes (optional)
            </Label>
            <Textarea
              id="raw" rows={6} value={rawNotes}
              onChange={(e) => setRawNotes(e.target.value)}
              placeholder="Paste the email, slack thread or messy request. Briefly will turn it into a structured brief skeleton."
              className="font-mono text-xs"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create brief'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
