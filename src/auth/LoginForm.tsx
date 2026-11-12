import { useState } from 'react';
import type { FormEvent } from 'react';
import { CircleAlert, FileSearch, LoaderCircle, Lock, Mail } from 'lucide-react';
import { useAuth } from './useAuth';

export function LoginForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await (mode === 'login' ? login : register)(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const isLogin = mode === 'login';

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <span className="brand-icon">
          <FileSearch size={26} />
        </span>
        <h1>DocQA</h1>
        <p className="muted">Ask questions about your own documents.</p>
      </div>

      <form className="card auth-form" onSubmit={onSubmit}>
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>

        <label className="field">
          Email
          <span className="input-wrap">
            <Mail size={16} />
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </span>
        </label>

        <label className="field">
          Password
          <span className="input-wrap">
            <Lock size={16} />
            <input
              type="password"
              required
              minLength={8}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </span>
        </label>

        {!isLogin && (
          <p className="muted">At least 8 characters, with an uppercase letter, a lowercase letter and a digit.</p>
        )}

        {error && (
          <div className="alert">
            <CircleAlert size={16} /> {error}
          </div>
        )}

        <button type="submit" className="btn block" disabled={busy}>
          {busy && <LoaderCircle size={16} className="spin" />}
          {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Register'}
        </button>

        <p className="switch">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(isLogin ? 'register' : 'login');
              setError(null);
            }}
          >
            {isLogin ? 'Create an account' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  );
}