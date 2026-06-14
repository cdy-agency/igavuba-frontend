'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BookLock, Clock, BarChart2, ArrowLeft } from 'lucide-react';
import { getCourseEnrollmentStatus } from '@/api/enrollment.api';
import { getCatalogCourseBySlug } from '@/api/catalog.api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const CheckEnrollMent = ({ children }: { children: React.ReactNode }) => {
  const { slug } = useParams<{ slug: string }>();

  const { data: enrollmentStatus, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['enrollment-status', slug],
    queryFn: () => getCourseEnrollmentStatus(slug),
    enabled: !!slug,
  });

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['catalog-course', slug],
    queryFn: () => getCatalogCourseBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  if (enrollmentLoading || courseLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md rounded-2xl border bg-card shadow-sm p-6 flex flex-col gap-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-3 mt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-11 w-full mt-2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!enrollmentStatus?.isEnrolled) {
    const courseTitle = course?.title ?? slug;
    const registerHref = `/register?redirect=${encodeURIComponent(`/learn/${slug}`)}`;

    return (
      <div className="flex items-center justify-center min-h-screen bg-background px-4">
        <div className="w-full max-w-md rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="relative w-full h-48 bg-muted">
            {course?.thumbnail ? (
              <Image src={course.thumbnail} alt={courseTitle} fill className="object-cover" />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <BookLock className="w-12 h-12 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <BookLock className="w-4 h-4 shrink-0" />
              <span>You are not enrolled in this course</span>
            </div>

            {course?.institution?.name ? (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {course.institution.name}
              </p>
            ) : null}

            <h2 className="text-xl font-semibold leading-snug">{courseTitle}</h2>

            {course?.subtitle ? (
              <p className="text-sm text-muted-foreground line-clamp-2">{course.subtitle}</p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {course?.level ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <BarChart2 className="w-3 h-3" />
                  {course.level}
                </Badge>
              ) : null}
              {course?.estimatedHours ? (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {course.estimatedHours} hours
                </Badge>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <p className="text-sm text-muted-foreground">
                You need to be enrolled to access this content.
              </p>
              <Button asChild className="w-full" size="lg">
                <Link href={course ? `/courses/${course.slug}` : registerHref}>
                  Enroll in this course
                </Link>
              </Button>
            </div>

            {course ? (
              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
                View course details
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CheckEnrollMent;
