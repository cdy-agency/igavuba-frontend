'use client';

import { ArrowRight, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OtpVerificationProps {
  email: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  isSubmitting?: boolean;
  isResending?: boolean;
  onSubmit: () => void;
  onResend: () => void;
}

export function OtpVerification({
  email,
  value,
  onChange,
  disabled,
  error,
  isSubmitting,
  isResending,
  onSubmit,
  onResend,
}: OtpVerificationProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-blue-200/20 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur xl:p-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-cyan-400" />
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
                Email Verification
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                Enter your OTP code
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                We sent a 6-digit one-time password to your email address to verify your account.
              </p>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:block">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Sent To
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
              <MailCheck className="h-4 w-4 text-blue-500" />
              <span className="max-w-[220px] truncate">{email}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 md:hidden">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-700">Sent To</p>
          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-800">
            <MailCheck className="h-4 w-4 text-blue-500" />
            <span className="truncate">{email}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={value}
              onChange={onChange}
              disabled={disabled}
              containerClassName="justify-center gap-3"
            >
              <InputOTPGroup className="gap-3">
                <InputOTPSlot
                  index={0}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl first:border focus-within:border-blue-500"
                />
                <InputOTPSlot
                  index={1}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl"
                />
                <InputOTPSlot
                  index={2}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl"
                />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-1 text-slate-300" />
              <InputOTPGroup className="gap-3">
                <InputOTPSlot
                  index={3}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl"
                />
                <InputOTPSlot
                  index={4}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl"
                />
                <InputOTPSlot
                  index={5}
                  className="h-14 w-14 rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-900 shadow-sm first:rounded-2xl"
                />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="min-h-[20px] text-center">
            {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}
          </div>

          <Button
            type="button"
            onClick={onSubmit}
            disabled={disabled || value.length !== 6}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-700 hover:to-cyan-600"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying code...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Verify email
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 sm:flex-row">
            <p>
              Didn&apos;t receive the code?{' '}
              <span className="font-medium text-slate-800">You can request a new OTP.</span>
            </p>
            <button
              type="button"
              onClick={onResend}
              disabled={isResending}
              className={cn(
                'inline-flex items-center gap-2 font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60',
              )}
            >
              <RefreshCw className={cn('h-4 w-4', isResending && 'animate-spin')} />
              {isResending ? 'Resending...' : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
