'use client';

import { ArrowRight, RefreshCw } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface OtpVerificationProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  isSubmitting?: boolean;
  isResending?: boolean;
  onSubmit: () => void;
  onResend: () => void;
  submitLabel?: string;
}

const otpSlotClassName =
  'h-12 w-12 rounded-lg border border-panel-border bg-panel-input text-lg font-medium text-panel-foreground shadow-none first:rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary';

export function OtpVerification({
  value,
  onChange,
  disabled,
  error,
  isSubmitting,
  isResending,
  onSubmit,
  onResend,
  submitLabel = 'Verify Email',
}: OtpVerificationProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-panel-subtle text-sm font-medium">Verification Code</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={value}
            onChange={onChange}
            disabled={disabled}
            containerClassName="justify-center gap-2"
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className={otpSlotClassName} />
              <InputOTPSlot index={1} className={otpSlotClassName} />
              <InputOTPSlot index={2} className={otpSlotClassName} />
            </InputOTPGroup>
            <InputOTPSeparator className="text-panel-muted" />
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={3} className={otpSlotClassName} />
              <InputOTPSlot index={4} className={otpSlotClassName} />
              <InputOTPSlot index={5} className={otpSlotClassName} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </div>

      <Button
        type="button"
        onClick={onSubmit}
        disabled={disabled || value.length !== 6}
        className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group border-0"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            <span>Verifying...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span>{submitLabel}</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
      </Button>

      <div className="text-center text-sm">
        <span className="text-panel-muted">
          Didn&apos;t receive the code?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={isResending}
            className={cn(
              'inline-flex items-center gap-1 text-link hover:text-link-hover font-medium disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <RefreshCw className={cn('h-3 w-3', isResending && 'animate-spin')} />
            {isResending ? 'Resending...' : 'Resend OTP'}
          </button>
        </span>
      </div>
    </div>
  );
}
