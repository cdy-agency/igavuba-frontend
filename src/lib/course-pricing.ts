import { CourseAccessType } from '@/types/course';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export type CoursePricingLike = {
  accessType?: CourseAccessType | string | null;
  publicPrice?: number | null;
  originalPrice?: number | null;
  discountEnabled?: boolean | null;
  discountType?: DiscountType | string | null;
  discountValue?: number | null;
  discountStartAt?: string | Date | null;
  discountEndAt?: string | Date | null;
  isOnSale?: boolean | null;
  amountSaved?: number | null;
  discountPercentOff?: number | null;
  discountLabel?: string | null;
};

export function isDiscountScheduleActive(
  startAt?: string | Date | null,
  endAt?: string | Date | null,
  now: Date = new Date(),
): boolean {
  if (startAt) {
    const start = new Date(startAt);
    if (!Number.isNaN(start.getTime()) && now < start) return false;
  }
  if (endAt) {
    const end = new Date(endAt);
    if (!Number.isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

export function calculateSellingPrice(input: {
  originalPrice: number;
  discountEnabled: boolean;
  discountType?: DiscountType | string | null;
  discountValue?: number | null;
  discountStartAt?: string | Date | null;
  discountEndAt?: string | Date | null;
}): number {
  const { originalPrice, discountEnabled, discountType, discountValue } = input;

  if (!discountEnabled || discountValue == null || !discountType) {
    return originalPrice;
  }

  if (!isDiscountScheduleActive(input.discountStartAt, input.discountEndAt)) {
    return originalPrice;
  }

  let selling: number;
  if (discountType === DiscountType.PERCENTAGE) {
    selling = originalPrice * (1 - Math.min(100, Math.max(0, discountValue)) / 100);
  } else {
    selling = originalPrice - Math.min(originalPrice, Math.max(0, discountValue));
  }

  return Math.max(0, Math.round(selling * 100) / 100);
}

export function getCourseSaleState(course: CoursePricingLike) {
  if (course.isOnSale != null) {
    const amountSaved =
      course.amountSaved ??
      (course.originalPrice != null && course.publicPrice != null
        ? Math.round((course.originalPrice - course.publicPrice) * 100) / 100
        : null);

    return {
      isOnSale: Boolean(course.isOnSale),
      originalPrice: course.originalPrice ?? null,
      sellingPrice: course.publicPrice ?? null,
      amountSaved,
      discountLabel: course.discountLabel ?? null,
      discountPercentOff: course.discountPercentOff ?? null,
    };
  }

  const scheduleActive = isDiscountScheduleActive(
    course.discountStartAt,
    course.discountEndAt,
  );
  const original = course.originalPrice ?? null;
  const selling = course.publicPrice ?? null;
  const isOnSale = Boolean(
    course.discountEnabled &&
      scheduleActive &&
      original != null &&
      selling != null &&
      original > selling,
  );

  let discountLabel: string | null = null;
  let discountPercentOff: number | null = null;

  if (isOnSale && course.discountType && course.discountValue != null) {
    if (course.discountType === DiscountType.PERCENTAGE) {
      discountPercentOff = course.discountValue;
      discountLabel = `${course.discountValue}% OFF`;
    } else {
      discountLabel = `${course.discountValue.toLocaleString()} OFF`;
      if (original && original > 0) {
        discountPercentOff =
          Math.round((course.discountValue / original) * 1000) / 10;
      }
    }
  }

  return {
    isOnSale,
    originalPrice: original,
    sellingPrice: selling,
    amountSaved:
      isOnSale && original != null && selling != null
        ? Math.round((original - selling) * 100) / 100
        : null,
    discountLabel,
    discountPercentOff,
  };
}

export function formatMoneyAmount(
  amount: number | null | undefined,
  currency = 'RWF',
): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `${amount.toLocaleString()} ${currency}`;
}
