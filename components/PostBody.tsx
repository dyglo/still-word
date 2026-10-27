import { sanitizeContent } from '@/lib/content';

export default function PostBody({ html }: { html: string }) {
  return <article className="prose" dangerouslySetInnerHTML={{ __html: sanitizeContent(html) }} />;
}
