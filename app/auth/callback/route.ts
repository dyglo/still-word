import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  if (tokenHash && type && ['email', 'signup', 'magiclink', 'recovery'].includes(type)) {
    const db = await createClient();
    const { error } = await db.auth.verifyOtp({ token_hash: tokenHash, type: type as EmailOtpType });
    if (!error) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const db = await createClient();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  return NextResponse.redirect(new URL('/admin/login', request.url));
}
