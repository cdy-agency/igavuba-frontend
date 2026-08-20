'use client';

import { useState } from 'react';
import {
  BookOpen,
  Clock,
  Globe,
  Infinity,
  Smartphone,
  Tag,
} from 'lucide-react';
import { CoursePreviewMedia } from '@/components/public/course-detail/course-detail-preview-media';
import { CourseDetailEnrollActions } from '@/components/public/course-detail/course-detail-enroll-actions';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { CouponCodeField } from '@/components/payments/coupon-code-field';
import type { CatalogCourseDetail } from '@/types/catalog';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
} from '@/lib/catalog-utils';
import { CoursePriceDisplay } from '@/components/shared/course-price-display';
import { CourseAccessType } from '@/types/course';
import { getAccessToken, getRefreshToken } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCourseEnrollmentStatus } from '@/hooks/use-enrollment';
import { UserRole } from '@/types/enum';
import type { CouponValidationResult } from '@/types/coupon';

interface CourseDetailSidebarProps {
  course: CatalogCourseDetail;
}

export function CourseDetailSidebar({ course }: CourseDetailSidebarProps) {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  const priceLabel = formatCatalogPrice(course);
  const durationLabel = formatCatalogDuration(course.estimatedHours);
  const isFree = priceLabel === 'Free';
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const hasStoredSession = Boolean(getAccessToken() || getRefreshToken());
  const shouldCheckEnrollment = !authLoading && isAuthenticated;
  const { data: enrollmentStatus } = useCourseEnrollmentStatus(
    course.slug,
    shouldCheckEnrollment,
  );
  const isEnrolled = enrollmentStatus?.isEnrolled ?? false;
  const showWishlist =
    !isEnrolled && !(authLoading && hasStoredSession);
  const showCouponField =
    !isFree &&
    !isEnrolled &&
    isAuthenticated &&
    user?.role === UserRole.LEARNER &&
    (course.accessType === CourseAccessType.PUBLIC_PAID ||
      course.accessType === CourseAccessType.HYBRID);

  return (
    <aside className="relative order-1 lg:order-2 lg:col-span-1">
      <div className="sticky top-24 border border-border bg-background shadow-[0_2px_4px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.08)] lg:-mt-40">
        <CoursePreviewMedia
          previewVideo={course.previewVideo}
          thumbnail={course.thumbnail}
          courseTitle={course.title}
        />

        <div className="space-y-4 p-5">
          <div>
            <CoursePriceDisplay course={course} size="lg" />
            {!isFree ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {course.isOnSale ? 'Current price · One-time payment' : 'One-time payment'}
              </p>
            ) : null}
          </div>

          {showCouponField ? (
            <CouponCodeField
              courseId={course.id}
              onApplied={setAppliedCoupon}
              onCleared={() => setAppliedCoupon(null)}
            />
          ) : null}

          <CourseDetailEnrollActions
            courseId={course.id}
            courseSlug={course.slug}
            couponCode={appliedCoupon?.valid ? appliedCoupon.coupon?.code : null}
            isFreeWithCoupon={Boolean(
              appliedCoupon?.valid && appliedCoupon.pricing?.finalPrice === 0,
            )}
          />

          {showWishlist ? (
            <div className="flex items-center justify-center">
              <WishlistButton courseId={course.id} size="sm" showLabel className="gap-1 px-3" />
            </div>
          ) : null}

          <p className="text-center text-xs text-muted-foreground">
            30-Day satisfaction guarantee on paid courses
          </p>

          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-bold text-foreground">This course includes:</p>
            <ul className="space-y-2.5 text-sm text-foreground">
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {durationLabel !== '—' ? `${durationLabel} on-demand content` : 'Flexible pacing'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {course.curriculum.length} module
                  {course.curriculum.length === 1 ? '' : 's'}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Globe className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{formatCatalogLevel(course.level)} level</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Access on mobile and desktop</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Infinity className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {course.accessType === CourseAccessType.PUBLIC_FREE
                    ? 'Full lifetime access'
                    : 'Institution-managed access'}
                </span>
              </li>
              {course.skills.length > 0 ? (
                <li className="flex items-start gap-2.5">
                  <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{course.skills.length} skills covered</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
