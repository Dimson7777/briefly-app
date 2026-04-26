import type { Profile } from '@/types/brief';

export const PRO_PRICE_CENTS = 1900;

export const FREE_LIMITS = {
  briefs: 5,
};

export type Invoice = {
  id: string;
  date: string;
  amount_cents: number;
  status: 'paid';
};

export function buildInvoices(rows: { id: string; created_at: string; amount_cents: number | null; plan: string | null; event: string }[]): Invoice[] {
  return rows
    .filter((r) => r.event === 'demo_payment' && r.plan === 'pro' && r.amount_cents)
    .map((r) => ({
      id: r.id,
      date: r.created_at,
      amount_cents: r.amount_cents!,
      status: 'paid',
    }));
}

export function isPro(profile: Profile | null | undefined): boolean {
  if (!profile || profile.plan !== 'pro') return false;
  if (!profile.current_period_end) return true;
  return new Date(profile.current_period_end).getTime() > Date.now();
}
