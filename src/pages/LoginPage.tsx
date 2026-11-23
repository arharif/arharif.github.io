import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X1Mark } from '@/components/branding/X1Mark';
import { useAuth } from '@/hooks/useAuth';
import { hasSupabaseCoreConfig, genericAuthError } from '@/lib/config';
export default function LoginPage() {
  const { verifyOtpCode, beginSecureLogin, pendingMfa, cancelPendingLogin, loading, isAdmin, session } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { if (session && isAdmin) nav('/admin', { replace: true }); }, [isAdmin, nav, session]);

  useEffect(() => {
    if (!lockUntil) return;
    const t = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= lockUntil) {
        setLockUntil(null);
        setAttempts(0);
      }
    }, 1000);
    return () => window.clearInterval(t);
  }, [lockUntil]);

  const lockSeconds = lockUntil ? Math.max(0, Math.ceil((lockUntil - now) / 1000)) : 0;
  const locked = lockSeconds > 0;

  const sanitizedEmail = email.trim().toLowerCase();
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail);
  const sanitizedOtp = otp.trim();
  const otpReady = /^\d{6}$/.test(sanitizedOtp);
  const inOtpStep = Boolean(pendingMfa);

  const registerFailure = () => {
    setAttempts((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        const until = Date.now() + 30_000;
        setLockUntil(until);
        setError('Too many attempts. Please wait 30 seconds before trying again.');
        return 0;
      }
      return next;
    });
  };

  return (
    <section className="mx-auto max-w-md py-20">
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3"><X1Mark size="md" /><h1 className="text-2xl font-semibold">Owner sign in</h1></div>
            {!inOtpStep ? (
              <>
                <input className="mt-4 w-full rounded-xl bg-white/10 p-2" value={email} onChange={(e) => setEmail(e.target.value.slice(0, 120))} aria-label="Email" placeholder="Email" disabled={locked} autoComplete="email" />
                <input className="mt-3 w-full rounded-xl bg-white/10 p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value.slice(0, 128))} aria-label="Password" placeholder="Password" autoComplete="current-password" disabled={locked} />
                <button
                  className="mt-3 w-full rounded-xl bg-white/15 px-4 py-2"
                  disabled={loading || locked || !hasSupabaseCoreConfig || !validEmail || !password}
                  onClick={async()=>{
                    setError('');
                    try {
                      await beginSecureLogin(sanitizedEmail, password);
                      setPassword('');
                      setOtp('');
                      setAttempts(0);
                    } catch {
                      registerFailure();
                      if (!locked) setError(genericAuthError);
                    }
                  }}
                >
                  {loading ? 'Processing...' : 'Continue'}
                </button>
              </>
            ) : (
              <>
                {pendingMfa?.secret ? <p className="mt-4 text-sm">Add X1 Publishing to your authenticator using this setup key, then enter its six-digit code. <code className="block break-all select-all">{pendingMfa.secret}</code></p> : <p className="mt-4 text-sm">Enter the six-digit code from your authenticator.</p>}
                <input inputMode="numeric" className="mt-3 w-full rounded-xl bg-white/10 p-2" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="One-time code" autoComplete="one-time-code" disabled={locked} aria-label="One-time code" />
                <button
                  className="mt-3 w-full rounded-xl bg-white/15 px-4 py-2"
                  disabled={loading || locked || !hasSupabaseCoreConfig || !otpReady}
                  onClick={async () => {
                    setError('');
                    try {
                      await verifyOtpCode(sanitizedOtp);
                      setAttempts(0);
                      nav('/admin', { replace: true });
                    } catch {
                      registerFailure();
                      if (!locked) setError(genericAuthError);
                    }
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
                <button className="mt-2 w-full rounded-xl bg-white/5 px-4 py-2 text-xs text-muted" onClick={() => { cancelPendingLogin(); setOtp(''); setError(''); }} disabled={loading || locked}>Back</button>
              </>
            )}

        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        {locked && <p className="mt-3 text-xs text-amber-300">Temporary lock active. Try again in {lockSeconds}s.</p>}
        {!hasSupabaseCoreConfig && <p className="mt-3 text-xs text-amber-300">Authentication could not be completed.</p>}
      </div>
    </section>
  );
}
