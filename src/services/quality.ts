/**
 * Brief Quality Score + Scope Gaps
 * Deterministic heuristic — no AI. Each signal contributes a fixed weight,
 * so the score is explainable and stable across renders.
 */

import type { Brief } from '@/types/brief';

export type ScopeCounts = {
  deliverables: number;
  exclusions: number;
  assumptions: number;
  timeline: number;
};

export type QualityCheck = {
  key: string;
  label: string;
  hint: string;
  weight: number;
  passed: boolean;
};

export type QualityResult = {
  score: number; // 0-100
  band: 'low' | 'medium' | 'high';
  checks: QualityCheck[];
  gaps: QualityCheck[];
};

export function evaluateBrief(brief: Brief, counts: ScopeCounts): QualityResult {
  const checks: QualityCheck[] = [
    {
      key: 'overview',
      label: 'Project overview written',
      hint: 'Add a paragraph summarizing what this engagement is.',
      weight: 12,
      passed: !!brief.overview && brief.overview.trim().length >= 40,
    },
    {
      key: 'goals',
      label: 'Clear goals defined',
      hint: 'List the outcomes the client cares about.',
      weight: 14,
      passed: !!brief.goals && brief.goals.trim().length >= 20,
    },
    {
      key: 'deliverables',
      label: 'At least 2 deliverables',
      hint: 'Concrete outputs you will hand over.',
      weight: 18,
      passed: counts.deliverables >= 2,
    },
    {
      key: 'exclusions',
      label: 'Out-of-scope items listed',
      hint: 'Protect yourself — name what you are NOT doing.',
      weight: 14,
      passed: counts.exclusions >= 1,
    },
    {
      key: 'assumptions',
      label: 'Assumptions logged',
      hint: 'Surface what needs to be true for this to ship.',
      weight: 8,
      passed: counts.assumptions >= 1,
    },
    {
      key: 'timeline',
      label: 'Timeline with milestones',
      hint: 'Break the work into 2+ checkpoints.',
      weight: 14,
      passed: counts.timeline >= 2,
    },
    {
      key: 'deadline',
      label: 'Approval deadline set',
      hint: 'A real date keeps reviews from drifting.',
      weight: 8,
      passed: !!brief.deadline,
    },
    {
      key: 'revisions',
      label: 'Revision limit defined',
      hint: 'Cap rounds of feedback before scope-creep starts.',
      weight: 6,
      passed: typeof brief.revision_limit === 'number' && brief.revision_limit > 0,
    },
    {
      key: 'budget',
      label: 'Budget range captured',
      hint: 'Even a rough range anchors the conversation.',
      weight: 6,
      passed: !!(brief.budget_min || brief.budget_max),
    },
  ];

  const earned = checks.filter((c) => c.passed).reduce((s, c) => s + c.weight, 0);
  const total = checks.reduce((s, c) => s + c.weight, 0);
  const score = Math.round((earned / total) * 100);
  const band: QualityResult['band'] = score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';

  return {
    score,
    band,
    checks,
    gaps: checks.filter((c) => !c.passed),
  };
}

export function scoreColorClass(band: QualityResult['band']): string {
  if (band === 'high') return 'text-status-approved';
  if (band === 'medium') return 'text-status-changes';
  return 'text-destructive';
}

export function scoreRingClass(band: QualityResult['band']): string {
  if (band === 'high') return 'stroke-status-approved';
  if (band === 'medium') return 'stroke-status-changes';
  return 'stroke-destructive';
}
