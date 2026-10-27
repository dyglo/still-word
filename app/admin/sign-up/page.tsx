import { redirect } from 'next/navigation';
import { getAdmin, canSignup } from '@/lib/auth';
import AuthForm from '@/components/AuthForm';

export default async function SignupPage() {
  if (await getAdmin()) redirect('/admin/dashboard');
  if (!(await canSignup())) return <p className="muted">Sign-ups are closed</p>;
  return <AuthForm mode="sign-up" />;
}
