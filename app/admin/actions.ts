'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { canSignup, getAdmin, requireAdmin } from '@/lib/auth';

export type AuthState = { error?: string; message?: string };

export async function authenticate(mode: 'login' | 'sign-up', _state: AuthState, form: FormData): Promise<AuthState> {
  if (await getAdmin()) redirect('/admin/dashboard');
  if (mode === 'sign-up' && !(await canSignup())) return { error: 'Sign-ups are closed' };
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 128) return { error: 'Enter an email and a password of at least 8 characters.' };
  const db = await createClient();
  if (mode === 'sign-up') {
    const origin = (await headers()).get('origin');
    if (!origin) return { error: 'Could not determine the return address.' };
    const { data, error } = await db.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/callback` } });
    if (error) return { error: (await canSignup()) ? error.message : 'Sign-ups are closed' };
    if (!data.session) return { message: 'Check your email to confirm your account, then log in.' };
  } else {
    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) return { error: 'Invalid email or password, or email not confirmed.' };
  }
  if (!(await getAdmin())) {
    await db.auth.signOut();
    return { error: 'This account does not have admin access.' };
  }
  redirect('/admin/dashboard');
}

export async function signOut() {
  await requireAdmin();
  const db = await createClient();
  await db.auth.signOut({ scope: 'local' });
  redirect('/admin/login');
}
