'use client';

import { Controller, type Control, type UseFormSetValue, useWatch } from 'react-hook-form';
import { DollarSign, Percent, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  CourseFormField,
  courseFormInputClass,
} from '@/components/dashboard/courses/course-form-field';
import {
  DiscountType,
  calculateSellingPrice,
  formatMoneyAmount,
} from '@/lib/course-pricing';
import type { CourseFormValues } from '@/schema/course.schema';
import { cn } from '@/lib/utils';

interface CoursePricingFieldsProps {
  control: Control<CourseFormValues>;
  setValue: UseFormSetValue<CourseFormValues>;
  disabled?: boolean;
  currency?: string;
  errors?: {
    originalPrice?: { message?: string };
    discountType?: { message?: string };
    discountValue?: { message?: string };
    discountStartAt?: { message?: string };
    discountEndAt?: { message?: string };
  };
}

export function CoursePricingFields({
  control,
  setValue,
  disabled = false,
  currency = 'RWF',
  errors,
}: CoursePricingFieldsProps) {
  const originalPrice = useWatch({ control, name: 'originalPrice' });
  const discountEnabled = useWatch({ control, name: 'discountEnabled' }) ?? false;
  const discountType = useWatch({ control, name: 'discountType' });
  const discountValue = useWatch({ control, name: 'discountValue' });
  const discountStartAt = useWatch({ control, name: 'discountStartAt' });
  const discountEndAt = useWatch({ control, name: 'discountEndAt' });

  const regular = typeof originalPrice === 'number' ? originalPrice : Number(originalPrice);
  const hasRegular = Number.isFinite(regular) && regular >= 0;

  const sellingPrice = hasRegular
    ? calculateSellingPrice({
        originalPrice: regular,
        discountEnabled: Boolean(discountEnabled),
        discountType,
        discountValue: typeof discountValue === 'number' ? discountValue : Number(discountValue),
        discountStartAt,
        discountEndAt,
      })
    : null;

  const amountSaved =
    hasRegular && sellingPrice != null && regular > sellingPrice
      ? Math.round((regular - sellingPrice) * 100) / 100
      : null;

  const syncPublicPrice = (next: {
    originalPrice?: number;
    discountEnabled?: boolean;
    discountType?: DiscountType | undefined;
    discountValue?: number | undefined;
    discountStartAt?: string | undefined;
    discountEndAt?: string | undefined;
  }) => {
    const nextOriginal =
      next.originalPrice ?? (hasRegular ? regular : undefined);
    if (nextOriginal == null || !Number.isFinite(nextOriginal)) {
      setValue('publicPrice', undefined, { shouldDirty: true });
      return;
    }

    const price = calculateSellingPrice({
      originalPrice: nextOriginal,
      discountEnabled: next.discountEnabled ?? Boolean(discountEnabled),
      discountType: next.discountType ?? discountType,
      discountValue: next.discountValue ?? (typeof discountValue === 'number' ? discountValue : undefined),
      discountStartAt: next.discountStartAt ?? discountStartAt,
      discountEndAt: next.discountEndAt ?? discountEndAt,
    });
    setValue('publicPrice', price, { shouldDirty: true });
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 bg-white p-3">
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-muted-foreground" />
        <p className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">
          Course Pricing
        </p>
      </div>

      <CourseFormField
        icon={DollarSign}
        label="Regular Price"
        hint="The normal price before any discount."
        error={errors?.originalPrice?.message}
      >
        <Controller
          control={control}
          name="originalPrice"
          render={({ field }) => (
            <Input
              id="course-original-price"
              type="number"
              min={0}
              step="1"
              placeholder="10000"
              disabled={disabled}
              className={courseFormInputClass}
              value={field.value ?? ''}
              onChange={(event) => {
                const raw = event.target.value;
                const value = raw === '' ? undefined : Number(raw);
                field.onChange(value);
                syncPublicPrice({ originalPrice: value });
              }}
            />
          )}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">{currency}</p>
      </CourseFormField>

      <div className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2.5">
        <div className="min-w-0">
          <Label className="text-[13px] font-medium">Enable Discount</Label>
          <p className="text-[11px] text-muted-foreground">
            Offer a temporary or permanent price reduction.
          </p>
        </div>
        <Controller
          control={control}
          name="discountEnabled"
          render={({ field }) => (
            <Switch
              size="xs"
              checked={Boolean(field.value)}
              disabled={disabled}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                if (!checked) {
                  setValue('discountType', undefined, { shouldDirty: true });
                  setValue('discountValue', undefined, { shouldDirty: true });
                  setValue('discountStartAt', undefined, { shouldDirty: true });
                  setValue('discountEndAt', undefined, { shouldDirty: true });
                  syncPublicPrice({
                    discountEnabled: false,
                    discountType: undefined,
                    discountValue: undefined,
                  });
                } else {
                  setValue('discountType', DiscountType.PERCENTAGE, { shouldDirty: true });
                  syncPublicPrice({
                    discountEnabled: true,
                    discountType: DiscountType.PERCENTAGE,
                  });
                }
              }}
            />
          )}
        />
      </div>

      {discountEnabled ? (
        <div className="space-y-3 border-t border-border/50 pt-3">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium">Discount Type</Label>
            <Controller
              control={control}
              name="discountType"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      [DiscountType.PERCENTAGE, 'Percentage', Percent],
                      [DiscountType.FIXED_AMOUNT, 'Fixed Amount', DollarSign],
                    ] as const
                  ).map(([value, label, Icon]) => {
                    const active = field.value === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          field.onChange(value);
                          syncPublicPrice({ discountType: value });
                        }}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-3 py-2 text-left text-[12px] font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary/5 text-foreground'
                            : 'border-border/70 text-muted-foreground hover:bg-muted/40',
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors?.discountType?.message ? (
              <p className="text-xs text-destructive">{errors.discountType.message}</p>
            ) : null}
          </div>

          <CourseFormField
            icon={Percent}
            label="Discount Value"
            hint={
              discountType === DiscountType.FIXED_AMOUNT
                ? `Amount off in ${currency}`
                : 'Percent off (0–100)'
            }
            error={errors?.discountValue?.message}
          >
            <Controller
              control={control}
              name="discountValue"
              render={({ field }) => (
                <Input
                  id="course-discount-value"
                  type="number"
                  min={0}
                  max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                  step="1"
                  placeholder={discountType === DiscountType.FIXED_AMOUNT ? '2000' : '20'}
                  disabled={disabled}
                  className={courseFormInputClass}
                  value={field.value ?? ''}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const value = raw === '' ? undefined : Number(raw);
                    field.onChange(value);
                    syncPublicPrice({ discountValue: value });
                  }}
                />
              )}
            />
          </CourseFormField>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-[12px] text-muted-foreground">Starts (optional)</Label>
              <Controller
                control={control}
                name="discountStartAt"
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    disabled={disabled}
                    className={courseFormInputClass}
                    value={toDatetimeLocalValue(field.value)}
                    onChange={(event) => {
                      const value = fromDatetimeLocalValue(event.target.value);
                      field.onChange(value);
                      syncPublicPrice({ discountStartAt: value });
                    }}
                  />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[12px] text-muted-foreground">Ends (optional)</Label>
              <Controller
                control={control}
                name="discountEndAt"
                render={({ field }) => (
                  <Input
                    type="datetime-local"
                    disabled={disabled}
                    className={courseFormInputClass}
                    value={toDatetimeLocalValue(field.value)}
                    onChange={(event) => {
                      const value = fromDatetimeLocalValue(event.target.value);
                      field.onChange(value);
                      syncPublicPrice({ discountEndAt: value });
                    }}
                  />
                )}
              />
            </div>
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50/70 px-3 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-800/80">
              Preview
            </p>
            <div className="mt-1.5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[11px] text-muted-foreground">Current Selling Price</p>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {formatMoneyAmount(sellingPrice, currency)}
                </p>
                <p className="text-[11px] text-muted-foreground">Automatically calculated.</p>
              </div>
              {amountSaved != null && amountSaved > 0 ? (
                <div className="text-right">
                  <p className="text-[11px] text-muted-foreground">You Save</p>
                  <p className="text-sm font-semibold tabular-nums text-emerald-700">
                    {formatMoneyAmount(amountSaved, currency)}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toDatetimeLocalValue(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}
