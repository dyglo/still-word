import Link from "next/link";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/editor", label: "Write" },
  { href: "/", label: "View site" },
];

export default function AdminSidebar() {
  return (
    <aside className="adm-side">
      <div className="adm-brand">
        <span>StillWord</span>
        <em>Admin</em>
      </div>
      <nav>
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="nav">{l.label}</Link>
        ))}
      </nav>
    </aside>
  );
}
