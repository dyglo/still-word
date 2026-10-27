import Link from "next/link";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";
import PostsTable from "@/components/PostsTable";
import { drafts, stats, topPosts, visitorsPerDay } from "@/lib/analytics";

export default function Dashboard() {
  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Last 14 days · mock data</p>
        </div>
        <Link href="/admin/editor" className="btn">New post</Link>
      </div>

      <section className="cards">{stats.map((s) => <StatCard key={s.label} {...s} />)}</section>

      <section className="row2">
        <div className="card grow2">
          <h2>New visitors per day</h2>
          <BarChart values={visitorsPerDay} />
        </div>
        <div className="card grow1">
          <h2>Drafts</h2>
          {drafts.map((d) => (
            <Link key={d.title + d.edited} href="/admin/editor" className="draft"><b>{d.title}</b><span>{d.edited}</span></Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2>Most read posts</h2>
        <PostsTable rows={topPosts} />
      </section>
    </>
  );
}
