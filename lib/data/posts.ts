import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/database.types';

export type PostRow = Database['public']['Tables']['posts']['Row'];
export function displayPost(post: PostRow) {
  const date = new Date(post.published_at ?? post.created_at);
  return {
    ...post, date: `${String(date.getUTCDate()).padStart(2, '0')}.${date.getUTCMonth() + 1}`,
    readMinutes: post.read_minutes,
    author: { name: post.author_name, role: post.author_role, initials: post.author_name.split(/\s+/).map(n => n[0]).slice(0, 2).join('') },
  };
}
export type Post = ReturnType<typeof displayPost>;

export async function publishedPosts() {
  const db = await createClient();
  const { data, error } = await db.from('posts').select('*').eq('status', 'published').order('published_at', { ascending: false }).limit(5);
  if (error) throw error;
  return data.map(displayPost);
}

export async function publishedPost(slug: string) {
  const db = await createClient();
  const { data, error } = await db.from('posts').select('*').eq('slug', slug).eq('status', 'published').maybeSingle();
  if (error) throw error;
  return data ? displayPost(data) : null;
}

export async function editablePost(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  const db = await createClient();
  const { data, error } = await db.from('posts').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}
