import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { appEnv, isSupabaseConfigured } from '@/lib/env';
import { AuthSession, supabaseAuthLogin, supabaseLogout } from '@/lib/supabase';

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const storageKey = 'arharif-admin-session';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  });
  const [loading, setLoading] = useState(false);

  const isAdmin = Boolean(session?.user.email && appEnv.adminEmails.includes(session.user.email.toLowerCase()));

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      isAdmin,
      login: async (email, password) => {
        if (!isSupabaseConfigured) throw new Error('Supabase env is not configured.');
        setLoading(true);
        try {
          const next = await supabaseAuthLogin(email, password);
          setSession(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        if (session?.access_token && isSupabaseConfigured) {
          await supabaseLogout(session.access_token).catch(() => undefined);
        }
        setSession(null);
        localStorage.removeItem(storageKey);
      },
    }),
    [isAdmin, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
