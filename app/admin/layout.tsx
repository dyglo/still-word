import AdminSidebar from "@/components/AdminSidebar";

// TODO(auth): guard this layout (middleware or server session check).
// Public admin routes later: /admin/login and /admin/sign-up; everything else requires a session.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <AdminSidebar />
      <main className="adm-main">{children}</main>
    </div>
  );
}
