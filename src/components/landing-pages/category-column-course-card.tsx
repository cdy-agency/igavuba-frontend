'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { CatalogCourseCard } from '@/types/catalog';
import { formatCatalogLevel, formatCatalogDuration } from '@/lib/catalog-utils';
import { cn } from '@/lib/utils';

interface CategoryColumnCourseCardProps {
  course: CatalogCourseCard;
  className?: string;
}

export function CategoryColumnCourseCard({ course, className }: CategoryColumnCourseCardProps) {
  const levelLabel = formatCatalogLevel(course.level);
  const durationLabel = formatCatalogDuration(course.estimatedHours);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={cn(
        'group flex bg-background transition-colors hover:bg-background/90',
        className,
      )}
    >
      <div className="relative h-[104px] w-[104px] shrink-0 bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="104px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5" />
        )}
      </div>

      <div className="min-w-0 flex-1 px-3 py-2.5">
        <div className="mb-1 flex items-center gap-1.5">
          <div className="flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden bg-muted">
            {course.institution.logo ? (
              <Image
                src={course.institution.logo}
                alt={course.institution.name}
                width={16}
                height={16}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[0.5rem] font-bold uppercase text-primary">
                {course.institution.name.slice(0, 2)}
              </span>
            )}
          </div>
          <span className="truncate text-[0.6875rem] text-muted-foreground">
            {course.institution.name}
          </span>
        </div>

        <h4 className="line-clamp-2 text-[0.8125rem] font-bold leading-snug text-foreground group-hover:text-primary">
          {course.title}
        </h4>

        <p className="mt-1 flex items-center gap-1 text-[0.6875rem] text-muted-foreground">
          <span>Course</span>
          <span aria-hidden>•</span>
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{levelLabel}</span>
          {durationLabel !== '—' ? (
            <>
              <span aria-hidden>•</span>
              <span>{durationLabel}</span>
            </>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
