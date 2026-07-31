'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { CatalogCourseDetail } from '@/types/catalog';
import {
  formatCatalogLanguage,
  formatCatalogLevel,
  formatPublishedDate,
  getPrimaryCategoryName,
} from '@/lib/catalog-utils';

interface CourseDetailHeroProps {
  course: CatalogCourseDetail;
}

export function CourseDetailHero({ course }: CourseDetailHeroProps) {
  const primaryCategory = course.categories[0];
  const instructorName = course.instructor.name ?? 'Instructor';

  return (
    <section className="bg-[#0c1f42] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <nav className="flex flex-wrap items-center gap-1 text-sm text-white/70">
              <Link href="/courses" className="transition-colors hover:text-white">
                Courses
              </Link>
              {primaryCategory ? (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <Link
                    href={`/courses?category=${primaryCategory.slug}`}
                    className="transition-colors hover:text-white"
                  >
                    {primaryCategory.name}
                  </Link>
                </>
              ) : null}
            </nav>

            <div className="flex flex-wrap gap-2">
              <span className="border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                {getPrimaryCategoryName(course)}
              </span>
              <span className="border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">
                {formatCatalogLevel(course.level)}
              </span>
            </div>

            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2rem]">
              {course.title}
            </h1>

            {course.subtitle ? (
              <p className="max-w-3xl text-base text-white/80 sm:text-lg">{course.subtitle}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
              <span>
                Created by{' '}
                <span className="font-medium text-[#c0c4fc] underline-offset-2 hover:underline">
                  {instructorName}
                </span>
              </span>
              <span className="hidden h-1 w-1 bg-white/40 sm:inline-block" />
              <span>{course.institution.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
              <span>Last updated {formatPublishedDate(course.publishedAt)}</span>
              <span className="hidden h-1 w-1 bg-white/40 sm:inline-block" />
              <span>{formatCatalogLanguage(course.language)}</span>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}
