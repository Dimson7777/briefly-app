import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import {
  FileText, Plus, ArrowUpRight, Sparkles, CheckCircle2, Circle,
  Clock, AlertTriangle, Activity, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { StatusBadge } from '@/components/StatusBadge';
import { QualityRing } from '@/components/QualityRing';
import { QuickBriefPanel } from '@/components/QuickBriefPanel';
import { evaluateBrief } from '@/services/quality';
import { daysUntil, formatRelative } from '@/utils/format';
import type { Brief } from '@/types/brief';
import type { ShellContext } from '@/components/AppShell';
import { cn } from '@/lib/utils';

type ScopeRow = { brief_id: string };

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const ctx = useOutletContext<ShellContext>();

  useEffect(() => { document.title = 'Studio · Briefly'; }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['studio', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [b, d, e, a, t] = await Promise.all([
        supabase.from('briefs').select('*').order('updated_at', { ascending: false }),
        supabase.from('deliverables').select('brief_id'),
        supabase.from('exclusions').select('brief_id'),
        supabase.from('assumptions').select('brief_id'),
        supabase.from('timeline_items').select('brief_id'),
      ]);
      return {
        briefs: (b.data ?? []) as Brief[],
        deliverables: (d.data ?? []) as ScopeRow[],
        exclusions: (e.data ?? []) as ScopeRow[],
        assumptions: (a.data ?? []) as ScopeRow[],
        timeline: (t.data ?? []) as ScopeRow[],
      };
    },
  });

  const briefs = data?.briefs ?? [];

  const countsByBrief = useMemo(() => {
    const m: Record<string, { deliverables: number; exclusions: number; assumptions: number; timeline: number }> = {};
    for (const b of briefs) m[b.id] = { deliverables: 0, exclusions: 0, assumptions: 0, timeline: 0 };
    data?.deliverables.forEach((r) => m[r.brief_id] && m[r.brief_id].deliverables++);
    data?.exclusions.forEach((r) => m[r.brief_id] && m[r.brief_id].exclusions++);
    data?.assumptions.forEach((r) => m[r.brief_id] && m[r.brief_id].assumptions++);
    data?.timeline.forEach((r) => m[r.brief_id] && m[r.brief_id].timeline++);
    return m;
  }, [briefs, data]);

  const scored = useMemo(
    () => briefs.map((b) => ({
      brief: b,
      quality: evaluateBrief(b, countsByBrief[b.id] ?? { deliverables: 0, exclusions: 0, assumptions: 0, timeline: 0 }),
    })),
    [briefs, countsByBrief],
  );

  const avgScore = scored.length
    ? Math.round(scored.reduce((s, x) => s + x.quality.score, 0) / scored.length)
    : 0;

  const activeBriefs = scored.filter(({ brief: b }) => b.status === 'draft' || b.status === 'sent').slice(0, 4);
  const upcomingApprovals = scored
    .filter(({ brief: b }) => b.deadline)
    .map((x) => ({ ...x, days: daysUntil(x.brief.deadline)! }))
    .filter((x) => x.days >= -7 && x.days <= 30)
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);

  const activity = useMemo(() => buildActivity(briefs), [briefs]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 sm:px-6">
        <div className="h-8 w-64 rounded bg-secondary" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="h-72 rounded-md bg-secondary/60" />
          <div className="h-72 rounded-md bg-secondary/60" />
        </div>
      </div>
    );
  }

  if (briefs.length === 0) {
    return <EmptyStudio onCreate={ctx.openNewBrief} name={profile?.full_name} />;
  }

  return (
    <div className="anim-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* ----- Studio header ----- */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Brief Studio
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {greeting()}, {(profile?.full_name?.split(' ')[0] ?? 'there').slice(0, 24)}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {scored.length} brief{scored.length === 1 ? '' : 's'} ·{' '}
            average quality <span className="font-medium text-foreground">{avgScore}</span>/100
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/briefs">All briefs <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
          <Button size="sm" onClick={ctx.openNewBrief}>
            <Plus className="mr-1.5 h-4 w-4" /> New brief
          </Button>
        </div>
      </div>

      {/* ----- 3-zone canvas + quick brief ----- */}
      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]">
        {/* Left: 3 zones stacked */}
        <div className="space-y-6">
          {/* Zone 1: Active briefs */}
          <section className="panel overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-3">
              <div>
                <h2 className="font-display text-base font-semibold">Active drafts</h2>
                <p className="text-xs text-muted-foreground">Briefs in flight or awaiting client review.</p>
              </div>
              <Link to="/app/briefs" className="text-xs text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </header>
            {activeBriefs.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                Nothing active. All your briefs are approved or archived.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {activeBriefs.map(({ brief, quality }) => (
                  <li key={brief.id}>
                    <Link
                      to={`/app/briefs/${brief.id}`}
                      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 transition hover:bg-surface-elev/40"
                    >
                      <QualityRing result={quality} size={48} stroke={4} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium">{brief.title}</p>
                          <StatusBadge status={brief.status} className="hidden sm:inline-flex" />
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {brief.client_company || brief.client_name || 'No client set'}
                          {' · updated '}{formatRelative(brief.updated_at)}
                          {quality.gaps.length > 0 && ` · ${quality.gaps.length} gap${quality.gaps.length === 1 ? '' : 's'}`}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Zone 2 + 3 side by side on lg */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Zone 2: Quality checklist (workspace-wide) */}
            <section className="panel p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold">Quality across briefs</h2>
                  <p className="text-xs text-muted-foreground">How rigorous your scopes are.</p>
                </div>
                <div className={cn('font-display text-3xl font-semibold tabular-nums', bandColor(avgScore))}>
                  {avgScore}
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {workspaceChecklist(scored).map((c) => (
                  <li key={c.key} className="flex items-start gap-2.5 text-sm">
                    {c.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-approved" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn(c.passed && 'text-muted-foreground line-through decoration-1')}>
                        {c.label}
                      </p>
                      {!c.passed && c.cta && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{c.cta}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Zone 3: Upcoming approvals */}
            <section className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-base font-semibold">Upcoming approvals</h2>
                  <p className="text-xs text-muted-foreground">Next 30 days.</p>
                </div>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              {upcomingApprovals.length === 0 ? (
                <div className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                  Nothing on the horizon.
                </div>
              ) : (
                <ol className="space-y-2">
                  {upcomingApprovals.map(({ brief, days }) => (
                    <li key={brief.id}>
                      <Link
                        to={`/app/briefs/${brief.id}`}
                        className="flex items-center gap-3 rounded-md border border-border bg-surface-elev/30 p-2.5 transition hover:border-primary/40"
                      >
                        <div className={cn(
                          'flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-md font-mono text-[10px] uppercase',
                          days < 0 ? 'bg-destructive/15 text-destructive' :
                          days <= 7 ? 'bg-status-changes/15 text-status-changes' :
                          'bg-secondary text-foreground/80',
                        )}>
                          <span className="text-sm font-semibold leading-none">{Math.abs(days)}</span>
                          <span className="mt-0.5 text-[8px] leading-none">{days < 0 ? 'late' : 'days'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{brief.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{brief.client_name ?? '—'}</p>
                        </div>
                        <StatusBadge status={brief.status} className="hidden sm:inline-flex" />
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          {/* Activity strip */}
          <section className="panel p-5">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="font-display text-base font-semibold">Recent activity</h2>
            </div>
            <ol className="relative space-y-3 border-l border-border pl-4">
              {activity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary/70" />
                  <p className="text-sm">
                    <Link to={`/app/briefs/${a.briefId}`} className="font-medium hover:underline">
                      {a.title}
                    </Link>
                    <span className="text-muted-foreground"> · {a.label}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatRelative(a.at)}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Right rail: Quick brief */}
        <aside className="space-y-6 xl:sticky xl:top-20 xl:self-start">
          <QuickBriefPanel />

          {/* Stats summary */}
          <section className="panel p-5">
            <h3 className="font-display text-base font-semibold">Workspace</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <Row label="Total briefs" value={scored.length} />
              <Row label="In flight" value={scored.filter((s) => s.brief.status === 'draft' || s.brief.status === 'sent').length} />
              <Row label="Approved" value={scored.filter((s) => s.brief.status === 'approved').length} />
              <Row label="Need changes" value={scored.filter((s) => s.brief.status === 'needs_changes').length} accent={scored.some((s) => s.brief.status === 'needs_changes')} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function bandColor(score: number) {
  if (score >= 80) return 'text-status-approved';
  if (score >= 50) return 'text-status-changes';
  return 'text-destructive';
}

function workspaceChecklist(
  scored: { brief: Brief; quality: ReturnType<typeof evaluateBrief> }[],
): { key: string; label: string; passed: boolean; cta?: string }[] {
  const total = scored.length;
  if (total === 0) return [];
  const withGoals = scored.filter((s) => s.quality.checks.find((c) => c.key === 'goals')?.passed).length;
  const withExclusions = scored.filter((s) => s.quality.checks.find((c) => c.key === 'exclusions')?.passed).length;
  const withTimeline = scored.filter((s) => s.quality.checks.find((c) => c.key === 'timeline')?.passed).length;
  const withDeadline = scored.filter((s) => s.quality.checks.find((c) => c.key === 'deadline')?.passed).length;
  const withRevisions = scored.filter((s) => s.quality.checks.find((c) => c.key === 'revisions')?.passed).length;

  return [
    { key: 'goals', label: `Goals defined (${withGoals}/${total})`, passed: withGoals === total, cta: 'Open a brief and write at least one outcome.' },
    { key: 'exclusions', label: `Out-of-scope listed (${withExclusions}/${total})`, passed: withExclusions === total, cta: 'Protect yourself — name what is NOT in scope.' },
    { key: 'timeline', label: `Timelines set (${withTimeline}/${total})`, passed: withTimeline === total, cta: 'Add at least 2 milestones per brief.' },
    { key: 'deadline', label: `Approval deadlines set (${withDeadline}/${total})`, passed: withDeadline === total, cta: 'A real date keeps reviews from drifting.' },
    { key: 'revisions', label: `Revision limits capped (${withRevisions}/${total})`, passed: withRevisions === total, cta: 'Cap rounds before scope creep.' },
  ];
}

type ActivityItem = { id: string; briefId: string; title: string; label: string; at: string };
function buildActivity(briefs: Brief[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const b of briefs) {
    items.push({ id: `c-${b.id}`, briefId: b.id, title: b.title, label: 'created', at: b.created_at });
    if (b.updated_at !== b.created_at) {
      items.push({ id: `u-${b.id}`, briefId: b.id, title: b.title, label: `updated · ${b.status.replace('_', ' ')}`, at: b.updated_at });
    }
  }
  return items.sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 6);
}

function Row({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('font-mono tabular-nums', accent && value > 0 && 'text-status-changes')}>{value}</dd>
    </div>
  );
}

/* ---------------- empty state ---------------- */

function EmptyStudio({ onCreate, name }: { onCreate: () => void; name?: string | null }) {
  const firstName = name?.split(' ')[0] ?? null;

  return (
    <div className="anim-in mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Brief Studio
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome{firstName ? `, ${firstName}` : ''}.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Briefly turns messy client requests into structured scopes you can send. Start by
          pasting a real email — or create one from scratch.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        {/* Left: onboarding + sample preview */}
        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-display text-base font-semibold">Get set up</h2>
            </div>
            <ol className="mt-4 space-y-3">
              <Step n={1} title="Draft your first brief" desc="Paste any client message into the Quick Brief panel." />
              <Step n={2} title="Refine scope" desc="Edit deliverables, timeline, and exclusions in the brief editor." />
              <Step n={3} title="Send for approval" desc="Mark as sent — track status, deadlines, and revision limits." />
            </ol>
            <div className="mt-5 flex items-center gap-2">
              <Button onClick={onCreate}>
                <Plus className="mr-1.5 h-4 w-4" /> Create from scratch
              </Button>
              <Button variant="outline" asChild>
                <Link to="/app/billing">See plans</Link>
              </Button>
            </div>
          </section>

          {/* Sample preview */}
          <section className="panel overflow-hidden">
            <header className="flex items-center justify-between border-b border-border px-5 py-2.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                Example: messy notes → structured brief
              </span>
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                preview
              </span>
            </header>
            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-border bg-surface-elev/30 p-5 md:border-b-0 md:border-r">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Client email
                </p>
                <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground/85">
{`Hey — we need a new website by July.
Should have homepage + product pages,
a blog, and Shopify integration.
We don't need a mobile app.
Assume you'll use our brand colors.
Budget around $4-6k. Goal: lift
conversion from 1.2% to over 2%.`}
                </pre>
              </div>
              <div className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Briefly extracts
                </p>
                <div className="mt-3 space-y-3 text-sm">
                  <ExtractRow label="Goal" value="Lift conversion from 1.2% to 2%+" />
                  <ExtractRow label="Deliverables" value="Homepage · Product pages · Blog · Shopify integration" />
                  <ExtractRow label="Out of scope" value="Mobile app" />
                  <ExtractRow label="Assumption" value="Existing brand colors will be used" />
                  <ExtractRow label="Budget" value="$4,000 – $6,000" />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: quick brief panel */}
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <QuickBriefPanel />
          <div className="mt-4 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mr-1.5 inline h-3 w-3 text-status-changes" />
            Free plan includes 5 briefs and a small watermark on previews.
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[11px]">
        {n}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
    </li>
  );
}

function ExtractRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-3">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-pretty">{value}</span>
    </div>
  );
}
