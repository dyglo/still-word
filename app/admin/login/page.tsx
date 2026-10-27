import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';

export default async function LoginPage() {
  if (await getAdmin()) redirect('/admin/dashboard');
  return <AuthForm mode="login" />;
}
