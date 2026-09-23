import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthShell heroLine1="One more step" heroLine2="Creating Memories">
      <LoginForm />
    </AuthShell>
  );
}
