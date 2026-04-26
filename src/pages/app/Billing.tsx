import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Sparkles, CreditCard, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { buildInvoices, isPro, PRO_PRICE_CENTS } from '@/services/billing';
import { formatDate } from '@/utils/format';
import type { BillingEntry } from '@/types/brief';

const FREE_FEATURES = [
  'Up to 5 active briefs',
  'Scope, timeline & approval workflow',
  '"Made with Briefly" mark on previews',
  'Light & dark workspace',
];

const PRO_FEATURES = [
  'Unlimited briefs',
  'Clean, unbranded brief previews',
  'Print / PDF export',
  'Priority email support',
  'Cancel anytime',
];

export default function Billing() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => { document.title = 'Billing · Briefly'; }, []);

  const { data: invoices = [] } = useQuery({
    queryKey: ['billing', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from('billing_history')
        .select('*')
        .order('created_at', { ascending: false });
      return buildInvoices((data ?? []) as BillingEntry[]);
    },
  });

  const pro = isPro(profile);

  const completeUpgrade = async () => {
    if (!user) return;
    setProcessing(true);

    // Simulate processing
    await new Promise((r) => setTimeout(r, 1400));

    const renewsAt = new Date();
    renewsAt.setMonth(renewsAt.getMonth() + 1);

    const { error: pErr } = await supabase
      .from('profiles')
      .update({ plan: 'pro', current_period_end: renewsAt.toISOString() })
      .eq('id', user.id);

    if (pErr) {
      setProcessing(false);
      toast({ title: 'Upgrade failed', description: pErr.message, variant: 'destructive' });
      return;
    }

    await supabase.from('billing_history').insert({
      user_id: user.id,
      event: 'demo_payment',
      plan: 'pro',
      amount_cents: PRO_PRICE_CENTS,
      currency: 'usd',
    });

    setProcessing(false);
    setCheckoutOpen(false);
    qc.invalidateQueries({ queryKey: ['profile'] });
    qc.invalidateQueries({ queryKey: ['billing'] });
    toast({ title: 'Welcome to Pro', description: 'Demo payment confirmed.' });
  };

  const cancel = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ plan: 'free', current_period_end: null })
      .eq('id', user.id);
    if (error) {
      toast({ title: 'Could not cancel', description: error.message, variant: 'destructive' });
      return;
    }
    await supabase.from('billing_history').insert({
      user_id: user.id, event: 'cancellation', plan: 'free',
    });
    qc.invalidateQueries({ queryKey: ['profile'] });
    qc.invalidateQueries({ queryKey: ['billing'] });
    toast({ title: 'Subscription cancelled', description: 'You\'re back on the Free plan.' });
  };

  return (
    <div className="anim-in mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Account</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Billing</h1>
        </div>
        <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
          Demo only — no real charges
        </span>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        {/* Free */}
        <PlanCard
          title="Free"
          price="$0"
          subtitle="For trying Briefly out."
          features={FREE_FEATURES}
          active={!pro}
          action={
            pro ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">Cancel subscription</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Pro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll return to the Free plan immediately. Existing briefs are kept,
                      but the "Made with Briefly" mark returns to your previews and you'll
                      be limited to 5 briefs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Pro</AlertDialogCancel>
                    <AlertDialogAction onClick={cancel}>Cancel subscription</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button variant="outline" className="w-full" disabled>Current plan</Button>
            )
          }
        />

        {/* Pro */}
        <PlanCard
          highlight
          title="Pro"
          price="$19"
          priceSuffix="/mo"
          subtitle="For freelancers shipping client work."
          features={PRO_FEATURES}
          active={pro}
          action={
            pro ? (
              <Button className="w-full" disabled>
                <Check className="mr-1.5 h-4 w-4" /> You're on Pro
              </Button>
            ) : (
              <Button className="w-full" onClick={() => setCheckoutOpen(true)}>
                <Sparkles className="mr-1.5 h-4 w-4" /> Upgrade to Pro
              </Button>
            )
          }
        />
      </div>

      {/* Invoices */}
      <section className="panel mt-8">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold">Invoice history</h2>
          <p className="text-xs text-muted-foreground">Demo receipts from your simulated checkouts.</p>
        </div>
        {invoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elev/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Invoice</th>
                <th className="px-5 py-2.5 font-medium">Date</th>
                <th className="px-5 py-2.5 font-medium">Amount</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-mono text-xs">INV-{inv.id.slice(0, 8).toUpperCase()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                  <td className="px-5 py-3">${(inv.amount_cents / 100).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-success">
                      <Check className="h-3 w-3" /> Paid
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Demo checkout */}
      <Dialog open={checkoutOpen} onOpenChange={(o) => !processing && setCheckoutOpen(o)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Demo checkout</DialogTitle>
            <DialogDescription>
              No real card processing. This simulates a Pro upgrade for portfolio purposes.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-border bg-secondary/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span>Briefly Pro · monthly</span>
              <span className="font-medium">${(PRO_PRICE_CENTS / 100).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Renews monthly. Cancel anytime.</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Card number</Label>
              <div className="relative mt-1.5">
                <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input defaultValue="4242 4242 4242 4242" className="pl-9 font-mono" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Expiry</Label>
                <Input defaultValue="12 / 29" className="mt-1.5 font-mono" />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">CVC</Label>
                <Input defaultValue="123" className="mt-1.5 font-mono" />
              </div>
            </div>
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <X className="h-3 w-3" /> No real payment is processed.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setCheckoutOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button onClick={completeUpgrade} disabled={processing}>
              {processing ? (
                <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</>
              ) : (
                <>Confirm demo payment</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanCard({
  title, price, priceSuffix, subtitle, features, active, highlight, action,
}: {
  title: string;
  price: string;
  priceSuffix?: string;
  subtitle: string;
  features: string[];
  active: boolean;
  highlight?: boolean;
  action: React.ReactNode;
}) {
  return (
    <div
      className={`relative rounded-lg border p-6 ${
        highlight
          ? 'border-primary/40 bg-gradient-to-b from-primary/[0.04] to-transparent'
          : 'border-border bg-card'
      }`}
    >
      {active && (
        <span className="absolute right-4 top-4 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
          Current
        </span>
      )}
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-4xl font-semibold tracking-tight">{price}</span>
        {priceSuffix && <span className="text-sm text-muted-foreground">{priceSuffix}</span>}
      </div>
      <ul className="mt-5 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlight ? 'text-primary' : 'text-success'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">{action}</div>
    </div>
  );
}
