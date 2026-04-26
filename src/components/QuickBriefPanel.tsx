import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Wand2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { structureNotes } from '@/services/structure';
import { FREE_LIMITS, isPro } from '@/services/billing';

const SAMPLE = `Hey — we're a small DTC skincare brand and we need a new website by mid-July.
Should have a homepage, product pages, a blog, and integrate with Shopify.
We don't need a mobile app. Assume you're using our existing brand colors.
Budget is around $4-6k. Goal is to lift conversion from 1.2% to over 2%.`;

type Props = { onCreated?: (id: string) => void };

export function QuickBriefPanel({ onCreated }: Props) {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!notes.trim()) {
      toast({ title: 'Paste some notes first', description: 'Or click "Try a sample".' });
      return;
    }

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
      const structured = structureNotes(notes);
      const briefTitle = title.trim() || derivedTitle(notes);

      const { data: brief, error } = await supabase.from('briefs').insert({
        user_id: user.id,
        title: briefTitle,
        raw_notes: notes,
        overview: structured.overview,
        goals: structured.goals,
        status: 'draft',
      }).select('id').single();

      if (error || !brief) throw error ?? new Error('Insert failed');

      if (structured.deliverables.length) {
        await supabase.from('deliverables').insert(
          structured.deliverables.map((d, i) => ({ brief_id: brief.id, title: d, sort_order: i })),
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

      qc.invalidateQueries({ queryKey: ['briefs'] });
      onCreated?.(brief.id);
      navigate(`/app/briefs/${brief.id}`);
      toast({ title: 'Brief drafted', description: 'Open and refine the structure.' });
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
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-surface-elev/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-violet" />
          <span className="font-mono text-[11px] uppercase tracking-wider">Quick brief</span>
        </div>
        <button
          type="button"
          onClick={() => setNotes(SAMPLE)}
          className="text-[11px] text-muted-foreground transition hover:text-foreground"
        >
          Try a sample →
        </button>
      </div>

      <div className="space-y-3 p-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Brief title (optional)"
          maxLength={120}
          className="h-9"
        />
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={7}
          placeholder="Paste a messy email, Slack thread, or call notes…"
          className="resize-none font-mono text-xs leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            We'll extract goals, deliverables &amp; exclusions.
          </p>
          <Button size="sm" onClick={submit} disabled={busy}>
            {busy ? (
              <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Drafting…</>
            ) : (
              <>Draft brief <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}

function derivedTitle(notes: string): string {
  const first = notes.trim().split(/[.\n]/)[0].trim();
  if (first.length > 8 && first.length <= 80) return first;
  return 'Untitled brief';
}
