import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

const formats: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' };

export async function POST(request: NextRequest) {
  if (!(await getAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > 5500000) return NextResponse.json({ error: 'Maximum image size is 5 MB.' }, { status: 413 });
  let form;
  try { form = await request.formData(); } catch { return NextResponse.json({ error: 'Invalid upload' }, { status: 400 }); }
  const file = form.get('file');
  if (!(file instanceof File) || !formats[file.type] || file.size === 0 || file.size > 5242880) return NextResponse.json({ error: 'Choose a JPEG, PNG, WebP, GIF, or AVIF image under 5 MB.' }, { status: 400 });
  const db = await createClient();
  const path = `${crypto.randomUUID()}.${formats[file.type]}`;
  const { error } = await db.storage.from('post-images').upload(path, file, { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: 'Image upload failed.' }, { status: 503 });
  return NextResponse.json({ url: db.storage.from('post-images').getPublicUrl(path).data.publicUrl });
}
