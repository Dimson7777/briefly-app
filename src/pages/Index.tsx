import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Check, FileSignature, Sparkles,
  Send, ScanText, Layers, Command, Printer, GitBranch, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Briefly — Turn messy client requests into briefs you can actually build from.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        'Briefly is a brief builder for freelancers and studios. Paste raw client notes, shape the scope, send a clean approval-ready brief.',
      );
    }
  }, []);

  const ctaTo = user ? '/app' : '/auth';

  return (
    <div className="dark relative min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-brand">
              <FileSignature className="h-4 w-4 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Briefly</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#problem" className="transition hover:text-foreground">The problem</a>
            <a href="#workflow" className="transition hover:text-foreground">Workflow</a>
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" onClick={() => navigate('/app')}>
                Open app <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate('/auth')} className="hidden sm:inline-flex">
                  Sign in
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" aria-hidden />
        <div className="absolute right-0 top-1/3 h-[280px] w-[420px] rounded-full bg-violet/15 blur-[120px]" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <div>
            <Badge variant="outline" className="mb-5 gap-1.5 border-primary/30 bg-primary/5 font-mono text-[10px] uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
              For freelancers & small studios
            </Badge>
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Turn{' '}
              <span className="italic text-muted-foreground">messy</span>{' '}
              client requests into briefs you can actually{' '}
              <span className="bg-gradient-to-br from-primary to-violet bg-clip-text text-transparent">
                build from.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
              Paste the email, the slack thread, the rambling Loom transcript.
              Briefly turns it into a structured scope — deliverables, exclusions,
              timeline — ready to send for approval.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate(ctaTo)} className="h-11 px-5">
                {user ? 'Open Briefly' : 'Start your first brief'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <a href="#workflow" className="inline-flex h-11 items-center gap-1.5 rounded-md px-4 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                See how it works <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Free to start · 5 briefs free · Demo billing only
            </p>
          </div>

          {/* Hero brief preview */}
          <HeroPreview />
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="border-t border-border/60 bg-surface-elev/30 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-violet">The problem</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Vague requests are how scope creep starts.
              </h2>
            </div>
            <div className="space-y-5 text-muted-foreground">
              <p>
                You quote a project off a few paragraphs in an email. Three weeks in,
                "just one more page" has become five, the design is being re-done,
                and nobody can find the thing you both agreed to in the first place.
              </p>
              <p className="text-foreground">
                The fix isn't more meetings. It's writing the brief down — clearly,
                visibly, with limits — before you start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="border-t border-border/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-wider text-primary">Workflow</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps. One source of truth.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {[
              {
                n: '01',
                icon: ScanText,
                t: 'Paste client notes',
                d: 'Drop the email, the meeting transcript, the bullet list. We extract structure automatically.',
              },
              {
                n: '02',
                icon: Layers,
                t: 'Shape the scope',
                d: 'Refine deliverables, lock in exclusions, set a revision limit, sketch a timeline.',
              },
              {
                n: '03',
                icon: Send,
                t: 'Send a clean brief',
                d: 'Share a polished, client-facing document. Track approval status from one dashboard.',
              },
            ].map((step) => (
              <div key={step.n} className="panel group relative overflow-hidden p-6 transition hover:border-primary/30">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs uppercase tracking-wider text-primary">{step.n}</div>
                  <step.icon className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                </div>
                <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">{step.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — editorial split layout */}
      <section id="features" className="border-t border-border/60 bg-surface-elev/30 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.6fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-xs uppercase tracking-wider text-violet">Features</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-[1.05] tracking-tight sm:text-4xl">
                A document tool, not a dashboard.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground">
                Briefly is built around the artifact you're actually shipping — the brief.
                Everything else gets out of the way.
              </p>
            </div>

            <div className="space-y-px overflow-hidden rounded-xl border border-border/60 bg-surface-elev">
              <FeatureRow
                index="F.01"
                icon={ScanText}
                title="Notes parser"
                description="Drop in raw text — Slack threads, transcripts, emails. The parser pulls out goals, deliverables, exclusions and assumptions deterministically. No AI surprises."
                meta="Deterministic"
              />
              <FeatureRow
                index="F.02"
                icon={Layers}
                title="Scope builder"
                description="Deliverables, exclusions, assumptions, revision limits and timeline items live side-by-side in a single editor. Reorder freely, save when ready."
                meta="Editor"
              />
              <FeatureRow
                index="F.03"
                icon={Printer}
                title="Client-facing preview"
                description="A typeset, printable document view. Send a link or print to PDF. Looks like something a studio would actually hand a client."
                meta="Document"
              />
              <FeatureRow
                index="F.04"
                icon={GitBranch}
                title="Approval lifecycle"
                description="Draft → Sent → Needs changes → Approved. Every status change is tracked, and the dashboard surfaces what needs your attention."
                meta="Status"
              />
              <FeatureRow
                index="F.05"
                icon={Command}
                title="Command palette"
                description="⌘K opens a palette to jump between briefs, create new ones, switch theme, or land in settings — without ever touching the sidebar."
                meta="⌘K"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison strip — before / after */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-primary">Before / After</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                The same project, two different conversations.
              </h2>
            </div>
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              Same client. Same scope.<br />Very different outcomes.
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ComparisonColumn
              tone="bad"
              label="Without a brief"
              points={[
                'Quote based on a 4-paragraph email',
                '"Just one more page" appears in week 3',
                'Revisions are unlimited in practice',
                'Approval lives in someone\'s inbox',
                'Final scope ≠ original quote',
              ]}
              footer="Margin disappears."
            />
            <ComparisonColumn
              tone="good"
              label="With a brief"
              points={[
                'Quote tied to a written, shared scope',
                'New asks become a v2 — not free work',
                'Revision limits are explicit (and visible)',
                'One link, one canonical document',
                'Final scope = approved scope',
              ]}
              footer="Margin stays."
            />
          </div>
        </div>
      </section>

      {/* Pricing — editorial table layout */}
      <section id="pricing" className="border-t border-border/60 bg-surface-elev/30 py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-primary">Pricing</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                One free tier. One paid tier. <span className="text-muted-foreground">No seat math.</span>
              </h2>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              Demo billing · No real cards processed
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl border border-border/60">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1.3fr_1.3fr]">
              {/* Row header column */}
              <div className="hidden border-r border-border/60 bg-background/40 md:block">
                <div className="flex h-[120px] items-end p-6">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    What you get
                  </span>
                </div>
                <PricingFeatureLabel>Briefs</PricingFeatureLabel>
                <PricingFeatureLabel>Notes parser</PricingFeatureLabel>
                <PricingFeatureLabel>Client preview</PricingFeatureLabel>
                <PricingFeatureLabel>Watermark</PricingFeatureLabel>
                <PricingFeatureLabel>Approval lifecycle</PricingFeatureLabel>
                <PricingFeatureLabel>Command palette</PricingFeatureLabel>
                <PricingFeatureLabel last>Theme</PricingFeatureLabel>
              </div>

              <PlanColumn
                name="Free"
                price="$0"
                cadence="forever"
                description="For first briefs and one-off projects."
                ctaLabel="Start free"
                ctaTo={ctaTo}
                ctaVariant="outline"
                values={[
                  'Up to 5',
                  'Included',
                  'Included',
                  'Visible',
                  'Included',
                  'Included',
                  'Light & dark',
                ]}
              />

              <PlanColumn
                name="Pro"
                price="$19"
                cadence="per month"
                description="For working freelancers and small studios."
                ctaLabel="Get Pro"
                ctaTo={ctaTo}
                ctaVariant="default"
                highlighted
                values={[
                  'Unlimited',
                  'Included',
                  'Included',
                  'Removed',
                  'Included',
                  'Included',
                  'Light & dark',
                ]}
              />
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Plans persist per account. Cancel anytime — you'll drop to Free at the end of the demo period.
          </p>
        </div>
      </section>

      {/* CTA — final document panel */}
      <section className="relative overflow-hidden border-t border-border/60 py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" aria-hidden />
        <div className="absolute -bottom-32 left-1/2 h-[320px] w-[700px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <div className="paper rounded-xl p-8 sm:p-12">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-black/50">
                Brief · Final
              </p>
              <span className="rounded-full border border-status-approved/40 bg-status-approved/15 px-2 py-0.5 text-[10px] font-medium text-status-approved">
                ● Ready to send
              </span>
            </div>
            <h2 className="mt-6 font-display text-3xl font-semibold tracking-tight text-black sm:text-4xl">
              Stop quoting off vibes.<br />
              <span className="text-black/50">Start quoting off briefs.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-black/70 sm:text-base">
              Five minutes to set up. One paste away from clarity.
              Free to start, no card needed, your data stays scoped to your account.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate(ctaTo)} className="h-11 px-5">
                {user ? 'Open dashboard' : 'Start your first brief'}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
              <span className="font-mono text-[11px] uppercase tracking-wider text-black/40">
                Approval requested · Sign here ↘
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — editorial column footer */}
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-brand">
                  <FileSignature className="h-4 w-4 text-primary-foreground" strokeWidth={2.4} />
                </div>
                <span className="font-display text-lg font-semibold tracking-tight">Briefly</span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted-foreground">
                A brief builder for freelancers and small studios.
                Turn the messy request into the document you both sign off on.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-status-approved pulse-dot" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Portfolio build · Demo billing only
                </span>
              </div>
            </div>

            <FooterColumn
              label="Product"
              links={[
                { label: 'Features', href: '#features' },
                { label: 'Workflow', href: '#workflow' },
                { label: 'Pricing', href: '#pricing' },
              ]}
            />
            <FooterColumn
              label="Account"
              links={[
                { label: user ? 'Open app' : 'Sign in', href: user ? '/app' : '/auth', internal: true },
                { label: user ? 'Dashboard' : 'Get started', href: user ? '/app' : '/auth', internal: true },
              ]}
            />
            <FooterColumn
              label="Built with"
              links={[
                { label: 'React + Vite', href: 'https://vitejs.dev', external: true },
                { label: 'Tailwind CSS', href: 'https://tailwindcss.com', external: true },
                { label: 'Supabase', href: 'https://supabase.com', external: true },
              ]}
            />
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p className="font-mono uppercase tracking-wider">
              © {new Date().getFullYear()} Briefly · v0.1
            </p>
            <p>Crafted as a portfolio piece. Not affiliated with any real billing provider.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureRow({
  index, icon: Icon, title, description, meta,
}: {
  index: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <div className="group grid grid-cols-[auto_1fr_auto] items-start gap-5 bg-surface-elev p-6 transition hover:bg-surface-elev/60 sm:gap-8 sm:p-7">
      <div className="flex flex-col items-start gap-3">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{index}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h3 className="font-display text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <span className="hidden self-center rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline-block">
        {meta}
      </span>
    </div>
  );
}

function ComparisonColumn({
  tone, label, points, footer,
}: {
  tone: 'good' | 'bad';
  label: string;
  points: string[];
  footer: string;
}) {
  const isGood = tone === 'good';
  return (
    <div
      className={
        isGood
          ? 'panel relative overflow-hidden border-primary/30 p-7'
          : 'rounded-xl border border-dashed border-border bg-surface-elev/40 p-7'
      }
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-mono text-[10px] uppercase tracking-wider ${
            isGood ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          {label}
        </span>
        {isGood && <Sparkles className="h-4 w-4 text-primary" />}
      </div>
      <ul className="mt-5 space-y-3 text-sm">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-2.5">
            {isGood ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Minus className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={isGood ? 'text-foreground' : 'text-muted-foreground'}>{p}</span>
          </li>
        ))}
      </ul>
      <p
        className={`mt-6 border-t pt-4 font-display text-base ${
          isGood ? 'border-primary/20 text-foreground' : 'border-border text-muted-foreground'
        }`}
      >
        {footer}
      </p>
    </div>
  );
}

function PricingFeatureLabel({
  children, last,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex h-14 items-center px-6 text-sm text-muted-foreground ${
        last ? '' : 'border-b border-border/60'
      }`}
    >
      {children}
    </div>
  );
}

function PlanColumn({
  name, price, cadence, description, values, ctaLabel, ctaTo, ctaVariant, highlighted,
}: {
  name: string;
  price: string;
  cadence: string;
  description: string;
  values: string[];
  ctaLabel: string;
  ctaTo: string;
  ctaVariant: 'default' | 'outline';
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col border-border/60 ${
        highlighted ? 'bg-gradient-to-b from-primary/5 to-transparent' : ''
      } md:border-l`}
    >
      {highlighted && (
        <div className="absolute right-5 top-5">
          <Badge className="bg-primary/15 font-mono text-[10px] uppercase tracking-wider text-primary hover:bg-primary/15">
            Recommended
          </Badge>
        </div>
      )}

      <div className="flex h-[120px] flex-col justify-end gap-1 p-6">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{name}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="border-y border-border/60 px-6 py-4">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-semibold tracking-tight">{price}</span>
          <span className="text-xs text-muted-foreground">{cadence}</span>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-6 py-4">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            What you get
          </p>
          <ul className="space-y-2 text-sm">
            {['Briefs', 'Notes parser', 'Client preview', 'Watermark', 'Approval lifecycle', 'Command palette', 'Theme'].map(
              (label, i) => (
                <li key={label} className="flex items-baseline justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-right font-medium">{values[i]}</span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="hidden md:block">
        {values.map((v, i) => (
          <div
            key={i}
            className={`flex h-14 items-center px-6 text-sm font-medium ${
              i === values.length - 1 ? '' : 'border-b border-border/60'
            }`}
          >
            {v}
          </div>
        ))}
      </div>

      <div className="mt-auto p-6">
        <Button asChild className="w-full" variant={ctaVariant} size="lg">
          <Link to={ctaTo}>
            {ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FooterColumn({
  label, links,
}: {
  label: string;
  links: Array<{ label: string; href: string; internal?: boolean; external?: boolean }>;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            {l.internal ? (
              <Link to={l.href} className="text-foreground/80 transition hover:text-foreground">
                {l.label}
              </Link>
            ) : l.external ? (
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground/80 transition hover:text-foreground"
              >
                {l.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : (
              <a href={l.href} className="text-foreground/80 transition hover:text-foreground">
                {l.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative">
      <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/20 to-violet/20 blur-2xl" aria-hidden />
      <div className="relative grid gap-3 sm:grid-cols-[1fr_1.15fr]">
        {/* Raw notes */}
        <div className="panel p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-status-changes" />
            <span className="text-[10px] uppercase tracking-wider">Raw email</span>
          </div>
          <p>
            Hey — we need a new landing page for the Q3 launch. Should feel modern,
            video header probably. We want a pricing section, FAQ, maybe a blog later.
            <span className="text-status-changes"> Not including</span> any custom illustrations.
            <span className="text-status-changes"> Assuming</span> the copy comes from us.
            Need it live by end of August.
          </p>
        </div>
        {/* Structured brief */}
        <div className="paper anim-in relative rounded-md p-5">
          <div className="flex items-center justify-between border-b border-black/10 pb-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider text-black/50">Brief</p>
              <h3 className="font-display text-base font-semibold leading-tight">Acme — Q3 launch landing</h3>
            </div>
            <span className="rounded-full border border-status-approved/40 bg-status-approved/15 px-2 py-0.5 text-[9px] font-medium text-status-approved">
              ● Approved
            </span>
          </div>
          <div className="mt-3 space-y-2.5 text-[11px] leading-snug text-black/80">
            <Section label="Deliverables">
              <li>Single-page Q3 launch landing</li>
              <li>Video header + pricing + FAQ</li>
              <li>Responsive mobile layout</li>
            </Section>
            <Section label="Out of scope">
              <li className="text-black/60">Custom illustrations</li>
              <li className="text-black/60">Blog system (Phase 2)</li>
            </Section>
            <Section label="Timeline">
              <li>Aug 12 — design draft</li>
              <li>Aug 24 — build complete</li>
              <li>Aug 31 — launch</li>
            </Section>
          </div>
          <div className="mt-3 border-t border-black/10 pt-2 text-[9px] uppercase tracking-wider text-black/40">
            briefly · revision 2 of 3
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-mono text-[8px] uppercase tracking-wider text-black/40">{label}</p>
      <ul className="ml-3.5 list-disc space-y-0.5">{children}</ul>
    </div>
  );
}

