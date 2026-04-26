import { useEffect, useState } from 'react';
import { Loader2, Sun, Moon, Save, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { isPro } from '@/services/billing';

export default function Settings() {
  const { user } = useAuth();
  const { profile, isLoading, update } = useProfile();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');

  useEffect(() => { document.title = 'Settings · Briefly'; }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setCompany(profile.company ?? '');
    }
  }, [profile]);

  const dirty =
    (profile?.full_name ?? '') !== fullName ||
    (profile?.company ?? '') !== company;

  const saveProfile = async () => {
    try {
      await update.mutateAsync({ full_name: fullName || null, company: company || null });
      toast({ title: 'Profile saved' });
    } catch (e) {
      toast({ title: 'Could not save', description: String((e as Error).message), variant: 'destructive' });
    }
  };

  const setTheme = async (theme: 'light' | 'dark') => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('briefly-theme', theme);
    try {
      await update.mutateAsync({ theme });
    } catch {
      // theme already applied locally
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentTheme = profile?.theme ?? 'dark';
  const pro = isPro(profile);

  return (
    <div className="anim-in mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Account</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="mt-8 space-y-6">
        {/* Profile */}
        <section className="panel p-5">
          <h2 className="font-display text-lg font-semibold">Profile</h2>
          <p className="mt-1 text-sm text-muted-foreground">How you appear inside Briefly.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input value={user?.email ?? ''} disabled className="mt-1.5" />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="mt-1.5"
              />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Studio / company</Label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Independent"
                className="mt-1.5"
              />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={saveProfile} disabled={!dirty || update.isPending}>
              {update.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              Save changes
            </Button>
          </div>
        </section>

        {/* Appearance */}
        <section className="panel p-5">
          <h2 className="font-display text-lg font-semibold">Appearance</h2>
          <p className="mt-1 text-sm text-muted-foreground">Briefly is built for dark editorial work, but you can switch.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <ThemeCard
              label="Dark"
              icon={<Moon className="h-4 w-4" />}
              active={currentTheme === 'dark'}
              onClick={() => setTheme('dark')}
            />
            <ThemeCard
              label="Light"
              icon={<Sun className="h-4 w-4" />}
              active={currentTheme === 'light'}
              onClick={() => setTheme('light')}
            />
          </div>
        </section>

        {/* Plan */}
        <section className="panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold">Current plan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You're on the <span className="font-medium capitalize text-foreground">{profile?.plan ?? 'free'}</span> plan.
                {pro && profile?.current_period_end && (
                  <> Renews {new Date(profile.current_period_end).toLocaleDateString()}.</>
                )}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/app/billing">
                Manage billing <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

function ThemeCard({
  label, icon, active, onClick,
}: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`ring-focus flex items-center justify-between rounded-md border p-4 text-left transition ${
        active
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-border/80 hover:bg-secondary/50'
      }`}
    >
      <span className="flex items-center gap-2.5 text-sm font-medium">
        {icon} {label}
      </span>
      <span
        className={`h-2 w-2 rounded-full ${active ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      />
    </button>
  );
}
