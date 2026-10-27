'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { authenticate } from '@/app/admin/actions';

export default function AuthForm({ mode }: { mode: 'login' | 'sign-up' }) {
  const [state, action, pending] = useActionState(authenticate.bind(null, mode), {});
  const title = mode === 'login' ? 'Log in' : 'Sign up';
  return (
    <div className="ed">
      <div className="adm-top"><h1>{title}</h1></div>
      <form action={action} className="card">
        <label className="eyebrow" htmlFor="email">Email</label>
        <input className="lede-in" id="email" name="email" type="email" autoComplete="email" required />
        <label className="eyebrow" htmlFor="password">Password</label>
        <input className="lede-in" id="password" name="password" type="password" minLength={8} maxLength={128} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
        <p><button className="btn" type="submit" disabled={pending}>{title}</button></p>
        {state.error && <p className="muted" role="alert">{state.error}</p>}
        {state.message && <p className="muted" role="status">{state.message}</p>}
        <Link className="back" href={mode === 'login' ? '/admin/sign-up' : '/admin/login'}>{mode === 'login' ? 'Sign up' : 'Log in'}</Link>
      </form>
    </div>
  );
}
