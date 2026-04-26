import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute, PublicOnlyRoute } from '@/components/RouteGuards';
import { AppShell } from '@/components/AppShell';
import Index from './pages/Index';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Dashboard from './pages/app/Dashboard';
import BriefsList from './pages/app/BriefsList';
import BriefEditor from './pages/app/BriefEditor';
import BriefPreview from './pages/app/BriefPreview';
import LiveBuilder from './pages/app/LiveBuilder';
import Settings from './pages/app/Settings';
import Billing from './pages/app/Billing';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider delayDuration={200}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth" element={<Auth />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Dashboard />} />
                <Route path="briefs" element={<BriefsList />} />
                <Route path="build" element={<LiveBuilder />} />
                <Route path="briefs/:id" element={<BriefEditor />} />
                <Route path="briefs/:id/preview" element={<BriefPreview />} />
                <Route path="billing" element={<Billing />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
