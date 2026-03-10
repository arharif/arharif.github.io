import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { config, genericAccessDenied, genericAuthError, hasSupabaseCoreConfig } from '@/lib/config';
import { AuthSession, getUser, signInWithOtp, signInWithPassword, supabaseLogout, verifyOtp } from '@/lib/supabase';
import { safeStorage } from '@/lib/storage';

interface AuthCtx {
  session: AuthSession | null;
  isAdmin: boolean;
  loading: boolean;
  beginSecureLogin: (email: string, password: string) => Promise<void>;
  requestOtpChallenge: (email: string) => Promise<void>;
  verifyOtpCode: (otp: string) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const storageKey = 'x1-auth-session';

const readAuthStorage = () => safeStorage.get(storageKey, 'session') ?? safeStorage.get(storageKey, 'local');

const writeAuthStorage = (value: string) => {
  safeStorage.set(storageKey, value, 'session');
  safeStorage.remove(storageKey, 'local');
};

const clearAuthStorage = () => safeStorage.remove(storageKey, 'both');

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const raw = readAuthStorage();
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.access_token || !parsed?.refresh_token || !parsed?.token_type || !parsed?.user?.id) return null;
      return parsed;
    } catch {
      clearAuthStorage();
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [challengeEmail, setChallengeEmail] = useState<string | null>(null);

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
          writeAuthStorage(JSON.stringify(next));
          history.replaceState(null, '', window.location.pathname + window.location.search);
        })
        .catch(() => undefined);
    }
  }, []);

  const normalizedAdminEmail = config.adminEmail?.toLowerCase() ?? '';
  const isAdmin = Boolean(session?.user.email && normalizedAdminEmail && session.user.email.toLowerCase() === normalizedAdminEmail);

  useEffect(() => {
    if (!session?.access_token || !hasSupabaseCoreConfig) return;
    getUser(session.access_token)
      .then((user) => {
        if (!user?.id) throw new Error('invalid-session');
        const email = user.email?.toLowerCase();
        if (!email || !normalizedAdminEmail || email !== normalizedAdminEmail) throw new Error(genericAccessDenied);
        const next = { ...session, user };
        setSession(next);
        writeAuthStorage(JSON.stringify(next));
      })
      .catch(async () => {
        if (session?.access_token) await supabaseLogout(session.access_token).catch(() => undefined);
        setSession(null);
        setChallengeEmail(null);
        clearAuthStorage();
      });
  }, [normalizedAdminEmail, session?.access_token]);

  const ensureAdmin = (next: AuthSession) => {
    const email = next.user.email?.toLowerCase();
    if (!email || !normalizedAdminEmail || email !== normalizedAdminEmail) {
      throw new Error(genericAccessDenied);
    }
  };

  const value = useMemo<AuthCtx>(
    () => ({
      session,
      isAdmin,
      loading,
      beginSecureLogin: async (email, password) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        setLoading(true);
        try {
          const next = await signInWithPassword(email, password);
          ensureAdmin(next);
          setSession(next);
          writeAuthStorage(JSON.stringify(next));
          setChallengeEmail(null);
        } catch {
          throw new Error(genericAuthError);
        } finally {
          setLoading(false);
        }
      },
      requestOtpChallenge: async (email) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        setLoading(true);
        try {
          await signInWithOtp(email);
          setChallengeEmail(email);
        } catch {
          throw new Error(genericAuthError);
        } finally {
          setLoading(false);
        }
      },
      verifyOtpCode: async (otp) => {
        if (!hasSupabaseCoreConfig) throw new Error(genericAuthError);
        if (!challengeEmail) throw new Error(genericAuthError);
        setLoading(true);
        try {
          const next = await verifyOtp(challengeEmail, otp);
          ensureAdmin(next);
          setSession(next);
          writeAuthStorage(JSON.stringify(next));
          setChallengeEmail(null);
        } catch {
          throw new Error(genericAuthError);
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        if (session?.access_token && hasSupabaseCoreConfig) await supabaseLogout(session.access_token).catch(() => undefined);
        setSession(null);
        setChallengeEmail(null);
        clearAuthStorage();
      },
    }),
    [challengeEmail, isAdmin, loading, session],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Authentication context unavailable.');
  return ctx;
}
