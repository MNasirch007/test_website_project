import { useEffect, useState } from 'react';
import { Brand, Icon, Field } from './ui';
import { getSupabase } from './backend';

function AuthForm({ client, recovery = false, onRecovered }) {
  const [mode, setMode] = useState(recovery ? 'recovery' : 'signin');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const title = mode === 'signup' ? 'Start your rental business.' : mode === 'forgot' ? 'Reset your password.' : mode === 'recovery' ? 'Choose a new password.' : 'Welcome back to Renter.';
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    const { email, password } = Object.fromEntries(new FormData(event.currentTarget));
    try {
      let result;
      if (mode === 'signup') {
        result = await client.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}/` } });
        if (!result.error && !result.data.session) setMessage('Check your email to confirm your account, then sign in.');
      } else if (mode === 'forgot') {
        result = await client.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/?reset=password` });
        if (!result.error) setMessage('If this email has an account, a password reset link is on its way.');
      } else if (mode === 'recovery') {
        result = await client.auth.updateUser({ password });
        if (!result.error) { history.replaceState(null, '', '/'); onRecovered(); }
      } else result = await client.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
    } catch (failure) { setError(failure.message); } finally { setBusy(false); }
  }
  function change(next) { setMode(next); setError(''); setMessage(''); }
  return <div className="login-page auth-page"><Brand/><div className="login-icon"><Icon name="Car" size={40}/></div><div className="eyebrow">BUILT FOR LOCAL RENTAL OWNERS</div><h1>{title}</h1><p>Manage cars, bikes, customers and bookings.<br/>Your business, in one workspace.</p><form className="auth-form" onSubmit={submit}>
    {mode !== 'recovery' && <Field label="Email address"><input name="email" type="email" required autoComplete="email" maxLength={254}/></Field>}
    {mode !== 'forgot' && <Field label={mode === 'recovery' ? 'New password' : 'Password'}><input name="password" type="password" aria-label={mode === 'recovery' ? 'New password' : 'Password'} aria-describedby={mode !== 'signin' ? 'password-hint' : undefined} required minLength={mode === 'signin' ? 1 : 10} maxLength={128} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}/>{mode !== 'signin' && <small id="password-hint">Use at least 10 characters.</small>}</Field>}
    {error && <div className="form-error" role="alert">{error}</div>}{message && <p className="auth-message" role="status">{message}</p>}
    <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Send reset link' : mode === 'recovery' ? 'Save new password' : 'Sign in to your workspace'}<Icon name="ArrowRight"/></button>
    {mode === 'signin' && <button className="text-button" type="button" onClick={() => change('forgot')}>Forgot password?</button>}
    {mode !== 'recovery' && <button className="text-button" type="button" onClick={() => change(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'New to Renter? Create an account' : 'Back to sign in'}</button>}
  </form><small>Private review · PKR pricing · Secure owner access</small></div>;
}

export default function Auth({ children }) {
  const [client, setClient] = useState(null), [session, setSession] = useState(null), [ready, setReady] = useState(false), [error, setError] = useState('');
  const [recovery, setRecovery] = useState(() => new URLSearchParams(location.search).get('reset') === 'password');
  useEffect(() => {
    let active = true, subscription;
    getSupabase().then(async ({ client: connected }) => {
      if (!active) return; setClient(connected);
      subscription = connected.auth.onAuthStateChange((event, next) => {
        if (!active) return; setSession(next); if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      }).data.subscription;
      const { data, error: failure } = await connected.auth.getSession();
      if (!active) return; if (failure) throw failure;
      setSession(data.session); setReady(true);
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; subscription?.unsubscribe(); };
  }, []);
  if (error) return <div className="login-page"><Brand/><h1>Connect your workspace</h1><p role="alert">{error}</p><button className="primary" onClick={() => location.reload()}>Try again</button></div>;
  if (!ready) return <div className="loading-page"><Brand/><span className="loading-spinner"/><p>Opening your rental workspace…</p></div>;
  if (!session || recovery) return <AuthForm key={recovery ? 'reset' : 'login'} client={client} recovery={Boolean(session && recovery)} onRecovered={() => setRecovery(false)}/>;
  return <div key={session.user.id}>{children}</div>;
}
