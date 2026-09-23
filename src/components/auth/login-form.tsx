'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AuthFieldIcon,
  AuthFormHeader,
  authInputClassName,
} from '@/components/auth/auth-shell';
import { useLoginMutation } from '@/hooks/use-auth-mutations';
import { useAuth } from '@/lib/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { GUEST_ROUTES, PROTECTED_ROUTES } from '@/lib/routes';
import type { LoginFormData } from '@/types';
import { loginSchema } from '@/types';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, setPendingVerification } = useAuth();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const isSubmittingRef = useRef(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (isSubmittingRef.current || loginMutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const response = await loginMutation.mutateAsync(values);
      setSession(response);
      setPendingVerification(null);
      toast.success(response.message, 'You are now signed in');

      const redirect = searchParams.get('redirect');
      router.push(redirect || PROTECTED_ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign in. Please check your details and try again.'));
    } finally {
      isSubmittingRef.current = false;
    }
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        eyebrow="Welcome back"
        title="Sign in to your account"
        description="Continue learning with your enrolled courses and certificates."
      />

      {searchParams.get('reset') === 'success' ? (
        <div className="mb-6 flex gap-3 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm text-link">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Your password has been reset. Sign in with your new credentials.</p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="auth-label">
            Email address
          </Label>
          <div className="relative">
            <AuthFieldIcon icon={Mail} />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={authInputClassName}
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="auth-label">
              Password
            </Label>
            <Link href={GUEST_ROUTES.FORGOT_PASSWORD} className="auth-link text-sm">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <AuthFieldIcon icon={Lock} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(authInputClassName, 'pr-11')}
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-panel-muted transition-colors hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="auth-btn-primary group" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-panel-muted">
        Don&apos;t have an account?{' '}
        <Link href={GUEST_ROUTES.REGISTER} className="auth-link font-semibold">
          Sign up for free
        </Link>
      </p>
    </div>
  );
}
