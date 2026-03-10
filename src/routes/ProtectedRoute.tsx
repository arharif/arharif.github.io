import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { genericAccessDenied } from '@/lib/config';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { session, isAdmin } = useAuth();

  if (!session) return <Navigate to="/login" replace />;
  if (!isAdmin) return <div className="glass rounded-2xl p-6">{genericAccessDenied}</div>;

  return children;
}
