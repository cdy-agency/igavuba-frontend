'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import LandingHeader from '@/components/landing-pages/header';
import { CourseFilters, type DifficultyLevel, type PricingOption } from '@/components/Course/courseFilter';
import { CourseListItem } from '@/components/Course/courseItem';
import { CourseSearchSort, type SortOption } from '@/components/Course/courseSearch';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { useCatalogCourses, useCatalogInstitutions } from '@/hooks/use-catalog';
import { useCategoriesList } from '@/hooks/use-categories';
import { CourseAccessType, CourseLevel } from '@/types/course';
import type { CatalogCourseCard, CatalogFilterParams } from '@/types/catalog';
import type { Category } from '@/types/category';

const ITEMS_PER_PAGE = 12;

const DIFFICULTY_TO_LEVEL: Record<DifficultyLevel, CourseLevel> = {
  beginner: CourseLevel.BEGINNER,
  intermediate: CourseLevel.INTERMEDIATE,
  advanced: CourseLevel.ADVANCED,
};

function mapSortToApiSort(sort: SortOption): CatalogFilterParams['sort'] {
  return sort === 'oldest' ? 'oldest' : 'latest';
}

function sortCourses(courses: CatalogCourseCard[], sortBy: SortOption): CatalogCourseCard[] {
  if (sortBy === 'price_low') {
    return [...courses].sort(
      (a, b) => (a.publicPrice ?? 0) - (b.publicPrice ?? 0),
    );
  }

  if (sortBy === 'price_high') {
    return [...courses].sort(
      (a, b) => (b.publicPrice ?? 0) - (a.publicPrice ?? 0),
    );
  }

  return courses;
}

function filterCoursesByPricing(
  courses: CatalogCourseCard[],
  pricing?: PricingOption,
): CatalogCourseCard[] {
  if (!pricing) return courses;

  if (pricing === 'free') {
    return courses.filter(
      (course) =>
        course.accessType === CourseAccessType.PUBLIC_FREE ||
        !course.publicPrice ||
        course.publicPrice <= 0,
    );
  }

  return courses.filter(
    (course) =>
      course.accessType === CourseAccessType.PUBLIC_PAID ||
      course.accessType === CourseAccessType.HYBRID ||
      (course.publicPrice ?? 0) > 0,
  );
}

