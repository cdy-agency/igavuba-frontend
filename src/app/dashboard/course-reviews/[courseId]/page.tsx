'use client';

import { use } from 'react';
import { useSearchParams } from 'next/navigation';
import { CourseReviewDetailPage } from '@/components/dashboard/course-reviews/course-review-detail-page';

export default function CourseReviewDetailRoutePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const searchParams = useSearchParams();
  const reviewType = searchParams.get('type') === 'revision' ? 'revision' : 'initial';

  return <CourseReviewDetailPage courseId={courseId} reviewType={reviewType} />;
}
