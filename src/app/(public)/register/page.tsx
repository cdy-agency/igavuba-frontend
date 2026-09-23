import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthShell heroLine1="Welcome E-Learning" heroLine2="Start Your Journey">
      <RegisterForm />
    </AuthShell>
  );
}
