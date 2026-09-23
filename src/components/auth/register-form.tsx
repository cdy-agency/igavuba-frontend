'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AuthFieldIcon,
  AuthFormHeader,
  authInputClassName,
} from '@/components/auth/auth-shell';
import { useSignupMutation } from '@/hooks/use-auth-mutations';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/lib/toast';
import { GUEST_ROUTES } from '@/lib/routes';
import type { SignupFormData } from '@/types';
import { signupSchema } from '@/types';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const { setPendingVerification } = useAuth();
  const signupMutation = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const { confirmPassword: _confirmPassword, ...payload } = values;

    try {
      const response = await signupMutation.mutateAsync(payload);
      setPendingVerification({ email: values.email, userId: response.userId });
      toast.success(response.message, 'Enter the OTP sent to your email');
      router.push(`${GUEST_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Signup failed'));
    }
  });

  return (
    <div className="w-full">
      <AuthFormHeader
        eyebrow="Get started"
        title="Create your account"
        description="Join the platform and start learning from trusted institutions."
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="auth-label">
            Full name
          </Label>
          <div className="relative">
            <AuthFieldIcon icon={User} />
            <Input
              id="name"
              autoComplete="name"
              placeholder="Enter your full name"
              className={authInputClassName}
              {...form.register('name')}
            />
          </div>
          {form.formState.errors.name ? (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          ) : null}
        </div>

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
          <Label htmlFor="phoneNumber" className="auth-label">
            Phone number
          </Label>
          <div className="relative">
            <AuthFieldIcon icon={Phone} />
            <Input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Enter your phone number"
              className={authInputClassName}
              {...form.register('phoneNumber')}
            />
          </div>
          {form.formState.errors.phoneNumber ? (
            <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="auth-label">
            Password
          </Label>
          <div className="relative">
            <AuthFieldIcon icon={Lock} />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="auth-label">
            Confirm password
          </Label>
          <div className="relative">
            <AuthFieldIcon icon={Lock} />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={cn(authInputClassName, 'pr-11')}
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-panel-muted transition-colors hover:text-white"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword ? (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button type="submit" className="auth-btn-primary group mt-2" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Create account</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-panel-muted">
        Already have an account?{' '}
        <Link href={GUEST_ROUTES.LOGIN} className="auth-link font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
