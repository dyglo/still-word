import PostCard from "@/components/PostCard";
import { posts } from "@/lib/posts";

export default function Home() {
  return (
    <>
      <header className="hdr">
        <span>StillWord</span>
        <span>MAXIME BOURGAULT</span>
      </header>
      <main className="toc">
        <h1 className="toc-title">Table<br />of<br />Contents</h1>
        {posts.slice(0, 5).map((p) => <PostCard key={p.slug} post={p} />)}
      </main>
    </>
  );
}
