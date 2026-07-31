'use client';

import Image from 'next/image';
import type { CatalogCourseDetail } from '@/types/catalog';

interface CourseDetailInstructorSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailInstructorSection({ course }: CourseDetailInstructorSectionProps) {
  const instructorName = course.instructor.name ?? 'Instructor';

  return (
    <section className="border-t border-border pt-10">
      <h2 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">Instructor</h2>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden bg-muted">
          {course.instructor.profileImage ? (
            <Image
              src={course.instructor.profileImage}
              alt={instructorName}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-muted-foreground">
              {instructorName.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>

        <div className="min-w-0 space-y-2">
          <h3 className="text-lg font-bold text-[#5624d0]">{instructorName}</h3>
          <p className="text-sm font-medium text-muted-foreground">
            Course instructor at {course.institution.name}
          </p>
          <p className="text-sm leading-relaxed text-foreground">
            Learn directly from {instructorName}, who designed and delivers this course through{' '}
            {course.institution.name}.
          </p>
        </div>
      </div>
    </section>
  );
}

interface CourseDetailInstitutionSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailInstitutionSection({ course }: CourseDetailInstitutionSectionProps) {
  return (
    <section className="border border-border bg-muted/20 p-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">Offered by</h2>
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-background">
          {course.institution.logo ? (
            <Image
              src={course.institution.logo}
              alt={course.institution.name}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold text-primary">
              {course.institution.name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <p className="font-bold text-foreground">{course.institution.name}</p>
          <p className="text-sm text-muted-foreground">
            Partner institution on the Igavuba learning platform
          </p>
        </div>
      </div>
    </section>
  );
}
