'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPasswordMutation } from '@/hooks/use-auth-mutations';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { GUEST_ROUTES } from '@/lib/routes';
import type { ResetPasswordFormData } from '@/types';
import { resetPasswordSchema } from '@/types';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetTokenFromQuery = searchParams.get('token') ?? '';

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetToken: resetTokenFromQuery,
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (resetTokenFromQuery) {
      form.setValue('resetToken', resetTokenFromQuery);
      return;
    }

    router.replace(GUEST_ROUTES.FORGOT_PASSWORD);
  }, [resetTokenFromQuery, form, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await resetPasswordMutation.mutateAsync({
        resetToken: values.resetToken,
        newPassword: values.newPassword,
      });
      toast.success(response.message, 'You can now sign in with your new password');
      router.push(GUEST_ROUTES.LOGIN);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Password reset failed'));
    }
  });

  if (!resetTokenFromQuery) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-foreground mb-2">Reset password</h1>
        <p className="text-panel-muted">
          Choose a new password for your account.{' '}
          <Link href={GUEST_ROUTES.LOGIN} className="text-link hover:text-link-hover ml-1 underline">
            Back to login
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <input type="hidden" {...form.register('resetToken')} />

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-panel-subtle text-sm font-medium">
            New Password
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your new password"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pr-12"
              {...form.register('newPassword')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-panel-muted hover:text-panel-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {form.formState.errors.newPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-panel-subtle text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your new password"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pr-12"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-panel-muted hover:text-panel-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group border-0"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Resetting password...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Reset Password</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
