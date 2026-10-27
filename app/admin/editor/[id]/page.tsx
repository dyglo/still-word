import { notFound } from 'next/navigation';
import Editor from '@/components/Editor';
import { requireAdmin } from '@/lib/auth';
import { editablePost } from '@/lib/data/posts';

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await editablePost(id);
  if (!post) notFound();
  return <Editor post={post} />;
}
