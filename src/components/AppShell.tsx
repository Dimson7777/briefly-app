import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, CreditCard, Settings as SettingsIcon,
  LogOut, Menu, X, Plus, FileSignature, User as UserIcon, Sparkles, Wand2,
} from 'lucide-react';
import { CommandBar } from './CommandBar';
import { NewBriefDialog } from './NewBriefDialog';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { isPro } from '@/services/billing';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/app', label: 'Studio', icon: LayoutDashboard, end: true },
  { to: '/app/briefs', label: 'Briefs', icon: FileText },
  { to: '/app/build', label: 'Live builder', icon: Wand2 },
  { to: '/app/billing', label: 'Billing', icon: CreditCard },
  { to: '/app/settings', label: 'Settings', icon: SettingsIcon },
];

export type ShellContext = {
  openNewBrief: () => void;
};

export function AppShell() {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'You';
  const initials = displayName
    .split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();
  const pro = isPro(profile);

  return (
    <div className="flex min-h-screen bg-background">
      {/* ---------- Left rail ---------- */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:w-[68px] lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <button
          onClick={() => { setMobileOpen(false); navigate('/app'); }}
          className="ring-focus flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4 lg:justify-center lg:px-0"
          aria-label="Briefly home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md gradient-brand">
            <FileSignature className="h-4 w-4 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight lg:hidden">
            Briefly
          </span>
        </button>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-2 lg:px-2 lg:py-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition lg:justify-center lg:px-0 lg:py-2.5',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                )
              }
              title={item.label}
            >
              {({ isActive }) => (
                <>
                  {/* active indicator bar (icon-rail mode) */}
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary transition-opacity lg:block',
                      isActive ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="lg:hidden">{item.label}</span>
                  {/* tooltip on hover (icon-rail mode) */}
                  <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg transition lg:block lg:group-hover:opacity-100">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom plan card */}
        <div className="border-t border-sidebar-border p-2 lg:p-2">
          <div className="hidden lg:block">
            <button
              onClick={() => { setMobileOpen(false); navigate('/app/billing'); }}
              className={cn(
                'group relative flex h-10 w-full items-center justify-center rounded-md text-xs transition',
                pro
                  ? 'bg-gradient-to-br from-primary/20 to-violet/20 text-primary'
                  : 'bg-sidebar-accent/60 text-sidebar-foreground/75 hover:bg-sidebar-accent',
              )}
              title={pro ? 'Pro plan' : 'Upgrade to Pro'}
            >
              {pro ? <Sparkles className="h-3.5 w-3.5" /> : <span className="font-mono text-[10px] uppercase">Free</span>}
              <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-lg transition lg:block lg:group-hover:opacity-100">
                {pro ? 'Pro plan active' : 'Upgrade to Pro'}
              </span>
            </button>
          </div>

          {/* Mobile expanded plan card */}
          <div className="lg:hidden">
            <div className="rounded-md border border-sidebar-border bg-sidebar-accent/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-medium capitalize">{profile?.plan ?? 'free'}</span>
              </div>
              {!pro && (
                <button
                  onClick={() => { setMobileOpen(false); navigate('/app/billing'); }}
                  className="mt-2 w-full rounded bg-primary px-2 py-1 text-primary-foreground"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
            <button
              onClick={() => signOut()}
              className="mt-2 flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* ---------- Main column ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Workspace header */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button
              className="ring-focus -ml-1 rounded-md p-1.5 hover:bg-secondary lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="hidden flex-col leading-tight sm:flex">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Workspace
              </span>
              <span className="font-display text-sm font-medium">
                {profile?.company || displayName}
              </span>
            </div>

            <div className="ml-auto flex flex-1 items-center justify-end gap-2 sm:ml-6 sm:flex-none sm:flex-1">
              <div className="hidden flex-1 sm:block">
                <CommandBar onNewBrief={() => setNewOpen(true)} />
              </div>

              <Button size="sm" onClick={() => setNewOpen(true)} className="hidden sm:inline-flex">
                <Plus className="mr-1 h-3.5 w-3.5" /> New brief
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ring-focus flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-medium hover:bg-secondary/80"
                    aria-label="Account menu"
                  >
                    {initials}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="font-medium">{displayName}</div>
                    <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                    <UserIcon className="mr-2 h-4 w-4" /> Profile &amp; settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/app/billing')}>
                    <CreditCard className="mr-2 h-4 w-4" /> Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile search + new */}
          <div className="flex items-center gap-2 px-4 pb-3 sm:hidden">
            <div className="flex-1">
              <CommandBar onNewBrief={() => setNewOpen(true)} />
            </div>
            <Button size="sm" onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <Outlet context={{ openNewBrief: () => setNewOpen(true) } satisfies ShellContext} />
        </main>
      </div>

      <NewBriefDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
