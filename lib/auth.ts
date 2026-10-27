import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { serviceClient } from './supabase/service';
import { signupsOpen } from './content';

export async function getAdmin() {
  const db = await createClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;
  const { data, error } = await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data ? user : null;
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect('/admin/login');
  return admin;
}

export async function canSignup() {
  const { count, error } = await serviceClient().from('admins').select('*', { count: 'exact', head: true });
  if (error || count === null) throw error ?? new Error('Could not check sign-ups');
  return signupsOpen(count);
}
