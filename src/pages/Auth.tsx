import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileSignature, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function Auth() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign in · Briefly' : 'Create account · Briefly';
  }, [mode]);

  useEffect(() => {
    if (!loading && user) navigate('/app', { replace: true });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name },
          },
        });
        if (error) {
          toast({
            title: error.message.toLowerCase().includes('registered') ? 'Email already in use' : 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        toast({ title: 'Welcome to Briefly', description: 'Account created.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: 'Sign in failed', description: 'Check your email and password.', variant: 'destructive' });
          return;
        }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark relative flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="absolute inset-0 grid-bg opacity-50" aria-hidden />
      <div className="absolute -top-40 left-1/2 h-[480px] w-[800px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" aria-hidden />
      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md gradient-brand">
            <FileSignature className="h-4 w-4 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <span className="font-display text-base font-semibold text-foreground">Briefly</span>
        </button>

        <div className="panel-elev p-7">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === 'signin'
              ? 'Sign in to your brief workspace.'
              : 'Free to start. No credit card needed.'}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.co" required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
            </div>

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>No account?{' '}
                <button onClick={() => setMode('signup')} className="font-medium text-primary hover:underline">Create one</button>
              </>
            ) : (
              <>Already have one?{' '}
                <button onClick={() => setMode('signin')} className="font-medium text-primary hover:underline">Sign in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
