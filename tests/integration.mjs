import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const origin = process.env.TEST_ORIGIN ?? 'http://localhost:3000';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const service = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const anon = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { auth: { persistSession: false } });
const suffix = crypto.randomUUID();
const ids = [];
let visitor;
try {
  for (const status of ['draft', 'published']) {
    const { data, error } = await service.from('posts').insert({ title: `Verification ${status}`, slug: `verification-${status}-${suffix}`, status, published_at: status === 'published' ? new Date().toISOString() : null, content_html: '<p>Verified content.</p><script>window.bad=true</script>' }).select().single();
    assert.ifError(error); ids.push(data.id);
  }
  const rows = await anon.from('posts').select('id').in('id', ids);
  assert.ifError(rows.error); assert.deepEqual(rows.data.map(r => r.id), [ids[1]]);
  for (const table of ['admins','visitors','post_events']) {
    const result = await anon.from(table).select('*');
    assert.ok(result.error || result.data.length === 0, `Anonymous access to ${table}`);
  }
  const deniedPost = await anon.from('posts').insert({ title: 'Forbidden', slug: `forbidden-${suffix}` });
  assert.ok(deniedPost.error);
  const deniedVisitor = await anon.from('visitors').insert({ id: crypto.randomUUID() });
  assert.ok(deniedVisitor.error);
  const draft = await fetch(`${origin}/posts/verification-draft-${suffix}`);
  assert.equal(draft.status, 404);
  const published = await fetch(`${origin}/posts/verification-published-${suffix}`);
  assert.equal(published.status, 200);
  const page = await published.text();
  assert.ok(page.includes('<article class="prose"><p>Verified content.</p></article>'));
  const protectedPage = await fetch(`${origin}/admin/dashboard`, { redirect: 'manual' });
  assert.equal(protectedPage.status, 307); assert.ok(protectedPage.headers.get('location').endsWith('/admin/login'));
  const spoofedPage = await fetch(`${origin}/admin/dashboard`, { redirect: 'manual', headers: { 'x-stillword-admin-public': '1' } });
  assert.equal(spoofedPage.status, 307);
  let cookie = '';
  async function event(type, postId = ids[1], eventOrigin = origin) {
    const response = await fetch(`${origin}/api/events`, { method: 'POST', headers: { Origin: eventOrigin, 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ type, postId }) });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) { cookie = setCookie.split(';')[0]; visitor = cookie.split('=')[1]; }
    return response;
  }
  assert.equal((await event('view', ids[0])).status, 404);
  assert.equal((await event('view', 'bad-id')).status, 400);
  assert.equal((await event('view', ids[1], 'https://other.example')).status, 403);
  assert.equal((await event('view')).status, 200);
  assert.equal((await event('view')).status, 200);
  assert.equal((await event('read')).status, 200);
  assert.equal((await event('read')).status, 200);
  const events = await service.from('post_events').select('type').eq('post_id', ids[1]);
  assert.ifError(events.error); assert.deepEqual(events.data.map(e => e.type).sort(), ['read','view']);
  const uploads = await fetch(`${origin}/api/images`, { method: 'POST', headers: { Origin: origin } });
  assert.equal(uploads.status, 401);
  const members = await service.from('admins').select('*', { count: 'exact', head: true });
  assert.ifError(members.error);
  if (members.count) {
    const closed = await fetch(`${origin}/admin/sign-up`);
    assert.ok((await closed.text()).includes('Sign-ups are closed'));
    const signup = await anon.auth.signUp({ email: `stillword-test-${suffix}@example.com`, password: crypto.randomUUID() });
    assert.ok(signup.error, 'Direct Auth API signup must also be closed');
  }
  console.log('Integration passed: RLS, draft 404, sanitized rendering, proxy guard, validation, deduplication, and upload guard.');
} finally {
  if (ids.length) { const result = await service.from('posts').delete().in('id', ids); assert.ifError(result.error); }
  if (visitor) { const result = await service.from('visitors').delete().eq('id', visitor); assert.ifError(result.error); }
}
