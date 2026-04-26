import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-2 w-2 rounded-full bg-primary pulse-dot" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app" replace />;
  return <Outlet />;
}
