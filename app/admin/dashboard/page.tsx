import Link from "next/link";
import StatCard from "@/components/StatCard";
import BarChart from "@/components/BarChart";
import PostsTable from "@/components/PostsTable";
import { dashboardData } from "@/lib/data/analytics";

export default async function Dashboard() {
  const { drafts, stats, topPosts, visitorsPerDay } = await dashboardData();
  return (
    <>
      <div className="adm-top">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">Last 14 days</p>
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
            <Link key={d.id} href={`/admin/editor/${d.id}`} className="draft"><b>{d.title}</b><span>{d.edited}</span></Link>
          ))}
          {!drafts.length && <p className="muted">No drafts yet.</p>}
        </div>
      </section>

      <section className="card">
        <h2>Most read posts</h2>
        {topPosts.length ? <PostsTable rows={topPosts} /> : <p className="muted">No data yet.</p>}
      </section>
    </>
  );
}
