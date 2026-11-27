import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { genericAuthError, hasSupabaseCoreConfig } from "@/lib/config";
import {
  AuthSession,
  discardUnverifiedFactor,
  SupabaseAuthError,
  SupabaseConnectionError,
  SupabaseRequestError,
  x1TotpName,
  enrollTotp,
  getUser,
  refreshSession,
  signInWithPassword,
  supabaseLogout,
  supabaseRest,
  verifyTotp,
} from "@/lib/supabase";
import { safeStorage } from "@/lib/storage";

export class OwnerAccessDeniedError extends Error {}

interface Challenge {
  token: string;
  factorId: string;
  secret?: string;
  qr?: string;
}
interface AuthCtx {
  session: AuthSession | null;
  isAdmin: boolean;
  loading: boolean;
  pendingMfa: Pick<Challenge, "secret" | "qr"> | null;
  notice: string;
  beginSecureLogin: (email: string, password: string) => Promise<void>;
  verifyOtpCode: (otp: string) => Promise<void>;
  cancelPendingLogin: () => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);
const key = "x1-auth-session";
const pendingLifetime = 5 * 60 * 1000;
const expires = (session: AuthSession) => (session.expires_at ?? 0) * 1000;
const retryable = (error: unknown) => error instanceof SupabaseConnectionError ||
  ((error instanceof SupabaseRequestError || error instanceof SupabaseAuthError) && (error.status === 429 || error.status >= 500));
const allowed = (token: string, rpc: "is_x1_owner" | "can_publish_x1") =>
  supabaseRest<boolean>("rpc/" + rpc, { method: "POST", body: "{}" }, token);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(() =>
    Boolean(safeStorage.get(key, "session")),
  );
  const [pendingMfa, setPending] = useState<Challenge | null>(null);
  const [notice, setNotice] = useState("");
  const generation = useRef(0);
  const active = useRef<AuthSession | null>(null);
  const timer = useRef<number>();
  function clear(message = "") {
    generation.current++;
    window.clearTimeout(timer.current);
    safeStorage.remove(key, "both");
    active.current = null;
    setPending(null);
    setSession(null);
    setLoading(false);
    setNotice(message);
  }
  async function accept(next: AuthSession, revision: number) {
    if ((await allowed(next.access_token, "can_publish_x1")) !== true)
      throw new Error(genericAuthError);
    if (revision !== generation.current) return;
    if (!next.user?.id) next = {...next, user: await getUser(next.access_token)};
    if (revision !== generation.current) return;
    if (!next.expires_at) next = { ...next, expires_at: Math.floor(Date.now() / 1000) + next.expires_in };
    active.current = next;
    safeStorage.set(key, JSON.stringify(next), "session");
    setSession(next);
    setPending(null);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => void renew(next, revision),
      Math.max(1000, expires(next) - Date.now() - 60_000),
    );
  }
  async function renew(previous: AuthSession, revision: number) {
    let replacement: AuthSession | undefined;
    try {
      replacement = await refreshSession(previous.refresh_token);
      await accept(replacement, revision);
    } catch (error) {
      if (revision !== generation.current) return;
      if (retryable(error) && expires(previous) > Date.now()) {
        // A rotated refresh token must never be reused after the server has
        // already issued a replacement.
        timer.current = window.setTimeout(() => {
          if (!replacement) void renew(previous, revision);
          else void accept(replacement, revision).catch(() => {
            if (revision === generation.current) clear("Your session could not be restored. Sign in again.");
          });
        }, Math.min(5000, expires(previous) - Date.now()));
      } else clear("Your session expired or could not be restored. Sign in again.");
    }
  }

  useEffect(() => {
    safeStorage.remove(key, "local");
    safeStorage.remove("x1-auth-mfa-pending", "both");
    const revision = ++generation.current;
    const raw = safeStorage.get(key, "session");
    if (raw && hasSupabaseCoreConfig) {
      // Validate the current grant before mounting the studio. A reload must
      // not rotate a single-use refresh token twice in React Strict Mode.
      void Promise.resolve()
        .then(async () => {
          if (revision !== generation.current) return;
          const saved = JSON.parse(raw) as AuthSession;
          if (expires(saved) > Date.now() + 60_000) await accept(saved, revision);
          else await accept(await refreshSession(saved.refresh_token), revision);
        })
        .catch(() => {
          if (revision === generation.current) clear("Your session could not be restored. Sign in again.");
        })
        .finally(() => {
          if (revision === generation.current) setLoading(false);
        });
    } else setLoading(false);
    return () => {
      generation.current++;
      window.clearTimeout(timer.current);
    };
  }, []);

  async function beginSecureLogin(email: string, password: string) {
    clear();
    const revision = generation.current;
    setLoading(true);
    let first: AuthSession | undefined;
    try {
      first = await signInWithPassword(email, password);
      if ((await allowed(first.access_token, "is_x1_owner")) !== true)
        throw new OwnerAccessDeniedError();
      const user = await getUser(first.access_token);
      const verified = user.factors?.find(
        (f) => f.factor_type === "totp" && f.status === "verified",
      );
      if (!verified) {
        for (const factor of user.factors ?? []) await discardUnverifiedFactor(first.access_token, factor);
      }
      const factor = verified ? null : await enrollTotp(first.access_token);
      if (revision === generation.current) {
        setPending({
          token: first.access_token,
          factorId: verified?.id ?? factor!.id,
          secret: factor?.totp.secret,
          qr: factor?.totp.qr_code,
        });
        const token = first.access_token;
        timer.current = window.setTimeout(() => {
          clear("Authenticator verification expired. Sign in again to continue.");
          void supabaseLogout(token).catch(() => undefined);
        }, pendingLifetime);
      } else {
        void supabaseLogout(first.access_token).catch(() => undefined);
      }
    } catch (error) {
      if (first) void supabaseLogout(first.access_token).catch(() => undefined);
      if (error instanceof OwnerAccessDeniedError || error instanceof SupabaseAuthError || retryable(error)) throw error;
      throw new Error(genericAuthError);
    } finally {
      if (revision === generation.current) setLoading(false);
    }
  }
  async function verifyOtpCode(code: string) {
    if (!pendingMfa || !/^\d{6}$/.test(code)) throw new Error(genericAuthError);
    const revision = generation.current;
    setLoading(true);
    try {
      await accept(
        await verifyTotp(pendingMfa.token, pendingMfa.factorId, code),
        revision,
      );
    } finally {
      if (revision === generation.current) setLoading(false);
    }
  }
  async function logout() {
    const token = active.current?.access_token ?? pendingMfa?.token;
    if (active.current) {
      const prefix = "x1-editor:" + active.current.user.id + ":";
      try {
        for (const draft of Object.keys(sessionStorage)) {
          if (draft.startsWith(prefix)) safeStorage.remove(draft, "session");
        }
      } catch {
        /* Storage can be unavailable in private browsing. */
      }
    }
    clear(active.current ? "You signed out." : "");
    if (token) await supabaseLogout(token).catch(() => undefined);
  }
  return (
    <Ctx.Provider
      value={{
        session,
        isAdmin: Boolean(session),
        loading,
        pendingMfa: pendingMfa && { secret: pendingMfa.secret, qr: pendingMfa.qr },
        notice,
        beginSecureLogin,
        verifyOtpCode,
        cancelPendingLogin: () => {
          void logout();
        },
        logout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Authentication context unavailable.");
  return ctx;
}
