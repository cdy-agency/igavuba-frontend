'use client';

import { useState } from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useValidateCoupon } from '@/hooks/use-coupons';
import type { CouponPriceBreakdown, CouponValidationResult } from '@/types/coupon';
import { cn } from '@/lib/utils';

interface CouponCodeFieldProps {
  courseId: string;
  className?: string;
  onApplied?: (result: CouponValidationResult) => void;
  onCleared?: () => void;
}

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

export function CouponCodeField({
  courseId,
  className,
  onApplied,
  onCleared,
}: CouponCodeFieldProps) {
  const validateCoupon = useValidateCoupon();
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState<CouponValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pricing: CouponPriceBreakdown | undefined =
    applied?.valid ? applied.pricing : undefined;

  const handleApply = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setError(null);
    try {
      const response = await validateCoupon.mutateAsync({ code: trimmed, courseId });
      const result = response.data;
      if (!result.valid) {
        setApplied(null);
        setError(result.message || 'Coupon could not be applied.');
        onCleared?.();
        return;
      }
      setApplied(result);
      onApplied?.(result);
    } catch (err) {
      setApplied(null);
      setError('Coupon could not be applied.');
      onCleared?.();
    }
  };

  const handleClear = () => {
    setApplied(null);
    setError(null);
    setCode('');
    onCleared?.();
  };

  return (
    <div className={cn('space-y-3 rounded-xl border border-border/70 bg-muted/20 p-4', className)}>
      <p className="text-sm font-medium text-foreground">Have a coupon?</p>

      {!applied?.valid ? (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="h-10"
          />
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            disabled={!code.trim() || validateCoupon.isPending}
            onClick={handleApply}
          >
            {validateCoupon.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 rounded-lg bg-primary-subtle px-3 py-2">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Check className="h-4 w-4" />
                Coupon applied
              </p>
              <p className="text-sm text-foreground">{applied.coupon?.code}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {pricing ? (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Current price</dt>
                <dd>{formatMoney(pricing.currentCoursePrice, pricing.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-primary">
                <dt>Coupon discount</dt>
                <dd>-{formatMoney(pricing.couponDiscountAmount, pricing.currency)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border/60 pt-2 font-semibold">
                <dt>You pay</dt>
                <dd>{formatMoney(pricing.finalPrice, pricing.currency)}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
