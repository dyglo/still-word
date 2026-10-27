import Link from "next/link";
import { signOut } from '@/app/admin/actions';

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/editor", label: "Write" },
  { href: "/", label: "View site" },
];

export default function AdminSidebar({ authenticated = true }: { authenticated?: boolean }) {
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
        {authenticated && <form action={signOut}><button className="nav auth-signout" type="submit">Sign out</button></form>}
      </nav>
    </aside>
  );
}
