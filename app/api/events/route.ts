import { NextRequest, NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase/service';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 2048) return NextResponse.json({ error: 'Too large' }, { status: 413 });
  const text = await request.text();
  if (text.length > 2048) return NextResponse.json({ error: 'Too large' }, { status: 413 });
  let body;
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body || !['visit', 'view', 'read'].includes(body.type) || (body.type !== 'visit' && (typeof body.postId !== 'string' || !uuid.test(body.postId)))) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  const db = serviceClient();
  if (body.type !== 'visit') {
    const { data, error } = await db.from('posts').select('id').eq('id', body.postId).eq('status', 'published').maybeSingle();
    if (error) return NextResponse.json({ error: 'Could not load post' }, { status: 503 });
    if (!data) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  const existing = request.cookies.get('visitor_id')?.value;
  const visitor = existing && uuid.test(existing) ? existing : crypto.randomUUID();
  const { error: visitorError } = await db.from('visitors').upsert({ id: visitor }, { onConflict: 'id', ignoreDuplicates: true });
  if (visitorError) return NextResponse.json({ error: 'Could not record visit' }, { status: 503 });
  if (body.type !== 'visit') {
    // A completed read always has a view, including a read request after a failed page-load request.
    const types = body.type === 'read' ? ['view', 'read'] : ['view'];
    const { error } = await db.from('post_events').upsert(types.map(type => ({ post_id: body.postId, visitor_id: visitor, type })), { onConflict: 'post_id,visitor_id,type,event_day', ignoreDuplicates: true });
    if (error) return NextResponse.json({ error: 'Could not record event' }, { status: 503 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('visitor_id', visitor, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 31536000 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
