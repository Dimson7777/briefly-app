import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Wand2, ArrowRight, Loader2, Trash2, Target, Package,
  Ban, Lightbulb, Sparkles, Copy, Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { structureNotes, type Structured } from '@/services/structure';
import { FREE_LIMITS, isPro } from '@/services/billing';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const SAMPLES: Record<string, { title: string; text: string }> = {
  ecommerce: {
    title: 'DTC skincare site',
    text: `Hey — we're a small DTC skincare brand and we need a new website by mid-July.
Should have a homepage, product pages, a blog, and integrate with Shopify.
We don't need a mobile app right now. Assume you're using our existing brand colors.
Budget is around $4-6k. Goal is to lift conversion from 1.2% to over 2%.
Out of scope: paid ads management, photography.`,
  },
  saas: {
    title: 'SaaS marketing site',
    text: `We need to redesign our marketing site before our Series A announcement in 6 weeks.
Build the homepage, pricing page, customer stories, and a docs landing page.
We will not be migrating the docs themselves — that's a separate project.
Goal: triple the demo request rate and clearly explain what we do.
Assume copy is provided. Budget is $8-12k.`,
  },
  brand: {
    title: 'Brand identity refresh',
    text: `Looking for a refreshed brand identity ahead of our spring launch.
Need a new logo, color palette, type system, and a one-page brand guidelines PDF.
We don't need new packaging design. Assume final approval from CEO only.
Goal: feel more premium without losing our playful tone. Deadline is end of March.`,
  },
};

