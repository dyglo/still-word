import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import PostBody from "@/components/PostBody";
import { getPost, posts } from "@/lib/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="rd">
        <h1 className="rd-title">{post.title}</h1>
        <p className="rd-lede">{post.lede}</p>
        <div className="rd-date">{post.date}</div>

        <div className="rd-side">
          <Link href="/" className="back">← All posts</Link>
          <div className="meta"><span>{post.readMinutes} min read</span></div>
          <div className="author">
            <span className="avatar" aria-hidden="true">{post.author.initials}</span>
            <div><b>{post.author.name}</b><br />{post.author.role}</div>
          </div>
        </div>

        <div>
          <PostBody blocks={post.blocks} />
          <Link href="/" className="back end">Back to all posts</Link>
        </div>
      </main>
    </>
  );
}
