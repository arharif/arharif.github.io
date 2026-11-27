import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { X1Mark } from '@/components/branding/X1Mark';
import { OwnerAccessDeniedError, useAuth } from '@/hooks/useAuth';
import { hasSupabaseCoreConfig, genericAuthError } from '@/lib/config';

export default function LoginPage() {
  const { verifyOtpCode, beginSecureLogin, pendingMfa, cancelPendingLogin, loading, isAdmin } = useAuth();
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
      } else if (++attempts.current >= 3) {
        attempts.current = 0; setLocked(true);
        setError('Please wait 30 seconds before trying again.');
      } else setError(pendingMfa
        ? 'Verification failed. Try a fresh six-digit code from your authenticator.'
        : genericAuthError);
    }
  }
  if (isAdmin) return <Navigate to="/admin" replace/>;
  return <section className="mx-auto max-w-md py-16">
    <form className="owner-login glass rounded-2xl p-6" onSubmit={submit}>
      <header className="flex items-center gap-3"><X1Mark/><h1 className="text-2xl font-semibold">Owner sign in</h1></header>
      <fieldset disabled={loading || locked}>
        {pendingMfa ? <>
          {pendingMfa.secret && <p className="my-4 text-sm">Add X1 Publishing to your authenticator using this setup key.
            <code className="block break-all select-all">{pendingMfa.secret}</code></p>}
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
      {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
      {!hasSupabaseCoreConfig && <p className="mt-3 text-sm text-muted">Owner sign-in requires the site’s Supabase connection.</p>}
    </form>
  </section>;
}
