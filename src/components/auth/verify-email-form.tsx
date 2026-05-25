'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ChevronLeft } from 'lucide-react';
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
        <Link
          href={GUEST_ROUTES.LOGIN}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-200 transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to login
        </Link>
        <h1 className="text-4xl font-semibold text-white">Secure your account</h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-blue-100/80">
          Confirm your email with the OTP we just sent. This keeps sign-up secure and activates your
          account.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <input type="hidden" {...form.register('email')} />

        <div className="space-y-2">
          <Controller
            control={form.control}
            name="otp"
            render={({ field }) => (
              <OtpVerification
                email={email}
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
        </div>
      </form>
    </div>
  );
}
