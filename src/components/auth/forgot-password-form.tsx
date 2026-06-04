'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPasswordMutation } from '@/hooks/use-auth-mutations';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { GUEST_ROUTES } from '@/lib/routes';
import type { ForgotPasswordFormData } from '@/types';
import { forgotPasswordSchema } from '@/types';

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync(values);
      toast.success(response.message, 'Check your inbox for the reset code');
      router.push(
        `${GUEST_ROUTES.VERIFY_RESET_PASSWORD}?email=${encodeURIComponent(values.email)}`,
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send reset code'));
    }
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-foreground mb-2">Forgot password</h1>
        <p className="text-panel-muted">
          Enter your email and we&apos;ll send you a reset code.{' '}
          <Link href={GUEST_ROUTES.LOGIN} className="text-link hover:text-link-hover ml-1 underline">
            Back to login
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-panel-subtle text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
              {...form.register('email')}
            />
            <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-panel-muted" />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group border-0"
          disabled={forgotPasswordMutation.isPending}
        >
          {forgotPasswordMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Sending code...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Send Reset Code</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}
