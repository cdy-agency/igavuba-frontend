'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  CategoryCourseColumn,
  CategoryCourseColumnSkeleton,
} from '@/components/landing-pages/category-course-column';
import { getCatalogCourses } from '@/api/catalog.api';
import { catalogQueryKeys } from '@/hooks/use-catalog';
import { useCategoriesList } from '@/hooks/use-categories';
import type { Category } from '@/types/category';

const MAX_COLUMNS = 3;
const COURSES_PER_CATEGORY = 3;

export default function LandingCategories() {
  const { data: categories = [] as Category[], isPending: categoriesLoading } =
    useCategoriesList();

  const featuredCategories = useMemo((): Category[] =>
    categories
      .filter((category: Category) => category.publishedCourseCount > 0)
      .slice(0, MAX_COLUMNS),
  [categories]);

  const courseQueries = useQueries({
    queries: featuredCategories.map((category) => ({
      queryKey: catalogQueryKeys.list({
        category: category.slug,
        limit: COURSES_PER_CATEGORY,
        page: 1,
      }),
      queryFn: async () => {
        const response = await getCatalogCourses({
          category: category.slug,
          limit: COURSES_PER_CATEGORY,
          page: 1,
        });
        return response.data;
      },
      enabled: Boolean(category.slug),
    })),
  });

  const columns = featuredCategories.map((category, index) => ({
    category,
    courses: courseQueries[index]?.data ?? [],
    isLoading: courseQueries[index]?.isPending ?? true,
  }));

  const isLoading =
    categoriesLoading || (featuredCategories.length > 0 && courseQueries.some((query) => query.isPending));

  return (
    <section className="bg-surface py-16 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center lg:mb-12">
          <h2 className="text-2xl font-bold leading-tight text-foreground lg:text-[2rem]">
            Discover Our Courses By Categories.
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: MAX_COLUMNS }).map((_, index) => (
              <CategoryCourseColumnSkeleton key={index} />
            ))}
          </div>
        ) : featuredCategories.length === 0 ? (
          <div className="bg-[#eef4fb] px-6 py-14 text-center text-muted-foreground">
            No categories with published courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {columns.map(({ category, courses }) => (
              <CategoryCourseColumn
                key={category.id}
                category={category}
                courses={courses}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
