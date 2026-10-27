// Local verification helper. Generates a one-time link without sending email or changing a password.
import { mkdir, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = process.env.TEST_ADMIN_EMAIL;
if (!email) throw new Error('Set TEST_ADMIN_EMAIL to the existing confirmed admin.');
const users = await db.auth.admin.listUsers();
if (users.error) throw users.error;
const user = users.data.users.find(u => u.email === email && u.email_confirmed_at);
if (!user) throw new Error('Confirmed admin user not found.');
const member = await db.from('admins').select('user_id').eq('user_id', user.id).single();
if (member.error) throw member.error;
const { data, error } = await db.auth.admin.generateLink({ type: 'magiclink', email });
if (error) throw error;
await mkdir('.artifacts', { recursive: true });
const origin = process.env.TEST_ORIGIN ?? 'http://localhost:3000';
await writeFile('.artifacts/admin-verification-url.txt', `${origin}/auth/callback?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`);
console.log('Saved the one-time verification URL in the ignored .artifacts directory.');
