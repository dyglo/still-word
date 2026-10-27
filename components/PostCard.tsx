import Link from "next/link";
import type { Post } from "@/lib/posts";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`} className="item">
      <span className="n">{post.title}</span>
      <span className="d">
        {post.category}
        <br />
        {post.readMinutes} min read
        <b>{post.date}</b>
      </span>
      <span className="im" style={{ background: post.coverColor }} role="img" aria-label={`Cover for ${post.title}`} />
    </Link>
  );
}
