import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { config, genericAccessDenied, genericAuthError, hasSupabaseCoreConfig } from '@/lib/config';
import { AuthSession, getUser, signInWithOtp, signInWithPassword, supabaseLogout, verifyOtp } from '@/lib/supabase';

interface AuthCtx {
  session: AuthSession | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtpCode: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const storageKey = 'x1-auth-session';

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
    if (token && refresh && hasSupabaseCoreConfig) {
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

  const isAdmin = Boolean(session?.user.email && config.adminEmail && session.user.email.toLowerCase() === config.adminEmail);

  const ensureAdmin = (next: AuthSession) => {
    const email = next.user.email?.toLowerCase();
    if (!email || !config.adminEmail || email !== config.adminEmail) {
      throw new Error(genericAccessDenied);
    }
  };

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      isAdmin,
      loading,
      loginWithPassword: async (email, password) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        setLoading(true);
        try {
          const next = await signInWithPassword(email, password);
          ensureAdmin(next);
          setSession(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        } finally {
          setLoading(false);
        }
      },
      sendOtp: async (email) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        setLoading(true);
        try {
          await signInWithOtp(email);
        } finally {
          setLoading(false);
        }
      },
      verifyOtpCode: async (email, otp) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        setLoading(true);
        try {
          const next = await verifyOtp(email, otp);
          ensureAdmin(next);
          setSession(next);
          localStorage.setItem(storageKey, JSON.stringify(next));
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        if (session?.access_token && hasSupabaseCoreConfig) await supabaseLogout(session.access_token).catch(() => undefined);
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
  if (!ctx) throw new Error('Authentication context unavailable.');
  return ctx;
}