export default function LiveBuilder() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { document.title = 'Live builder · Briefly'; }, []);

  // Real-time structuring (deterministic, instant, no API calls)
  const structured: Structured = useMemo(
    () => notes.trim().length > 12
      ? structureNotes(notes)
      : { overview: '', goals: '', deliverables: [], exclusions: [], assumptions: [] },
    [notes],
  );

  const totalExtracted =
    (structured.goals ? 1 : 0) +
    structured.deliverables.length +
    structured.exclusions.length +
    structured.assumptions.length;

  const loadSample = (key: keyof typeof SAMPLES) => {
    const s = SAMPLES[key];
    setNotes(s.text);
    setTitle(s.title);
    setClient('');
  };

  const reset = () => { setNotes(''); setTitle(''); setClient(''); };

  const copyStructured = async () => {
    const text = formatAsMarkdown(structured, title);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Structured brief copied');
    setTimeout(() => setCopied(false), 1800);
  };

  const saveBrief = async () => {
    if (!user) return;
    if (!notes.trim()) { toast.error('Paste some notes first'); return; }
    if (totalExtracted === 0) { toast.error('Add a bit more context — nothing was extracted yet'); return; }

    if (!isPro(profile)) {
      const { count } = await supabase.from('briefs').select('id', { count: 'exact', head: true });
      if ((count ?? 0) >= FREE_LIMITS.briefs) {
        toast.error(`Free plan limit reached (${FREE_LIMITS.briefs} briefs). Upgrade to Pro for more.`);
        return;
      }
    }

    setBusy(true);
    try {
      const { data: brief, error } = await supabase.from('briefs').insert({
        user_id: user.id,
        title: title.trim() || 'Untitled brief',
        client_name: client.trim() || null,
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
      qc.invalidateQueries({ queryKey: ['studio'] });
      toast.success('Brief saved — opening editor');
      navigate(`/app/briefs/${brief.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save brief');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="anim-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Live builder
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Paste it. Watch it sort itself.
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Drop in a real client email or call notes — Briefly pulls out goals,
            deliverables, exclusions and assumptions as you type.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {notes && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyStructured} disabled={totalExtracted === 0}>
            {copied ? <Check className="mr-1.5 h-3.5 w-3.5 text-status-approved" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
            Copy markdown
          </Button>
          <Button size="sm" onClick={saveBrief} disabled={busy || totalExtracted === 0}>
            {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
            Save as brief
          </Button>
        </div>
      </div>

      {/* Sample chips */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Try a sample:
        </span>
        {Object.entries(SAMPLES).map(([key, s]) => (
          <button
            key={key}
            onClick={() => loadSample(key as keyof typeof SAMPLES)}
            className="ring-focus rounded-full border border-border bg-surface-elev/40 px-3 py-1 text-xs transition hover:border-primary/50 hover:bg-surface-elev hover:text-primary"
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Split view */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* Left: input */}
        <section className="panel relative flex h-full min-h-[640px] flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5 text-violet" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Raw client notes</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {notes.length} chars
            </span>
          </header>

          <div className="space-y-3 border-b border-border p-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief title (optional)"
              maxLength={120}
              className="h-9"
            />
            <Input
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Client name (optional)"
              maxLength={80}
              className="h-9"
            />
          </div>

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={`Paste an email, Slack thread, or call notes here.\n\nExample:\n"Hey — we need a new website by July.\nHomepage, product pages, blog, Shopify integration.\nWe don't need a mobile app. Budget around $4-6k..."`}
            className="flex-1 resize-none rounded-none border-0 bg-transparent p-4 font-mono text-xs leading-relaxed focus-visible:ring-0"
          />
        </section>

        {/* Right: structured output */}
        <section className="panel flex h-full min-h-[640px] flex-col overflow-hidden">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-wider">Structured brief</span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
              {totalExtracted} item{totalExtracted === 1 ? '' : 's'} extracted
            </span>
          </header>

          {totalExtracted === 0 ? (
            <EmptyPreview />
          ) : (
            <div className="flex-1 space-y-5 overflow-y-auto p-5 scrollbar-thin">
              {structured.overview && (
                <Block label="Overview" icon={null} className="border-l-2 border-violet/40 pl-3">
                  <p className="text-sm leading-relaxed text-foreground/90">{structured.overview}</p>
                </Block>
              )}

              {structured.goals && (
                <Block label="Goal" icon={Target} accent="text-status-approved">
                  <p className="text-sm leading-relaxed">{structured.goals}</p>
                </Block>
              )}

              {structured.deliverables.length > 0 && (
                <Block label={`Deliverables (${structured.deliverables.length})`} icon={Package} accent="text-primary">
                  <ul className="space-y-1.5">
                    {structured.deliverables.map((d, i) => (
                      <ExtractedItem key={i} index={i} text={d} />
                    ))}
                  </ul>
                </Block>
              )}

              {structured.exclusions.length > 0 && (
                <Block label={`Out of scope (${structured.exclusions.length})`} icon={Ban} accent="text-destructive">
                  <ul className="space-y-1.5">
                    {structured.exclusions.map((d, i) => (
                      <ExtractedItem key={i} index={i} text={d} />
                    ))}
                  </ul>
                </Block>
              )}

              {structured.assumptions.length > 0 && (
                <Block label={`Assumptions (${structured.assumptions.length})`} icon={Lightbulb} accent="text-status-changes">
                  <ul className="space-y-1.5">
                    {structured.assumptions.map((d, i) => (
                      <ExtractedItem key={i} index={i} text={d} />
                    ))}
                  </ul>
                </Block>
              )}

              <div className="border-t border-border pt-4">
                <Button onClick={saveBrief} disabled={busy} className="w-full">
                  {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                  Save as brief <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ---------- subcomponents ---------- */

function Block({
  label, icon: Icon, accent, className, children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }> | null;
  accent?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('animate-fade-in', className)}>
      <div className="mb-2 flex items-center gap-1.5">
        {Icon && <Icon className={cn('h-3.5 w-3.5', accent ?? 'text-muted-foreground')} />}
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function ExtractedItem({ text, index }: { text: string; index: number }) {
  return (
    <li
      className="flex items-start gap-2 rounded-md border border-border/60 bg-surface-elev/30 px-3 py-2 text-sm transition hover:border-border hover:bg-surface-elev/60"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
      <span className="text-foreground/90">{text}</span>
    </li>
  );
}

function EmptyPreview() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border">
        <Wand2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="mt-4 max-w-xs text-sm text-muted-foreground">
        Start typing on the left — extracted items will appear here in real time.
      </p>
      <ul className="mt-4 space-y-1 text-left font-mono text-[11px] text-muted-foreground/80">
        <li>• Words like &ldquo;build&rdquo; or &ldquo;deliver&rdquo; → deliverables</li>
        <li>• &ldquo;not include&rdquo;, &ldquo;out of scope&rdquo; → exclusions</li>
        <li>• &ldquo;assume&rdquo;, &ldquo;expect&rdquo; → assumptions</li>
      </ul>
    </div>
  );
}

function formatAsMarkdown(s: Structured, title: string): string {
  const lines: string[] = [];
  if (title) lines.push(`# ${title}`, '');
  if (s.overview) lines.push('## Overview', s.overview, '');
  if (s.goals) lines.push('## Goals', s.goals, '');
  if (s.deliverables.length) {
    lines.push('## Deliverables');
    s.deliverables.forEach((d) => lines.push(`- ${d}`));
    lines.push('');
  }
  if (s.exclusions.length) {
    lines.push('## Out of scope');
    s.exclusions.forEach((d) => lines.push(`- ${d}`));
    lines.push('');
  }
  if (s.assumptions.length) {
    lines.push('## Assumptions');
    s.assumptions.forEach((d) => lines.push(`- ${d}`));
    lines.push('');
  }
  return lines.join('\n');
}
