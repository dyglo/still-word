import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './database.types';

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = path === '/admin/login' || path === '/admin/sign-up';
  const requestHeaders = new Headers(request.headers);
  // Overwrite untrusted incoming headers; the layout independently checks membership.
  requestHeaders.set('x-stillword-admin-public', isPublic ? '1' : '0');
  let response = NextResponse.next({ request: { headers: requestHeaders } });
  const db = createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        requestHeaders.set('cookie', request.cookies.toString());
        response = NextResponse.next({ request: { headers: requestHeaders } });
        values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await db.auth.getUser();
  const { data: admin } = user ? await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle() : { data: null };
  const target = !isPublic && !admin ? '/admin/login' : isPublic && admin ? '/admin/dashboard' : null;
  if (target) {
    const redirected = NextResponse.redirect(new URL(target, request.url));
    response.cookies.getAll().forEach(cookie => redirected.cookies.set(cookie));
    return redirected;
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
