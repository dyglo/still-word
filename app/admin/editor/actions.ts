'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/supabase/database.types';
import { isPostImage, readMinutes, sanitizeContent, slugify } from '@/lib/content';

type SaveInput = { id?: string; title: string; lede: string; cover: string | null; html: string; json: Json; status: 'draft' | 'published' };

function validDocument(node: unknown, depth = 0): boolean {
  if (!node || typeof node !== 'object' || depth > 40) return false;
  const n = node as { type?: string; attrs?: { src?: string }; content?: unknown[] };
  if (!['doc','paragraph','heading','bulletList','orderedList','listItem','text','hardBreak','blockquote','image'].includes(n.type ?? '')) return false;
  if (n.type === 'image' && (!n.attrs?.src || !isPostImage(n.attrs.src))) return false;
  return !n.content || (Array.isArray(n.content) && n.content.every(c => validDocument(c, depth + 1)));
}

export async function savePost(input: SaveInput): Promise<{ id?: string; error?: string }> {
  await requireAdmin();
  if (!input || !['draft','published'].includes(input.status) || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 300 || typeof input.lede !== 'string' || input.lede.length > 1000 || typeof input.html !== 'string' || input.html.length > 500000 || JSON.stringify(input.json).length > 500000 || !isPostImage(input.cover) || !validDocument(input.json)) return { error: 'Check the headline, text, and uploaded images.' };
  const html = sanitizeContent(input.html);
  const imageSources = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map(m => m[1]);
  if (!imageSources.every(isPostImage)) return { error: 'Upload images before saving.' };
  const db = await createClient();
  let existing;
  if (input.id) {
    const { data, error } = await db.from('posts').select('*').eq('id', input.id).maybeSingle();
    if (error || !data) return { error: 'Post not found.' };
    existing = data;
  }
  const values = {
    title: input.title.trim(), lede: input.lede.trim(), cover_url: input.cover,
    content_html: html, content_json: input.json, status: input.status, read_minutes: readMinutes(html),
    published_at: input.status === 'published' ? existing?.published_at ?? new Date().toISOString() : existing?.published_at ?? null,
    category: existing?.category ?? 'Essays', author_name: existing?.author_name ?? 'Maxime Bourgault', author_role: existing?.author_role ?? 'Writer',
  };
  const baseSlug = slugify(input.title);
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = existing?.slug ?? (attempt ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}` : baseSlug);
    const result = existing
      ? await db.from('posts').update(values).eq('id', existing.id).select('id,slug').single()
      : await db.from('posts').insert({ ...values, slug }).select('id,slug').single();
    if (result.error?.code === '23505' && !existing) continue;
    if (result.error) return { error: 'Could not save the post. Please try again.' };
    revalidatePath('/'); revalidatePath('/admin/dashboard'); revalidatePath(`/posts/${result.data.slug}`);
    return { id: result.data.id };
  }
  return { error: 'Could not allocate a unique slug. Please try again.' };
}
