import AdminSidebar from "@/components/AdminSidebar";
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isPublic = (await headers()).get('x-stillword-admin-public') === '1';
  if (!isPublic) await requireAdmin();
  return (
    <div className="adm">
      <AdminSidebar authenticated={!isPublic} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
