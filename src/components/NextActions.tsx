import { ArrowRight } from 'lucide-react';
import type { QualityResult } from '@/services/quality';
import { cn } from '@/lib/utils';

type Props = {
  result: QualityResult;
  onAction: (key: string) => void;
  className?: string;
};

const ACTION_LABEL: Record<string, string> = {
  overview: 'Write the overview',
  goals: 'Add a clear goal',
  deliverables: 'Add a deliverable',
  exclusions: 'List what is out of scope',
  assumptions: 'Log an assumption',
  timeline: 'Add a milestone',
  deadline: 'Set an approval deadline',
  revisions: 'Cap revision rounds',
  budget: 'Add a budget range',
};

/**
 * Compact "what to do next" strip — the top 3 unmet checks rendered as
 * tappable suggestions. When clicked, the parent scrolls/focuses the
 * matching field.
 */
export function NextActions({ result, onAction, className }: Props) {
  const top = result.gaps.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <div className={cn('panel overflow-hidden', className)}>
      <header className="flex items-center justify-between border-b border-border bg-surface-elev/40 px-4 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Next actions
        </span>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {result.score}/100
        </span>
      </header>
      <ul className="divide-y divide-border">
        {top.map((g) => (
          <li key={g.key}>
            <button
              type="button"
              onClick={() => onAction(g.key)}
              className="group flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-surface-elev/60"
            >
              <span className="text-sm font-medium">
                {ACTION_LABEL[g.key] ?? g.label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">+{g.weight}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
