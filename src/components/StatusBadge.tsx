import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS, type BriefStatus } from '@/types/brief';
import { cn } from '@/lib/utils';

const COLOR: Record<BriefStatus, string> = {
  draft: 'border-status-draft/40 bg-status-draft/15 text-status-draft',
  sent: 'border-status-sent/40 bg-status-sent/15 text-status-sent',
  needs_changes: 'border-status-changes/40 bg-status-changes/15 text-status-changes',
  approved: 'border-status-approved/40 bg-status-approved/15 text-status-approved',
};

export function StatusBadge({ status, className }: { status: BriefStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', COLOR[status], className)}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'draft' && 'bg-status-draft',
          status === 'sent' && 'bg-status-sent',
          status === 'needs_changes' && 'bg-status-changes pulse-dot',
          status === 'approved' && 'bg-status-approved',
        )}
      />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
