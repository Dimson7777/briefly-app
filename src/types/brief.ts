export type BriefStatus = 'draft' | 'sent' | 'needs_changes' | 'approved';

export type Brief = {
  id: string;
  user_id: string;
  title: string;
  client_name: string | null;
  client_company: string | null;
  project_type: string | null;
  deadline: string | null;
  budget_min: number | null;
  budget_max: number | null;
  status: BriefStatus;
  raw_notes: string | null;
  overview: string | null;
  goals: string | null;
  revision_limit: number | null;
  created_at: string;
  updated_at: string;
};

export type Deliverable = {
  id: string;
  brief_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
};

export type Exclusion = {
  id: string;
  brief_id: string;
  content: string;
  created_at: string;
};

export type Assumption = {
  id: string;
  brief_id: string;
  content: string;
  created_at: string;
};

export type TimelineItem = {
  id: string;
  brief_id: string;
  label: string;
  due_date: string | null;
  sort_order: number;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  company: string | null;
  theme: 'light' | 'dark';
  plan: 'free' | 'pro';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingEntry = {
  id: string;
  user_id: string;
  event: string;
  plan: string | null;
  amount_cents: number | null;
  currency: string | null;
  stripe_event_id: string | null;
  created_at: string;
};

export const STATUS_LABELS: Record<BriefStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  needs_changes: 'Needs changes',
  approved: 'Approved',
};

export const STATUS_COLORS: Record<BriefStatus, string> = {
  draft: 'bg-status-draft/15 text-status-draft border-status-draft/30',
  sent: 'bg-status-sent/15 text-status-sent border-status-sent/30',
  needs_changes: 'bg-status-changes/15 text-status-changes border-status-changes/30',
  approved: 'bg-status-approved/15 text-status-approved border-status-approved/30',
};
