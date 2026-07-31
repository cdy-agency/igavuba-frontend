'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { CatalogCourseCard } from '@/types/catalog';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
  getPrimaryCategoryName,
} from '@/lib/catalog-utils';

interface CourseDetailRelatedSectionProps {
  courses: CatalogCourseCard[];
}

export function CourseDetailRelatedSection({ courses }: CourseDetailRelatedSectionProps) {
  if (courses.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted/10 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
          Students also viewed
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <RelatedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCourseCard({ course }: { course: CatalogCourseCard }) {
  const priceLabel = formatCatalogPrice(course);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group border border-border bg-background transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/9] bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted" />
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary">
          {course.title}
        </p>
        <p className="text-xs text-muted-foreground">{course.institution.name}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatCatalogLevel(course.level)}</span>
          <span>{formatCatalogDuration(course.estimatedHours)}</span>
        </div>
        <p className="text-sm font-bold text-foreground">{priceLabel}</p>
        <p className="text-xs text-muted-foreground">{getPrimaryCategoryName(course)}</p>
      </div>
    </Link>
  );
}
