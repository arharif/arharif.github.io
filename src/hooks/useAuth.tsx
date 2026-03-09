import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { appEnv, isSupabaseConfigured } from '@/lib/env';
import { AuthSession, getUser, sendOtpEmail, supabaseLogout, verifyOtpEmail } from '@/lib/supabase';

interface AuthCtx {
  session: AuthSession | null;
  isAdmin: boolean;
  loading: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const storageKey = 'arharif-auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const token = hash.get('access_token');
    const refresh = hash.get('refresh_token');
    const type = hash.get('token_type') || 'bearer';
    const expires = Number(hash.get('expires_in') || 3600);
    if (token && refresh) {
      getUser(token)
        .then((user) => {
          const next: AuthSession = { access_token: token, refresh_token: refresh, token_type: type, expires_in: expires, user };
          setSession(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
          history.replaceState(null, '', window.location.pathname + window.location.search);
        })
        .catch(() => undefined);
    }
  }, []);

  const isAdmin = session?.user.email?.toLowerCase() === appEnv.adminEmail;

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      isAdmin: Boolean(isAdmin),
      loading,
      sendOtp: async (email) => {
        if (!isSupabaseConfigured) throw new Error('Supabase env vars missing.');
        setLoading(true);
        try {
          await sendOtpEmail(email);
        } finally {
          setLoading(false);
        }
      },
      verifyOtp: async (email, otp) => {
        if (!isSupabaseConfigured) throw new Error('Supabase env vars missing.');
        setLoading(true);
        try {
          const next = await verifyOtpEmail(email, otp);
          setSession(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        if (session?.access_token && isSupabaseConfigured) await supabaseLogout(session.access_token).catch(() => undefined);
        setSession(null);
        localStorage.removeItem(storageKey);
      },
    }),
    [isAdmin, loading, session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
