import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Command,
  FileSignature,
  GitBranch,
  Layers,
  Printer,
  ScanText,
  Send,
  Sparkles,
  ShieldCheck,
  Clock3,
  BadgeCheck,
  CircleAlert,
  Dot,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

const TRUSTED_NAMES = ['StudioHive', 'PixelPerfect', 'LaunchLab', 'Northbound', 'DesignKit', 'Webflare'];

const WORKFLOW_STEPS = [
  {
    n: '01',
    icon: ScanText,
    title: 'Paste client notes',
    desc: 'Drop in the email, transcript, or Slack thread.',
  },
  {
    n: '02',
    icon: Layers,
    title: 'Shape the scope',
    desc: 'Lock deliverables, exclusions, assumptions, revision limits, and timeline.',
  },
  {
    n: '03',
    icon: Send,
    title: 'Send a clean brief',
    desc: 'Share a polished client-facing document and track approval status.',
  },
];

const FEATURE_ROWS = [
  {
    icon: ScanText,
    title: 'Notes parser',
    meta: 'Deterministic',
    description: 'Turns unstructured client language into scoped sections you can work from.',
  },
  {
    icon: Layers,
    title: 'Scope builder',
    meta: 'Editor',
    description: 'Build deliverables, exclusions, assumptions, timeline, and revision policy in one view.',
  },
  {
    icon: Printer,
    title: 'Client-facing preview',
    meta: 'Document',
    description: 'Generate a clean brief that looks ready for client review and sign-off.',
  },
  {
    icon: GitBranch,
    title: 'Approval lifecycle',
    meta: 'Status',
    description: 'Track draft, sent, needs changes, and approved states across every brief.',
  },
  {
    icon: Command,
    title: 'Command palette',
    meta: 'Shortcut',
    description: 'Jump, create, and navigate quickly with a keyboard-first workflow.',
  },
  {
    icon: Sparkles,
    title: 'Light and dark theme',
    meta: 'Theme',
    description: 'Switch visual modes without changing how your workflows behave.',
  },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Briefly - Turn messy client requests into briefs you can actually build from.';
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
    <div className="dark relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-45" />
        <div className="absolute -top-44 left-1/2 h-[34rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.24),transparent_62%)] blur-3xl" />
        <div className="absolute -right-40 top-[30%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,hsl(var(--violet)/0.32),transparent_70%)] blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-brand shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_10px_35px_-12px_hsl(var(--primary)/0.8)] transition-transform duration-300 group-hover:scale-105">
              <FileSignature className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
            </div>
            <span className="font-display text-[1.15rem] font-semibold tracking-tight">Briefly</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#problem" className="transition hover:text-foreground">Problem</a>
            <a href="#workflow" className="transition hover:text-foreground">Workflow</a>
            <a href="#features" className="transition hover:text-foreground">Capabilities</a>
            <a href="#pricing" className="transition hover:text-foreground">Pricing</a>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <Button size="sm" onClick={() => navigate('/app')}>
                Open app
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/auth')}
                  className="hidden sm:inline-flex"
                >
                  Sign in
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>Get started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-12 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-7">
            <div>
              <Badge
                variant="outline"
                className="mb-5 gap-1.5 border-primary/30 bg-primary/10 font-mono text-[10px] uppercase tracking-[0.16em] text-primary"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                FOR FREELANCERS &amp; SMALL STUDIOS
              </Badge>

              <h1 className="text-balance font-display text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-[3.52rem]">
                Turn messy client requests into briefs you can actually build from.
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[1.04rem]">
                Paste the email, Slack thread, or meeting notes. Briefly turns scattered client input into
                clear deliverables, exclusions, timelines, and approval-ready scope.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate(ctaTo)} className="h-11 px-5 shadow-[0_12px_40px_-14px_hsl(var(--primary)/0.9)]">
                  {user ? 'Open Briefly' : 'Start your first brief'}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
                <a
                  href="#workflow"
                  className="inline-flex h-11 items-center gap-1.5 rounded-md border border-border/70 bg-surface/30 px-4 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
                >
                  See how it works
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
                {['Free to start', '5 briefs free', 'Demo billing only', 'No real cards processed'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border/65 bg-surface-elev/45 px-2.5 py-1 font-mono uppercase tracking-wider text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <HeroPreview />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
            <div className="rounded-2xl border border-border/50 bg-surface/25 px-4 py-3.5 backdrop-blur sm:px-6">
              <p className="text-center text-[11px] uppercase tracking-[0.16em] text-muted-foreground/90">
                Trusted by independent makers and small teams
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80 sm:grid-cols-3 lg:grid-cols-6">
                {TRUSTED_NAMES.map((name) => (
                  <span key={name} className="rounded-lg border border-border/35 bg-background/20 py-1.5">{name}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="border-t border-border/60 py-20 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-9 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-violet">The Problem</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-[2.85rem]">
                Vague requests are how scope creep starts.
              </h2>
              <p className="mt-5 max-w-2xl text-pretty text-muted-foreground">
                You quote a project from a few paragraphs in an email. Three weeks later, "just one more page"
                becomes five, the design is being re-done, and nobody can find what was agreed in the first place.
              </p>
              <p className="mt-4 max-w-2xl text-pretty text-foreground">
                The fix isn't more meetings. It's writing the brief down - clearly, visibly, with limits - before you
                start.
              </p>
            </div>

            <div className="panel-elev relative overflow-hidden rounded-2xl border border-border/65 p-6 shadow-[0_22px_45px_-30px_hsl(var(--warning)/0.5)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,hsl(var(--warning)/0.11),transparent_52%),radial-gradient(circle_at_100%_100%,hsl(var(--violet)/0.12),transparent_50%)]" />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-warning/90">Scope Creep Signals</p>
                <ul className="mt-5 space-y-3.5 text-sm">
                  {[
                    'Can we just add...',
                    'This should be quick',
                    'We assumed that was included',
                    'One more revision',
                  ].map((signal) => (
                    <li
                      key={signal}
                      className="flex items-center gap-2.5 rounded-xl border border-warning/20 bg-warning/10 px-3.5 py-2.5 text-warning/90 shadow-[0_8px_20px_-15px_hsl(var(--warning)/0.55)]"
                    >
                      <CircleAlert className="h-4 w-4 shrink-0" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-border/60 bg-surface-elev/25 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Workflow</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Three steps. One source of truth.
              </h2>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {WORKFLOW_STEPS.map((step) => (
                <article
                  key={step.n}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-background/45 p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary/55 hover:shadow-[0_20px_50px_-24px_hsl(var(--primary)/0.95)]"
                >
                  <div className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-bl-xl border border-primary/20 bg-primary/5 text-primary/55 opacity-70 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10 group-hover:opacity-100">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.35),0_0_35px_-18px_hsl(var(--primary)/0.9)]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary/85">{step.n}</span>
                    <step.icon className="h-4.5 w-4.5 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-border/60 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.2fr]">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-violet">Capabilities</p>
                <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  A document tool, not another dashboard.
                </h2>
                <p className="mt-4 max-w-md text-pretty text-muted-foreground">
                  Briefly is built around the artifact you actually ship - the brief. Everything else stays out of the
                  way.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {FEATURE_ROWS.map((feature) => (
                  <article
                    key={feature.title}
                    className="group rounded-2xl border border-border/70 bg-surface/55 p-5 transition duration-300 hover:border-primary/50 hover:bg-surface/75 hover:shadow-[0_14px_40px_-18px_hsl(var(--primary)/0.7)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/60 bg-background/55">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="rounded-full border border-border/70 bg-background/55 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {feature.meta}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-[1.28rem] font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/60 bg-surface-elev/25 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-10">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Before / After</p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                The same project. Two different conversations.
              </h2>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <ComparisonCard
                tone="bad"
                title="Without a brief"
                points={[
                  'Quote based on a 4-paragraph email',
                  'Just one more page appears in week 3',
                  'Revisions are unlimited in practice',
                  'Approval lives in someone\'s inbox',
                  'Final scope != original quote',
                ]}
                footer="Margin disappears."
              />
              <ComparisonCard
                tone="good"
                title="With Briefly"
                points={[
                  'Quote tied to a written, shared scope',
                  'New asks become a v2 - not free work',
                  'Revision limits are explicit and visible',
                  'One link, one canonical document',
                  'Final scope = approved scope',
                ]}
                footer="Margin stays."
              />
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-border/60 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary">Pricing</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  One free tier. One paid tier. No seat math.
                </h2>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Demo billing - No real cards processed
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <PricingCard
                name="Free"
                price="$0"
                cadence="forever"
                description="For first briefs and one-off projects."
                ctaLabel="Start free"
                ctaTo={ctaTo}
                ctaVariant="outline"
                values={[
                  'Up to 5 briefs',
                  'Notes parser included',
                  'Client preview included',
                  'Watermark visible',
                  'Approval lifecycle included',
                  'Command palette included',
                  'Light and dark theme',
                ]}
              />

              <PricingCard
                name="Pro"
                price="$19"
                cadence="per month"
                description="For working freelancers and small studios."
                ctaLabel="Get Pro"
                ctaTo={ctaTo}
                ctaVariant="default"
                recommended
                values={[
                  'Unlimited briefs',
                  'Notes parser included',
                  'Client preview included',
                  'Watermark removed',
                  'Approval lifecycle included',
                  'Command palette included',
                  'Light and dark theme',
                ]}
              />
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Plans persist per account. Cancel anytime - you will drop to Free at the end of the demo period.
            </p>
          </div>
        </section>

        <section className="border-t border-border/60 py-16 sm:py-18">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="rounded-2xl border border-border/60 bg-surface/30 p-5 shadow-[0_20px_50px_-30px_hsl(var(--primary)/0.75)] backdrop-blur sm:p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                Built as a portfolio-grade SaaS case study
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                <article className="rounded-2xl border border-border/65 bg-background/45 p-5 shadow-[0_14px_35px_-24px_hsl(var(--primary)/0.8)]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-violet">Why I built Briefly</p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[2rem]">Why I built Briefly</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                    I built Briefly around a real freelance problem: clients rarely describe scope clearly at the
                    start, but small unclear details become expensive later.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[0.95rem]">
                    The goal was to create a focused product that turns scattered client input into a written,
                    approval-ready brief before work begins - with deliverables, exclusions, revision limits, and
                    timeline visible from day one.
                  </p>
                </article>

                <div className="grid gap-4">
                  <article className="rounded-2xl border border-border/65 bg-background/45 p-5 shadow-[0_14px_35px_-24px_hsl(var(--violet)/0.7)]">
                    <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-primary">Product decisions</p>
                    <ul className="mt-3 space-y-2.5 text-sm">
                      {[
                        'Document-first, not dashboard-heavy',
                        'Scope limits visible before work starts',
                        'Approval states for final client sign-off',
                        'Demo billing only - no real cards processed',
                        'Built for freelancers and small studios',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2 text-muted-foreground">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-2xl border border-border/65 bg-background/45 p-5">
                    <p className="font-display text-xl font-semibold tracking-tight">Built by Dimitrije Bukejlovic</p>
                    <p className="mt-1 text-sm text-muted-foreground">Full Stack Engineer</p>
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Portfolio:{' '}
                        <a
                          href="https://dimitrije-web.vercel.app/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary transition hover:text-primary-glow"
                        >
                          https://dimitrije-web.vercel.app/
                        </a>
                      </p>
                      <p className="text-muted-foreground">
                        Email:{' '}
                        <a href="mailto:dimibukejlovic@gmail.com" className="text-primary transition hover:text-primary-glow">
                          dimibukejlovic@gmail.com
                        </a>
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/90">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-brand shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_10px_35px_-15px_hsl(var(--primary)/0.75)]">
                  <FileSignature className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
                </div>
                <span className="font-display text-lg font-semibold tracking-tight">Briefly</span>
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Turn scattered client messages into structured briefs your team and client can actually approve.
              </p>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                Built for freelancers and small studios
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Demo billing only - No real cards processed</p>
            </div>

            <FooterColumn
              heading="Product"
              links={[
                { label: 'Problem', href: '#problem' },
                { label: 'Workflow', href: '#workflow' },
                { label: 'Capabilities', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
              ]}
            />

            <FooterColumn
              heading="Account"
              links={[
                { label: user ? 'Open app' : 'Sign in', href: user ? '/app' : '/auth', internal: true },
                { label: user ? 'Dashboard' : 'Get started', href: user ? '/app' : '/auth', internal: true },
              ]}
            />

            <FooterColumn
              heading="Built with"
              links={[
                { label: 'React + Vite', href: 'https://vitejs.dev', external: true },
                { label: 'Tailwind CSS', href: 'https://tailwindcss.com', external: true },
                { label: 'Supabase', href: 'https://supabase.com', external: true },
              ]}
            />
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
            <p className="font-mono uppercase tracking-[0.15em]">(c) {new Date().getFullYear()} Briefly - v0.1</p>
            <p>Crafted as a portfolio piece. Not affiliated with any real billing provider.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div className="relative lg:pl-3">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[105px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,hsl(var(--primary)/0.26),hsl(var(--violet)/0.2))] blur-[70px]" />
      <div className="relative grid gap-3 sm:grid-cols-[1.05fr_auto_1.12fr] sm:items-center">
        <span className="pointer-events-none absolute -left-2 top-12 hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-primary/85 md:block">
          Scope locked
        </span>
        <span className="pointer-events-none absolute left-[43%] -top-3 hidden rounded-full border border-violet/25 bg-violet/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-violet/90 md:block">
          2 revisions included
        </span>
        <span className="pointer-events-none absolute right-[16%] -bottom-4 hidden rounded-full border border-status-approved/35 bg-status-approved/12 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-status-approved md:block">
          Client approved
        </span>
        <span className="pointer-events-none absolute -right-2 top-[58%] hidden rounded-full border border-warning/35 bg-warning/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-warning md:block">
          v2 request detected
        </span>
        <div className="absolute -left-1 top-1 hidden -translate-x-full rounded-full border border-border/70 bg-background/50 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground lg:block">
          From scattered
        </div>
        <div className="absolute -right-1 top-1 hidden translate-x-full rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-primary lg:block">
          Ready for approval
        </div>

        <article className="rounded-2xl border border-border/65 bg-surface/70 p-5 shadow-[0_22px_55px_-28px_hsl(0_0%_0%/0.9)] backdrop-blur">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-warning" />
            Raw client message
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">
            We should probably update the homepage first, and maybe the pricing section too. We are
            assuming your team can also handle the CMS migration. This quote is not including custom
            illustrations right now. After launch, we might need one more page for case studies.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em]">
            {['probably', 'maybe', 'not including', 'assuming', 'one more page'].map((word) => (
              <span key={word} className="rounded-full border border-warning/35 bg-warning/10 px-2 py-0.5 text-warning">
                {word}
              </span>
            ))}
          </div>
        </article>

        <div className="relative hidden items-center justify-center sm:flex">
          <span className="absolute -top-5 rounded-full border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-primary">
            To structured
          </span>
          <div className="h-0.5 w-10 bg-gradient-to-r from-primary via-violet to-primary" />
          <ArrowRight className="-ml-2 h-4 w-4 text-primary" />
        </div>

        <article className="paper relative rounded-2xl border border-black/10 p-6 shadow-[0_30px_65px_-28px_hsl(var(--primary)/0.95)]">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-black/10 pb-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-black/45">Approved brief</p>
              <h3 className="font-display text-base font-semibold tracking-tight text-black">Studio relaunch scope</h3>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-status-approved/45 bg-status-approved/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-status-approved">
              <BadgeCheck className="h-3 w-3" />
              Approved
            </span>
          </div>

          <div className="space-y-3 text-[11px] leading-snug text-black/80">
            <DocSection label="Deliverables">
              <li>Homepage redesign + pricing section</li>
              <li>Responsive implementation</li>
              <li>Client-ready handoff brief</li>
            </DocSection>
            <DocSection label="Out of scope">
              <li>CMS migration</li>
              <li>Custom illustration set</li>
            </DocSection>
            <DocSection label="Timeline">
              <li>Week 1: scope lock + direction</li>
              <li>Week 2: design and build</li>
              <li>Week 3: review + launch</li>
            </DocSection>
            <DocSection label="Revision limit">
              <li>Two revision rounds included</li>
            </DocSection>
          </div>
          <div className="mt-3 border-t border-black/10 pt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-black/45">
            Briefly - canonical scope document
          </div>
        </article>
      </div>
    </div>
  );
}

function DocSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.13em] text-black/45">{label}</p>
      <ul className="ml-3 list-disc space-y-1">{children}</ul>
    </section>
  );
}

function ComparisonCard({
  tone,
  title,
  points,
  footer,
}: {
  tone: 'good' | 'bad';
  title: string;
  points: string[];
  footer: string;
}) {
  const good = tone === 'good';

  return (
    <article
      className={
        good
          ? 'relative overflow-hidden rounded-2xl border border-primary/40 bg-[linear-gradient(150deg,hsl(var(--surface))_10%,hsl(var(--primary)/0.12)_130%)] p-6 shadow-[0_20px_55px_-26px_hsl(var(--primary)/0.95)]'
          : 'rounded-2xl border border-border/70 bg-background/55 p-6'
      }
    >
      {good && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-violet/30 blur-3xl" />
      )}

      <div className="relative flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{title}</h3>
        {good ? <ShieldCheck className="h-5 w-5 text-primary" /> : <Clock3 className="h-5 w-5 text-muted-foreground" />}
      </div>

      <ul className="relative mt-5 space-y-3 text-sm">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2.5">
            {good ? (
              <Check className="mt-[2px] h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Minus className="mt-[2px] h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={good ? 'text-foreground' : 'text-muted-foreground'}>{point}</span>
          </li>
        ))}
      </ul>

      <p
        className={`relative mt-6 border-t pt-4 font-display text-lg ${
          good ? 'border-primary/30 text-primary' : 'border-border/80 text-muted-foreground'
        }`}
      >
        {footer}
      </p>
    </article>
  );
}

function PricingCard({
  name,
  price,
  cadence,
  description,
  values,
  ctaLabel,
  ctaTo,
  ctaVariant,
  recommended,
}: {
  name: string;
  price: string;
  cadence: string;
  description: string;
  values: string[];
  ctaLabel: string;
  ctaTo: string;
  ctaVariant: 'default' | 'outline';
  recommended?: boolean;
}) {
  return (
    <article
      className={`relative rounded-2xl border p-6 ${
        recommended
          ? 'border-primary/45 bg-[linear-gradient(165deg,hsl(var(--surface))_5%,hsl(var(--primary)/0.16)_150%)] shadow-[0_25px_65px_-30px_hsl(var(--primary)/1)]'
          : 'border-border/70 bg-surface/45'
      }`}
    >
      {recommended && (
        <Badge className="absolute right-5 top-5 bg-primary/18 font-mono text-[10px] uppercase tracking-[0.14em] text-primary hover:bg-primary/18">
          Recommended
        </Badge>
      )}

      <div className="pr-24">
        <h3 className="font-display text-[2rem] font-semibold tracking-tight">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 flex items-baseline gap-2 border-b border-border/70 pb-5">
        <span className="font-display text-4xl font-semibold leading-none tracking-tight">{price}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{cadence}</span>
      </div>

      <ul className="mt-5 space-y-2.5 text-sm">
        {values.map((value) => (
          <li key={value} className="flex items-start gap-2">
            <Dot className="h-4 w-4 shrink-0 text-primary" />
            <span>{value}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <Button asChild className="h-11 w-full" variant={ctaVariant} size="lg">
          <Link to={ctaTo}>
            {ctaLabel}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: Array<{ label: string; href: string; internal?: boolean; external?: boolean }>;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{heading}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            {link.internal ? (
              <Link to={link.href} className="text-foreground/85 transition hover:text-foreground">
                {link.label}
              </Link>
            ) : link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-foreground/85 transition hover:text-foreground"
              >
                {link.label}
                <ArrowUpRight className="h-3 w-3" />
              </a>
            ) : (
              <a href={link.href} className="text-foreground/85 transition hover:text-foreground">
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
