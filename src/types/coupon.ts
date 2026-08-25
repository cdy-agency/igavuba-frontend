import type { DiscountType } from '@/lib/course-pricing';

export type CouponStatus = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'NOT_STARTED';

export interface CouponCourseSummary {
  id: string;
  title: string;
  slug: string;
  institutionId: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  description: string | null;
  institutionId: string;
  institution?: { id: string; name: string };
  discountType: DiscountType;
  discountValue: number;
  isActive: boolean;
  status: CouponStatus;
  startsAt: string | null;
  expiresAt: string | null;
  maxTotalUses: number | null;
  maxUsesPerLearner: number | null;
  totalUsed: number;
  createdBy: { id: string; name: string | null; email: string };
  createdAt: string;
  updatedAt: string;
  courses: CouponCourseSummary[];
}

export interface CouponPriceBreakdown {
  originalPrice: number;
  courseDiscountAmount: number;
  currentCoursePrice: number;
  couponCode: string | null;
  couponDiscountAmount: number;
  finalPrice: number;
  currency: string;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  reason?: string;
  coupon?: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
  };
  pricing?: CouponPriceBreakdown;
}

export interface CreateCouponPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startsAt?: string;
  expiresAt?: string;
  maxTotalUses?: number;
  maxUsesPerLearner?: number;
  courseIds: string[];
  isActive?: boolean;
}

export interface UpdateCouponPayload {
  description?: string;
  startsAt?: string | null;
  expiresAt?: string | null;
  maxTotalUses?: number | null;
  maxUsesPerLearner?: number | null;
  courseIds?: string[];
  isActive?: boolean;
}

export interface ValidateCouponPayload {
  code: string;
  courseId: string;
}

export interface CouponUsageRecord {
  id: string;
  couponCode: string;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  usedAt: string;
  learner: { id: string; name: string | null; email: string };
  course: { id: string; title: string; slug: string };
  enrollment: { id: string; status: string } | null;
  payment: { id: string; status: string; amount: number } | null;
}

export interface CouponMutationResponse<T = CouponRecord> {
  success: boolean;
  message: string;
  data: T;
}

export interface CouponListResponse {
  success: boolean;
  data: CouponRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
