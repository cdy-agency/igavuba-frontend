'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { OtpVerification } from '@/components/ui/otp-verification';
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
} from '@/hooks/use-auth-mutations';
import { decodeBase64Url, getApiErrorMessage } from '@/lib/auth';
import { GUEST_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';
import type { VerifyResetPasswordFormData } from '@/types';
import { verifyResetPasswordSchema } from '@/types';

function getQueryValue(searchParams: URLSearchParams, key: string): string {
  const raw = searchParams.get(key);
  if (!raw) {
    return '';
  }

  const decoded = decodeBase64Url(raw);
  return decoded ?? raw;
}

export function VerifyResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyMutation = useVerifyResetOtpMutation();
  const resendMutation = useForgotPasswordMutation();

  const emailFromQuery =
    getQueryValue(searchParams, 'email') || searchParams.get('email') || '';
  const otpFromQuery = getQueryValue(searchParams, 'otp');

  const form = useForm<VerifyResetPasswordFormData>({
    resolver: zodResolver(verifyResetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
      otp: otpFromQuery,
    },
  });

  useEffect(() => {
    if (emailFromQuery) {
      form.setValue('email', emailFromQuery);
    }
    if (otpFromQuery) {
      form.setValue('otp', otpFromQuery);
    }
  }, [emailFromQuery, otpFromQuery, form]);

  const email = form.watch('email');

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await verifyMutation.mutateAsync(values);
      toast.success(response.message, 'Choose your new password');
      router.push(`${GUEST_ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(response.resetToken)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Verification failed'));
    }
  });

  const handleResend = async () => {
    const currentEmail = form.getValues('email');
    if (!currentEmail) {
      form.setError('email', {
        type: 'manual',
        message: 'Email is required',
      });
      return;
    }

    try {
      const response = await resendMutation.mutateAsync({ email: currentEmail });
      toast.success(response.message, 'Check your inbox for the new reset code');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resend reset code'));
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-foreground mb-2">Verify reset code</h1>
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
              submitLabel="Verify Code"
              onSubmit={() => void onSubmit()}
              onResend={() => void handleResend()}
            />
          )}
        />
      </form>
    </div>
  );
}
