'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpVerification } from '@/components/ui/otp-verification';
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/hooks/use-auth-mutations';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { GUEST_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';
import type { VerifyEmailFormData } from '@/types';
import { verifyEmailSchema } from '@/types';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { pendingVerification, setPendingVerification } = useAuth();
  const verifyMutation = useVerifyEmailMutation();
  const resendMutation = useResendVerificationMutation();

  const emailFromQuery = searchParams.get('email') ?? pendingVerification?.email ?? '';

  const form = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: '',
    },
  });

  useEffect(() => {
    if (emailFromQuery) {
      form.setValue('email', emailFromQuery);
    }
  }, [emailFromQuery, form]);

  const email = form.watch('email');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await verifyMutation.mutateAsync(values);
      setPendingVerification(null);
      toast.success(response.message, 'You can now sign in');
      router.push(GUEST_ROUTES.LOGIN);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Verification failed'));
    }
  });

  const handleResend = async () => {
    const email = form.getValues('email');
    if (!email) {
      form.setError('email', {
        type: 'manual',
        message: 'Email is required',
      });
      return;
    }

    try {
      const response = await resendMutation.mutateAsync({ email });
      setPendingVerification({ email });
      toast.success(response.message, 'Check your inbox for the new OTP');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resend verification code'));
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-foreground mb-2">Verify your email</h1>
        <p className="text-panel-muted">
          Enter the 6-digit code sent to your email.{' '}
          <Link href={GUEST_ROUTES.LOGIN} className="text-link hover:text-link-hover ml-1 underline">
            Back to login
          </Link>
        </p>
        {email ? (
          <p className="mt-2 text-sm text-panel-muted">
            Code sent to <span className="text-panel-subtle">{email}</span>
          </p>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <input type="hidden" {...form.register('email')} />

        <Controller
          control={form.control}
          name="otp"
          render={({ field }) => (
            <OtpVerification
              value={field.value}
              onChange={field.onChange}
              disabled={verifyMutation.isPending}
              error={form.formState.errors.otp?.message}
              isSubmitting={verifyMutation.isPending}
              isResending={resendMutation.isPending}
              onSubmit={() => void onSubmit()}
              onResend={() => void handleResend()}
            />
          )}
        />
      </form>
    </div>
  );
}
