'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CategoryColumnCourseCard } from '@/components/landing-pages/category-column-course-card';
import type { CatalogCourseCard } from '@/types/catalog';
import type { Category } from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryCourseColumnProps {
  category: Category;
  courses: CatalogCourseCard[];
  className?: string;
}

export function CategoryCourseColumn({
  category,
  courses,
  className,
}: CategoryCourseColumnProps) {
  return (
    <div className={cn('bg-[#eef4fb] p-5', className)}>
      <Link
        href={`/courses?category=${category.slug}`}
        className="group mb-4 inline-flex items-center gap-1.5"
      >
        <h3 className="text-[1.0625rem] font-bold leading-tight text-foreground group-hover:text-primary">
          {category.name}
        </h3>
        <ArrowRight className="h-4 w-4 text-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
      </Link>

      <div className="space-y-3">
        {courses.length > 0 ? (
          courses.map((course) => (
            <CategoryColumnCourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="bg-background px-3 py-6 text-center text-sm text-muted-foreground">
            No courses in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryCourseColumnSkeleton() {
  return (
    <div className="bg-[#eef4fb] p-5">
      <div className="mb-4 h-6 w-40 animate-pulse bg-background/70" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex bg-background">
            <div className="h-[104px] w-[104px] shrink-0 animate-pulse bg-muted" />
            <div className="flex-1 space-y-2 px-3 py-2.5">
              <div className="h-3 w-24 animate-pulse bg-muted" />
              <div className="h-4 w-full animate-pulse bg-muted" />
              <div className="h-3 w-32 animate-pulse bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CategoryCourseColumnSkeleton };
