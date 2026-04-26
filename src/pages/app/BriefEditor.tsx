import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Eye, Plus, Trash2, Save, Calendar, Loader2,
  CheckCircle2, AlertCircle, Trash,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { QualityRing } from '@/components/QualityRing';
import { NextActions } from '@/components/NextActions';
import { useToast } from '@/hooks/use-toast';
import { evaluateBrief } from '@/services/quality';
import type {
  Brief, BriefStatus, Deliverable, Exclusion, Assumption, TimelineItem,
} from '@/types/brief';
import { STATUS_LABELS } from '@/types/brief';

type ScopeData = {
  deliverables: Deliverable[];
  exclusions: Exclusion[];
  assumptions: Assumption[];
  timeline: TimelineItem[];
};

export default function BriefEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [brief, setBrief] = useState<Brief | null>(null);
  const [scope, setScope] = useState<ScopeData>({
    deliverables: [], exclusions: [], assumptions: [], timeline: [],
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['brief', id],
    enabled: !!id,
    queryFn: async () => {
      const [b, d, e, a, t] = await Promise.all([
        supabase.from('briefs').select('*').eq('id', id!).maybeSingle(),
        supabase.from('deliverables').select('*').eq('brief_id', id!).order('sort_order'),
        supabase.from('exclusions').select('*').eq('brief_id', id!).order('created_at'),
        supabase.from('assumptions').select('*').eq('brief_id', id!).order('created_at'),
        supabase.from('timeline_items').select('*').eq('brief_id', id!).order('sort_order'),
      ]);
      if (b.error) throw b.error;
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
    if (data?.brief) {
      setBrief(data.brief);
      setScope({
        deliverables: data.deliverables,
        exclusions: data.exclusions,
        assumptions: data.assumptions,
        timeline: data.timeline,
      });
      setDirty(false);
      document.title = `${data.brief.title} · Briefly`;
    }
  }, [data]);

  const quality = useMemo(
    () => brief ? evaluateBrief(brief, {
      deliverables: scope.deliverables.length,
      exclusions: scope.exclusions.length,
      assumptions: scope.assumptions.length,
      timeline: scope.timeline.length,
    }) : null,
    [brief, scope],
  );

  if (isLoading || !brief || !quality) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data && !data.brief) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Brief not found.</p>
        <Button asChild variant="ghost" className="mt-4">
          <Link to="/app/briefs"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to briefs</Link>
        </Button>
      </div>
    );
  }

  const patch = (p: Partial<Brief>) => { setBrief({ ...brief, ...p }); setDirty(true); };

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('briefs')
      .update({
        title: brief.title,
        client_name: brief.client_name,
        client_company: brief.client_company,
        project_type: brief.project_type,
        deadline: brief.deadline,
        budget_min: brief.budget_min,
        budget_max: brief.budget_max,
        status: brief.status,
        overview: brief.overview,
        goals: brief.goals,
        revision_limit: brief.revision_limit,
        raw_notes: brief.raw_notes,
      })
      .eq('id', brief.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      return;
    }
    setDirty(false);
    qc.invalidateQueries({ queryKey: ['briefs'] });
    qc.invalidateQueries({ queryKey: ['brief', id] });
    toast({ title: 'Brief saved' });
  };

  // Deliverables
  const addDeliverable = async () => {
    const next = (scope.deliverables.at(-1)?.sort_order ?? -1) + 1;
    const { data: row, error } = await supabase
      .from('deliverables')
      .insert({ brief_id: brief.id, title: 'New deliverable', sort_order: next })
      .select().single();
    if (error) return toast({ title: 'Could not add', variant: 'destructive' });
    setScope((s) => ({ ...s, deliverables: [...s.deliverables, row as Deliverable] }));
  };
  const updateDeliverable = async (d: Deliverable, p: Partial<Deliverable>) => {
    setScope((s) => ({
      ...s,
      deliverables: s.deliverables.map((x) => (x.id === d.id ? { ...x, ...p } : x)),
    }));
    await supabase.from('deliverables').update(p).eq('id', d.id);
  };
  const removeDeliverable = async (id: string) => {
    setScope((s) => ({ ...s, deliverables: s.deliverables.filter((x) => x.id !== id) }));
    await supabase.from('deliverables').delete().eq('id', id);
  };

  // Exclusions
  const addExclusion = async () => {
    const { data: row, error } = await supabase
      .from('exclusions').insert({ brief_id: brief.id, content: '' }).select().single();
    if (error) return;
    setScope((s) => ({ ...s, exclusions: [...s.exclusions, row as Exclusion] }));
  };
  const updateExclusion = async (id: string, content: string) => {
    setScope((s) => ({ ...s, exclusions: s.exclusions.map((x) => (x.id === id ? { ...x, content } : x)) }));
    await supabase.from('exclusions').update({ content }).eq('id', id);
  };
  const removeExclusion = async (id: string) => {
    setScope((s) => ({ ...s, exclusions: s.exclusions.filter((x) => x.id !== id) }));
    await supabase.from('exclusions').delete().eq('id', id);
  };

  // Assumptions
  const addAssumption = async () => {
    const { data: row, error } = await supabase
      .from('assumptions').insert({ brief_id: brief.id, content: '' }).select().single();
    if (error) return;
    setScope((s) => ({ ...s, assumptions: [...s.assumptions, row as Assumption] }));
  };
  const updateAssumption = async (id: string, content: string) => {
    setScope((s) => ({ ...s, assumptions: s.assumptions.map((x) => (x.id === id ? { ...x, content } : x)) }));
    await supabase.from('assumptions').update({ content }).eq('id', id);
  };
  const removeAssumption = async (id: string) => {
    setScope((s) => ({ ...s, assumptions: s.assumptions.filter((x) => x.id !== id) }));
    await supabase.from('assumptions').delete().eq('id', id);
  };

  // Timeline
  const addTimeline = async () => {
    const next = (scope.timeline.at(-1)?.sort_order ?? -1) + 1;
    const { data: row, error } = await supabase
      .from('timeline_items')
      .insert({ brief_id: brief.id, label: 'Milestone', sort_order: next })
      .select().single();
    if (error) return;
    setScope((s) => ({ ...s, timeline: [...s.timeline, row as TimelineItem] }));
  };
  const updateTimeline = async (t: TimelineItem, p: Partial<TimelineItem>) => {
    setScope((s) => ({
      ...s,
      timeline: s.timeline.map((x) => (x.id === t.id ? { ...x, ...p } : x)),
    }));
    await supabase.from('timeline_items').update(p).eq('id', t.id);
  };
  const removeTimeline = async (id: string) => {
    setScope((s) => ({ ...s, timeline: s.timeline.filter((x) => x.id !== id) }));
    await supabase.from('timeline_items').delete().eq('id', id);
  };

  const handleNextAction = (key: string) => {
    const map: Record<string, { id: string; addFn?: () => void }> = {
      overview: { id: 'sec-overview' },
      goals: { id: 'sec-overview' },
      deliverables: { id: 'sec-deliverables', addFn: scope.deliverables.length === 0 ? addDeliverable : undefined },
      exclusions: { id: 'sec-exclusions', addFn: scope.exclusions.length === 0 ? addExclusion : undefined },
      assumptions: { id: 'sec-assumptions', addFn: scope.assumptions.length === 0 ? addAssumption : undefined },
      timeline: { id: 'sec-timeline', addFn: scope.timeline.length < 2 ? addTimeline : undefined },
      deadline: { id: 'sec-meta' },
      revisions: { id: 'sec-approval' },
      budget: { id: 'sec-meta' },
    };
    const target = map[key];
    if (!target) return;
    const el = document.getElementById(target.id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target.addFn?.();
  };

  const deleteBrief = async () => {
    const { error } = await supabase.from('briefs').delete().eq('id', brief.id);
    if (error) {
      toast({ title: 'Could not delete', description: error.message, variant: 'destructive' });
      return;
    }
    qc.invalidateQueries({ queryKey: ['briefs'] });
    qc.invalidateQueries({ queryKey: ['studio'] });
    toast({ title: 'Brief deleted' });
    navigate('/app/briefs');
  };

  return (
    <div className="anim-in mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/app/briefs"><ArrowLeft className="mr-1 h-4 w-4" /> Briefs</Link>
        </Button>
        <StatusBadge status={brief.status} />
        <div className="ml-auto flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                <Trash className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this brief?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete &ldquo;{brief.title}&rdquo; and all of its
                  deliverables, exclusions, assumptions, and timeline items. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteBrief}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete brief
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button asChild variant="outline" size="sm">
            <Link to={`/app/briefs/${brief.id}/preview`}><Eye className="mr-1.5 h-3.5 w-3.5" /> Preview</Link>
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
            Save
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="mt-6">
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Brief</p>
        <Input
          value={brief.title}
          onChange={(e) => patch({ title: e.target.value })}
          className="mt-1 h-auto border-0 bg-transparent px-0 font-display text-3xl font-semibold tracking-tight focus-visible:ring-0 sm:text-4xl"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Project meta */}
          <section id="sec-meta" className="panel scroll-mt-20 p-5">
            <h2 className="font-display text-lg font-semibold">Project details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Client name">
                <Input value={brief.client_name ?? ''} onChange={(e) => patch({ client_name: e.target.value || null })} />
              </Field>
              <Field label="Client company">
                <Input value={brief.client_company ?? ''} onChange={(e) => patch({ client_company: e.target.value || null })} />
              </Field>
              <Field label="Project type">
                <Input value={brief.project_type ?? ''} onChange={(e) => patch({ project_type: e.target.value || null })} placeholder="e.g. Marketing site" />
              </Field>
              <Field label="Deadline">
                <Input type="date" value={brief.deadline ?? ''} onChange={(e) => patch({ deadline: e.target.value || null })} />
              </Field>
              <Field label="Budget min ($)">
                <Input
                  type="number" inputMode="numeric"
                  value={brief.budget_min ?? ''}
                  onChange={(e) => patch({ budget_min: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
              <Field label="Budget max ($)">
                <Input
                  type="number" inputMode="numeric"
                  value={brief.budget_max ?? ''}
                  onChange={(e) => patch({ budget_max: e.target.value ? Number(e.target.value) : null })}
                />
              </Field>
            </div>
          </section>

          {/* Overview & goals */}
          <section id="sec-overview" className="panel scroll-mt-20 p-5">
            <h2 className="font-display text-lg font-semibold">Overview &amp; goals</h2>
            <div className="mt-4 space-y-4">
              <Field label="Project overview">
                <Textarea
                  rows={4}
                  value={brief.overview ?? ''}
                  onChange={(e) => patch({ overview: e.target.value || null })}
                  placeholder="One paragraph summarizing what this project is and why it matters."
                />
              </Field>
              <Field label="Goals">
                <Textarea
                  rows={4}
                  value={brief.goals ?? ''}
                  onChange={(e) => patch({ goals: e.target.value || null })}
                  placeholder="One goal per line."
                />
              </Field>
              <Field label="Raw client notes">
                <Textarea
                  rows={3}
                  value={brief.raw_notes ?? ''}
                  onChange={(e) => patch({ raw_notes: e.target.value || null })}
                  placeholder="The original messy request, kept for reference."
                  className="font-mono text-xs"
                />
              </Field>
            </div>
          </section>

          {/* Deliverables */}
          <section id="sec-deliverables" className="panel scroll-mt-20 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Deliverables</h2>
              <Button size="sm" variant="outline" onClick={addDeliverable}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {scope.deliverables.length === 0 && (
                <p className="text-sm text-muted-foreground">No deliverables yet.</p>
              )}
              {scope.deliverables.map((d) => (
                <div key={d.id} className="rounded-md border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={d.title}
                      onChange={(e) => updateDeliverable(d, { title: e.target.value })}
                      className="h-9 border-0 bg-transparent px-0 font-medium focus-visible:ring-0"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeDeliverable(d.id)} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <Textarea
                    value={d.description ?? ''}
                    onChange={(e) => updateDeliverable(d, { description: e.target.value || null })}
                    placeholder="Optional description"
                    className="mt-2 min-h-[60px] resize-none text-sm"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section id="sec-timeline" className="panel scroll-mt-20 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Timeline</h2>
              <Button size="sm" variant="outline" onClick={addTimeline}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add milestone
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {scope.timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">No milestones yet.</p>
              )}
              {scope.timeline.map((t) => (
                <div key={t.id} className="grid grid-cols-[1fr_160px_auto] items-center gap-2 rounded-md border border-border p-3">
                  <Input
                    value={t.label}
                    onChange={(e) => updateTimeline(t, { label: e.target.value })}
                    placeholder="Milestone"
                  />
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={t.due_date ?? ''}
                      onChange={(e) => updateTimeline(t, { due_date: e.target.value || null })}
                      className="pl-8"
                    />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => removeTimeline(t.id)} aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          {/* Exclusions & assumptions */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section id="sec-exclusions" className="panel scroll-mt-20 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Out of scope</h2>
                <Button size="sm" variant="outline" onClick={addExclusion}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {scope.exclusions.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nothing excluded yet.</p>
                )}
                {scope.exclusions.map((x) => (
                  <div key={x.id} className="flex items-center gap-2">
                    <Input
                      value={x.content}
                      onChange={(e) => updateExclusion(x.id, e.target.value)}
                      placeholder="e.g. Native iOS app"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeExclusion(x.id)} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <section id="sec-assumptions" className="panel scroll-mt-20 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Assumptions</h2>
                <Button size="sm" variant="outline" onClick={addAssumption}>
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {scope.assumptions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No assumptions logged.</p>
                )}
                {scope.assumptions.map((a) => (
                  <div key={a.id} className="flex items-center gap-2">
                    <Input
                      value={a.content}
                      onChange={(e) => updateAssumption(a.id, e.target.value)}
                      placeholder="e.g. Client provides final copy"
                    />
                    <Button size="icon" variant="ghost" onClick={() => removeAssumption(a.id)} aria-label="Remove">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Side rail */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Quality score */}
          <section className="panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Quality score</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Based on what every solid brief should include.
                </p>
                <p className="mt-2 text-xs">
                  <span className="font-medium capitalize">{quality.band}</span>
                  <span className="text-muted-foreground"> · {quality.checks.filter((c) => c.passed).length}/{quality.checks.length} checks passed</span>
                </p>
              </div>
              <QualityRing result={quality} size={72} stroke={6} />
            </div>
          </section>

          {/* Next actions */}
          <NextActions result={quality} onAction={handleNextAction} />

          {/* Scope gaps */}
          <section className="panel p-5">
            <h2 className="font-display text-lg font-semibold">Scope gaps</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {quality.gaps.length === 0 ? 'No gaps — this brief is airtight.' : 'Fix these to reduce scope creep.'}
            </p>
            <ul className="mt-3 space-y-2">
              {quality.gaps.length === 0 ? (
                <li className="flex items-center gap-2 rounded-md border border-status-approved/30 bg-status-approved/10 px-3 py-2 text-sm text-status-approved">
                  <CheckCircle2 className="h-4 w-4" /> All checks passed
                </li>
              ) : quality.gaps.map((g) => (
                <li key={g.key} className="rounded-md border border-border bg-surface-elev/40 p-2.5">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-changes" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{g.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{g.hint}</p>
                    </div>
                  </div>
                </li>
              ))}
              {quality.checks.filter((c) => c.passed).slice(0, 3).map((c) => (
                <li key={c.key} className="flex items-start gap-2 px-2.5 text-xs text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-approved/80" />
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Approval */}
          <section id="sec-approval" className="panel scroll-mt-20 p-5">
            <h2 className="font-display text-lg font-semibold">Approval</h2>
            <div className="mt-3 space-y-3">
              <Field label="Status">
                <Select value={brief.status} onValueChange={(v) => patch({ status: v as BriefStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as BriefStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Revision limit">
                <Input
                  type="number" min={0} max={20}
                  value={brief.revision_limit ?? 2}
                  onChange={(e) => patch({ revision_limit: Number(e.target.value) })}
                />
              </Field>
            </div>
          </section>

          <Button asChild variant="outline" className="w-full">
            <Link to={`/app/briefs/${brief.id}/preview`}>
              <Eye className="mr-1.5 h-4 w-4" /> Preview brief
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
