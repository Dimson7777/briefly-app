import { cn } from '@/lib/utils';
import { scoreRingClass, type QualityResult } from '@/services/quality';

type Props = {
  result: Pick<QualityResult, 'score' | 'band'>;
  size?: number;
  stroke?: number;
  className?: string;
  showLabel?: boolean;
};

export function QualityRing({ result, size = 64, stroke = 6, className, showLabel = true }: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (result.score / 100) * c;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          strokeWidth={stroke} fill="transparent"
          className="stroke-border"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          strokeWidth={stroke} fill="transparent"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          className={cn('transition-[stroke-dashoffset] duration-700 ease-out', scoreRingClass(result.band))}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="font-display text-lg font-semibold tabular-nums">{result.score}</span>
          <span className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">score</span>
        </div>
      )}
    </div>
  );
}
