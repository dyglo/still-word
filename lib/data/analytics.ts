import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

type Activity = { visitors_per_day: { day: string; count: number }[]; top_posts: { id: string; title: string; views: number; reads: number }[] };

export async function dashboardData() {
  await requireAdmin();
  const db = await createClient();
  const results = await Promise.all([
    db.from('visitors').select('*', { count: 'exact', head: true }),
    db.from('post_events').select('*', { count: 'exact', head: true }).eq('type', 'view'),
    db.from('post_events').select('*', { count: 'exact', head: true }).eq('type', 'read'),
    db.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    db.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ]);
  for (const result of results) if (result.error) throw result.error;
  const [visitors, views, reads, published, draftCount] = results.map(r => r.count ?? 0);
  const [{ data: activity, error }, { data: drafts, error: draftError }] = await Promise.all([
    db.rpc('dashboard_activity'),
    db.from('posts').select('id,title,updated_at').eq('status', 'draft').order('updated_at', { ascending: false }).limit(5),
  ]);
  if (error || draftError) throw error ?? draftError;
  const summary = activity as unknown as Activity;
  return {
    stats: [
      { label: 'Visitors joined', value: visitors.toLocaleString(), note: 'All time' },
      { label: 'Total views', value: views.toLocaleString(), note: 'All time' },
      { label: 'Completed reads', value: reads.toLocaleString(), note: `${views ? Math.round(reads / views * 100) : 0}% of views` },
      { label: 'Published posts', value: published.toLocaleString(), note: `${draftCount} drafts` },
    ],
    visitorsPerDay: summary.visitors_per_day.map(d => d.count), topPosts: summary.top_posts,
    drafts: (drafts ?? []).map(d => ({ ...d, edited: `Edited ${new Date(d.updated_at).toLocaleDateString('en-GB', { timeZone: 'UTC' })}` })),
  };
}
