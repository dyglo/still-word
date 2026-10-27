import Editor from "@/components/Editor";
import { requireAdmin } from '@/lib/auth';

export default async function EditorPage() {
  await requireAdmin();
  return <Editor />;
}
