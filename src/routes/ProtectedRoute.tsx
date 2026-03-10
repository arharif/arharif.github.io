import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { session, isAdmin } = useAuth();

  if (!session || !isAdmin) return <Navigate to="/login" replace />;

  return children;
}
