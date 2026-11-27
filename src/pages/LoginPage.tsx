import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { X1Mark } from '@/components/branding/X1Mark';
import { OwnerAccessDeniedError, useAuth } from '@/hooks/useAuth';
import { hasSupabaseCoreConfig, genericAuthError } from '@/lib/config';
import { SupabaseAuthError, SupabaseConnectionError } from '@/lib/supabase';

function qrImage(value?: string) {
  if (!value || value.length > 100_000) return undefined;
  const svg = value.replace(/^data:image\/svg\+xml(?:;utf-?8|;charset=utf-8)?,/i, '');
  if (svg.trimStart().startsWith('<svg')) return 'data:image/svg+xml,' + encodeURIComponent(svg);
  if (/^data:image\/svg\+xml(?:;utf-?8|;charset=utf-8)?,%3csvg/i.test(value)) return value;
  return undefined;
}

export default function LoginPage() {
  const { verifyOtpCode, beginSecureLogin, pendingMfa, cancelPendingLogin, loading, isAdmin, notice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const attempts = useRef(0);
  const codeInput = useRef<HTMLInputElement>(null);
  useEffect(() => { if (pendingMfa) codeInput.current?.focus(); }, [pendingMfa]);
  useEffect(() => {
    if (!locked) return;
    const timer = window.setTimeout(() => { setLocked(false); setError(''); }, 30_000);
    return () => window.clearTimeout(timer);
  }, [locked]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading || locked || !hasSupabaseCoreConfig) return;
    setError('');
    try {
      if (pendingMfa) await verifyOtpCode(code);
      else { await beginSecureLogin(email.trim(),password); setPassword(''); }
      setCode(''); attempts.current = 0;
    } catch (failure) {
      if (failure instanceof OwnerAccessDeniedError) {
        setPassword('');
        setError('Sign in with the account configured for X1 owner access.');
      } else if (failure instanceof SupabaseConnectionError) {
        setError('The sign-in service could not be reached. Check your connection and try again.');
      } else if (++attempts.current >= 3) {
        attempts.current = 0; setLocked(true);
        setError('Please wait 30 seconds before trying again.');
      } else setError(pendingMfa
        ? 'Verification failed. Try a fresh six-digit code from your authenticator.'
        : failure instanceof SupabaseAuthError && failure.code === 'invalid_credentials'
          ? 'Email or password is incorrect.'
          : genericAuthError);
    }
  }
  const qr = qrImage(pendingMfa?.qr);
  if (isAdmin) return <Navigate to="/admin" replace/>;
  return <section className="mx-auto max-w-md py-16">
    <form className="owner-login glass rounded-2xl p-6" onSubmit={submit}>
      <header className="flex items-center gap-3"><X1Mark/><h1 className="text-2xl font-semibold">Owner sign in</h1></header>
      <fieldset disabled={loading || locked}>
        {pendingMfa ? <>
          {pendingMfa.secret && <div className="my-4 space-y-3 text-sm">
            <p>Set up X1 Publishing in your authenticator app.</p>
            {qr && <img src={qr} alt="Scan with your authenticator app" width={160} height={160} className="rounded bg-white p-2" />}
            <details><summary>Enter a setup key manually</summary>
              <code className="block break-all select-all">{pendingMfa.secret}</code>
            </details>
          </div>}
          <label>One-time code<input ref={codeInput} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code"
            required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label>
          <p className="text-sm text-muted">Enter the six-digit code from your authenticator.</p>
        </> : <>
          <label>Email<input type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} /></label>
          <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /></label>
        </>}
        <button className="owner-submit" disabled={!hasSupabaseCoreConfig || (pendingMfa ? code.length !== 6 : !email || !password)}>
          {loading ? 'Verifying…' : pendingMfa ? 'Verify' : 'Continue'}
        </button>
        {pendingMfa && <button type="button" className="mt-3 w-full" onClick={() => {cancelPendingLogin();setCode('');setError('');}}>Back</button>}
      </fieldset>
      {notice && !error && <p role="status" className="mt-3 text-sm">{notice}</p>}
      <details className="mt-4 text-sm text-muted"><summary>Authenticator recovery</summary>
        <p>Use your existing authenticator, a trusted backup, or the device transfer feature in your authenticator app. If you lost access, contact the Supabase project administrator for identity-verified recovery.</p>
      </details>
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      {!hasSupabaseCoreConfig && <p className="mt-3 text-sm text-muted">Owner sign-in requires the site’s Supabase connection.</p>}
    </form>
  </section>;
}
