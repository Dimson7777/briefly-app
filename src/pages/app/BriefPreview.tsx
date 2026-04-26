import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Pencil, Printer, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { isPro } from '@/services/billing';
import { formatDate } from '@/utils/format';
import type {
  Brief, Deliverable, Exclusion, Assumption, TimelineItem,
} from '@/types/brief';

export default function BriefPreview() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useProfile();

  const { data, isLoading } = useQuery({
    queryKey: ['brief-preview', id],
    enabled: !!id,
    queryFn: async () => {
      const [b, d, e, a, t] = await Promise.all([
        supabase.from('briefs').select('*').eq('id', id!).maybeSingle(),
        supabase.from('deliverables').select('*').eq('brief_id', id!).order('sort_order'),
        supabase.from('exclusions').select('*').eq('brief_id', id!).order('created_at'),
        supabase.from('assumptions').select('*').eq('brief_id', id!).order('created_at'),
        supabase.from('timeline_items').select('*').eq('brief_id', id!).order('sort_order'),
      ]);
      return {
        brief: b.data as Brief | null,
        deliverables: (d.data ?? []) as Deliverable[],
        exclusions: (e.data ?? []) as Exclusion[],
        assumptions: (a.data ?? []) as Assumption[],
        timeline: (t.data ?? []) as TimelineItem[],
      };
    },
  });

  useEffect(() => {
    if (data?.brief) document.title = `${data.brief.title} · Preview`;
  }, [data]);

  if (isLoading || !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!data.brief) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Brief not found.</p>
      </div>
    );
  }

  const { brief, deliverables, exclusions, assumptions, timeline } = data;
  const showWatermark = !isPro(profile);
  const goalsList = (brief.goals ?? '').split('\n').map((g) => g.trim()).filter(Boolean);

  const budget = brief.budget_min || brief.budget_max
    ? `${brief.budget_min ? '$' + brief.budget_min.toLocaleString() : '?'} – ${brief.budget_max ? '$' + brief.budget_max.toLocaleString() : '?'}`
    : null;

  return (
    <div className="anim-in mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 print:p-0">
      {/* Toolbar (hidden on print) */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/app/briefs/${brief.id}`}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Link>
        </Button>
        <StatusBadge status={brief.status} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Print / PDF
          </Button>
          <Button asChild size="sm">
            <Link to={`/app/briefs/${brief.id}`}><Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
          </Button>
        </div>
      </div>

      {/* Paper */}
      <article className="paper relative mt-6 rounded-lg p-8 sm:p-12 print:mt-0 print:rounded-none print:p-10">
        {showWatermark && (
          <div className="pointer-events-none absolute right-6 top-6 text-[10px] font-medium uppercase tracking-widest text-black/30">
            Made with Briefly
          </div>
        )}

        <header>
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/50">
            Project brief · {formatDate(brief.created_at)}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {brief.title}
          </h1>
          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-black/10 pt-4 text-sm sm:grid-cols-4">
            <Meta label="Client" value={brief.client_name || '—'} />
            <Meta label="Company" value={brief.client_company || '—'} />
            <Meta label="Type" value={brief.project_type || '—'} />
            <Meta label="Deadline" value={brief.deadline ? formatDate(brief.deadline) : '—'} />
            {budget && <Meta label="Budget" value={budget} />}
            <Meta label="Revisions" value={String(brief.revision_limit ?? 2)} />
          </div>
        </header>

        {brief.overview && (
          <Section title="Project overview">
            <p className="whitespace-pre-wrap leading-relaxed">{brief.overview}</p>
          </Section>
        )}

        {goalsList.length > 0 && (
          <Section title="Goals">
            <ul className="space-y-2">
              {goalsList.map((g, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black/60" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {deliverables.length > 0 && (
          <Section title="Deliverables">
            <ol className="space-y-3">
              {deliverables.map((d, i) => (
                <li key={d.id} className="flex gap-4">
                  <span className="font-mono text-xs text-black/40 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                  <div className="flex-1">
                    <p className="font-medium">{d.title}</p>
                    {d.description && (
                      <p className="mt-0.5 text-sm leading-relaxed text-black/70">{d.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {timeline.length > 0 && (
          <Section title="Timeline">
            <ul className="space-y-2">
              {timeline.map((t) => (
                <li key={t.id} className="flex items-baseline justify-between border-b border-dashed border-black/15 pb-2 last:border-0">
                  <span>{t.label}</span>
                  <span className="font-mono text-xs text-black/60">
                    {t.due_date ? formatDate(t.due_date) : 'TBD'}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {exclusions.length > 0 && (
          <Section title="Out of scope">
            <ul className="space-y-1.5">
              {exclusions.map((x) => (
                <li key={x.id} className="flex gap-3">
                  <span className="font-mono text-black/40">×</span>
                  <span>{x.content}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {assumptions.length > 0 && (
          <Section title="Assumptions">
            <ul className="space-y-1.5">
              {assumptions.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="font-mono text-black/40">·</span>
                  <span>{a.content}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Approval">
          <p className="text-sm leading-relaxed">
            By approving this brief, the client confirms the scope, deliverables and timeline above.
            Up to <strong>{brief.revision_limit ?? 2}</strong> rounds of revision are included per deliverable.
            Anything outside this scope is treated as a separate engagement.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <SignBlock label="Client signature" />
            <SignBlock label="Date" />
          </div>
        </Section>
      </article>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-black/50">{label}</dt>
      <dd className="mt-0.5 truncate">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-black/85">{children}</div>
    </section>
  );
}

function SignBlock({ label }: { label: string }) {
  return (
    <div>
      <div className="h-12 border-b border-black/40" />
      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-black/50">{label}</p>
    </div>
  );
}