export default function CoursesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('trending');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([]);
  const [selectedPricing, setSelectedPricing] = useState<PricingOption | undefined>();
  const [selectedInstitutionIds, setSelectedInstitutionIds] = useState<string[]>([]);

  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isInstitutionsOpen, setIsInstitutionsOpen] = useState(false);

  const { data: categories = [] as Category[], isPending: categoriesLoading } =
    useCategoriesList();
  const { data: institutions = [], isPending: institutionsLoading } =
    useCatalogInstitutions();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const difficultyParam = searchParams.get('difficulty');
    const pricingParam = searchParams.get('pricing');
    const searchParam = searchParams.get('q');
    const pageParam = Number(searchParams.get('page') ?? '1');

    if (categoryParam) {
      const matchedCategory = categories.find(
        (category: Category) =>
          category.slug === categoryParam || category.id === categoryParam,
      );
      if (matchedCategory) {
        setSelectedCategoryIds([matchedCategory.id]);
      }
    }

    if (
      difficultyParam &&
      ['beginner', 'intermediate', 'advanced'].includes(difficultyParam)
    ) {
      setSelectedDifficulties([difficultyParam as DifficultyLevel]);
    }

    if (pricingParam && ['free', 'paid'].includes(pricingParam)) {
      setSelectedPricing(pricingParam as PricingOption);
    }

    if (searchParam) {
      setSearchQuery(searchParam);
    }

    if (pageParam > 0) {
      setCurrentPage(pageParam);
    }
  }, [categories, searchParams]);

  const selectedCategory = useMemo(() => {
    if (selectedCategoryIds.length === 0) return undefined;
    const category = categories.find(
      (item: Category) => item.id === selectedCategoryIds[0],
    );
    return category?.slug ?? category?.id;
  }, [categories, selectedCategoryIds]);

  const catalogFilters = useMemo<CatalogFilterParams>(() => {
    const filters: CatalogFilterParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      sort: mapSortToApiSort(sortBy),
    };

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (selectedDifficulties.length > 0) {
      filters.level = DIFFICULTY_TO_LEVEL[selectedDifficulties[0]];
    }

    if (selectedPricing === 'free') {
      filters.accessType = 'FREE';
    }

    if (selectedInstitutionIds.length > 0) {
      filters.institutionId = selectedInstitutionIds[0];
    }

    return filters;
  }, [
    currentPage,
    searchQuery,
    selectedCategory,
    selectedDifficulties,
    selectedPricing,
    selectedInstitutionIds,
    sortBy,
  ]);

  const {
    data: catalogPage,
    isPending: coursesLoading,
    isError: coursesIsError,
    error: coursesError,
  } = useCatalogCourses(catalogFilters);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category: Category) => {
      map.set(category.id, category.name);
    });
    return map;
  }, [categories]);

  const courses = useMemo(() => {
    const apiCourses = catalogPage?.data ?? [];
    const pricingFiltered = filterCoursesByPricing(apiCourses, selectedPricing);
    return sortCourses(pricingFiltered, sortBy);
  }, [catalogPage?.data, selectedPricing, sortBy]);

  const pagination = catalogPage?.pagination;
  const totalResults = selectedPricing === 'paid' ? courses.length : pagination?.total ?? courses.length;

  const syncUrl = useCallback(
    (overrides?: {
      page?: number;
      q?: string;
      categoryIds?: string[];
      difficulties?: DifficultyLevel[];
      pricing?: PricingOption | undefined;
    }) => {
      const params = new URLSearchParams();
      const nextSearch = overrides?.q ?? searchQuery;
      const nextCategoryIds = overrides?.categoryIds ?? selectedCategoryIds;
      const nextDifficulties = overrides?.difficulties ?? selectedDifficulties;
      const nextPricing = overrides?.pricing ?? selectedPricing;
      const nextPage = overrides?.page ?? currentPage;

      if (nextSearch.trim()) params.set('q', nextSearch.trim());

      if (nextCategoryIds.length > 0) {
        const category = categories.find((item: Category) => item.id === nextCategoryIds[0]);
        if (category) params.set('category', category.slug);
      }

      if (nextDifficulties.length > 0) params.set('difficulty', nextDifficulties[0]);
      if (nextPricing) params.set('pricing', nextPricing);
      if (nextPage > 1) params.set('page', String(nextPage));

      const query = params.toString();
      router.replace(query ? `/courses?${query}` : '/courses');
    },
    [
      categories,
      currentPage,
      router,
      searchQuery,
      selectedCategoryIds,
      selectedDifficulties,
      selectedPricing,
    ],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      syncUrl({ page });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncUrl],
  );

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
      syncUrl({ q: query, page: 1 });
    },
    [syncUrl],
  );

  const handleSortChange = useCallback((sort: SortOption) => {
    setSortBy(sort);
    setCurrentPage(1);
  }, []);

  const handleToggleCategory = useCallback(
    (categoryId: string) => {
      setSelectedCategoryIds((prev) => {
        const next = prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId];
        setCurrentPage(1);
        syncUrl({ categoryIds: next, page: 1 });
        return next;
      });
    },
    [syncUrl],
  );

  const handleToggleDifficulty = useCallback(
    (difficulty: DifficultyLevel) => {
      setSelectedDifficulties((prev) => {
        const next = prev.includes(difficulty)
          ? prev.filter((item) => item !== difficulty)
          : [...prev, difficulty];
        setCurrentPage(1);
        syncUrl({ difficulties: next, page: 1 });
        return next;
      });
    },
    [syncUrl],
  );

  const handlePricingChange = useCallback(
    (pricing: PricingOption | undefined) => {
      setSelectedPricing(pricing);
      setCurrentPage(1);
      syncUrl({ pricing, page: 1 });
    },
    [syncUrl],
  );

  const handleToggleInstitution = useCallback((institutionId: string) => {
    setSelectedInstitutionIds((prev) => {
      const next = prev.includes(institutionId)
        ? prev.filter((id) => id !== institutionId)
        : [...prev, institutionId];
      setCurrentPage(1);
      return next;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategoryIds([]);
    setSelectedDifficulties([]);
    setSelectedPricing(undefined);
    setSelectedInstitutionIds([]);
    setSearchQuery('');
    setCurrentPage(1);
    router.replace('/courses');
  }, [router]);

  const hasActiveFilters = useMemo(
    () =>
      selectedCategoryIds.length > 0 ||
      selectedDifficulties.length > 0 ||
      selectedPricing !== undefined ||
      selectedInstitutionIds.length > 0 ||
      searchQuery !== '',
    [
      selectedCategoryIds,
      selectedDifficulties,
      selectedPricing,
      selectedInstitutionIds,
      searchQuery,
    ],
  );

  const coursesErrorMessage =
    coursesError instanceof Error ? coursesError.message : 'Unable to load courses.';

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-foreground sm:text-4xl">
            Explore Our Courses
          </h1>
          <p className="text-muted-foreground">
            Discover and learn from our extensive collection of courses
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <CourseFilters
            categories={categories}
            categoriesLoading={categoriesLoading}
            selectedCategoryIds={selectedCategoryIds}
            onToggleCategory={handleToggleCategory}
            selectedDifficulties={selectedDifficulties}
            onToggleDifficulty={handleToggleDifficulty}
            selectedPricing={selectedPricing}
            onPricingChange={handlePricingChange}
            institutions={institutions}
            institutionsLoading={institutionsLoading}
            selectedInstitutionIds={selectedInstitutionIds}
            onToggleInstitution={handleToggleInstitution}
            isCategoryOpen={isCategoryOpen}
            isDifficultyOpen={isDifficultyOpen}
            isPricingOpen={isPricingOpen}
            isInstitutionsOpen={isInstitutionsOpen}
            onCategoryToggle={() => setIsCategoryOpen(!isCategoryOpen)}
            onDifficultyToggle={() => setIsDifficultyOpen(!isDifficultyOpen)}
            onPricingToggle={() => setIsPricingOpen(!isPricingOpen)}
            onInstitutionsToggle={() => setIsInstitutionsOpen(!isInstitutionsOpen)}
          />

          <div className="md:col-span-3">
            <div className="mb-6">
              <CourseSearchSort
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                totalResults={totalResults}
              />
            </div>

            {hasActiveFilters ? (
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters applied</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs"
                >
                  Clear all filters
                </Button>
              </div>
            ) : null}

            {coursesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : null}

            {coursesIsError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
                <p className="font-medium text-destructive">Failed to load courses</p>
                <p className="mt-1 text-sm text-muted-foreground">{coursesErrorMessage}</p>
              </div>
            ) : null}

            {!coursesLoading && !coursesIsError && courses.length === 0 ? (
              <div className="rounded-lg bg-muted/50 p-12 text-center">
                <p className="mb-2 text-lg font-medium text-foreground">No courses found</p>
                <p className="mb-4 text-muted-foreground">
                  Try adjusting your filters or search query
                </p>
                {hasActiveFilters ? (
                  <Button variant="outline" onClick={handleClearFilters}>
                    Clear all filters
                  </Button>
                ) : null}
              </div>
            ) : null}

            {!coursesLoading && !coursesIsError && courses.length > 0 ? (
              <div className="bg-card">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course: CatalogCourseCard) => (
                    <CourseListItem
                      key={course.id}
                      course={course}
                      categoryName={
                        course.categories[0]?.name ??
                        categoryMap.get(selectedCategoryIds[0] ?? '')
                      }
                    />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 ? (
                  <div className="mt-6">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={pagination.total}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
