'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FolderOpen,
  LayoutGrid,
  List,
  Plus,
  Search,
  Shapes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoriesPanel } from '@/components/dashboard/courses/categories-panel';
import { CoursesTableContent } from '@/components/dashboard/courses/courses-table-content';
import { CreateCategoryModal } from '@/components/dashboard/courses/create-category-modal';
import type { CourseManagementTab } from '@/components/dashboard/courses/course-management-tab';
import { useCategoriesList } from '@/hooks/use-categories';
import { useCoursesList } from '@/hooks/use-courses';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useAuth } from '@/lib/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Category } from '@/types/category';
import { UserRole } from '@/types/enum';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'cards';

const CATEGORY_MANAGER_ROLES = new Set<UserRole>([
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
]);

interface CourseManagementPageProps {
  className?: string;
}

export function CourseManagementPage({ className }: CourseManagementPageProps) {
  const authReady = useAuthReady();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const canManageCategories = user?.role
    ? CATEGORY_MANAGER_ROLES.has(user.role as UserRole)
    : false;

  const [managementTab, setManagementTab] = useState<CourseManagementTab>('courses');
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [coursesSearchInput, setCoursesSearchInput] = useState('');
  const [categoriesSearchInput, setCategoriesSearchInput] = useState('');
  const [coursesViewMode, setCoursesViewMode] = useState<ViewMode>(isMobile ? 'cards' : 'list');
  const [categoriesViewMode, setCategoriesViewMode] = useState<ViewMode>('list');
  const [coursesViewModeTouched, setCoursesViewModeTouched] = useState(false);

  useEffect(() => {
    if (!coursesViewModeTouched && isMobile) {
      setCoursesViewMode('cards');
    }
  }, [coursesViewModeTouched, isMobile]);

  const { data: categories = [] as Category[] } = useCategoriesList(authReady);
  const { data: coursesSummary } = useCoursesList({ page: 1, limit: 1 });

  const categoryStats = useMemo(() => {
    const totalCoursesFromCategories = categories.reduce(
      (sum: number, category: Category) => sum + category.publishedCourseCount,
      0,
    );

    return {
      totalCategories: categories.length,
      topLevel: categories.length,
      totalCourses: coursesSummary?.pagination?.total ?? totalCoursesFromCategories,
    };
  }, [categories, coursesSummary?.pagination?.total]);

  const searchValue =
    managementTab === 'courses' ? coursesSearchInput : categoriesSearchInput;
  const viewMode = managementTab === 'courses' ? coursesViewMode : categoriesViewMode;

  const handleSearchChange = (value: string) => {
    if (managementTab === 'courses') {
      setCoursesSearchInput(value);
      return;
    }
    setCategoriesSearchInput(value);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (managementTab === 'courses') {
      setCoursesViewModeTouched(true);
      setCoursesViewMode(mode);
      return;
    }
    setCategoriesViewMode(mode);
  };

  const searchPlaceholder =
    managementTab === 'courses' ? 'Search courses...' : 'Search categories...';

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:space-y-5 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-6">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Course Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your courses, categories, and learning content
            </p>

            {managementTab === 'categories' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <StatBadge
                  icon={Shapes}
                  label="Total Categories"
                  value={categoryStats.totalCategories}
                  className="border-sky-200 bg-sky-50 text-sky-700"
                  iconClassName="text-sky-600"
                />
                <StatBadge
                  icon={FolderOpen}
                  label="Top Level"
                  value={categoryStats.topLevel}
                  className="border-violet-200 bg-violet-50 text-violet-700"
                  iconClassName="text-violet-600"
                />
                <StatBadge
                  icon={BookOpen}
                  label="Total Courses"
                  value={categoryStats.totalCourses}
                  className="border-pink-200 bg-pink-50 text-pink-700"
                  iconClassName="text-pink-600"
                />
              </div>
            ) : null}
          </div>

          <div className="inline-flex w-fit rounded-md border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setManagementTab('courses')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                managementTab === 'courses'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              Courses
            </button>
            <button
              type="button"
              onClick={() => setManagementTab('categories')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors',
                managementTab === 'categories'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Shapes className="h-3.5 w-3.5 text-primary" />
              Categories
            </button>
          </div>

          {managementTab === 'courses' ? (
            <Button asChild size="sm" className="h-8 w-full shrink-0 px-3 text-xs lg:w-auto">
              <Link href="/dashboard/courses/new">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Course
              </Link>
            </Button>
          ) : canManageCategories ? (
            <Button
              size="sm"
              className="h-8 w-full shrink-0 px-3 text-xs lg:w-auto"
              onClick={() => setCreateCategoryOpen(true)}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Create Category
            </Button>
          ) : (
            <div className="hidden lg:block lg:w-[8.5rem]" />
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 border-border/80 bg-muted/20 pl-8 text-xs shadow-none focus-visible:bg-background"
            />
          </div>

          <div className="inline-flex shrink-0 rounded-md border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => handleViewModeChange('list')}
              aria-label="List view"
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange('cards')}
              aria-label="Card view"
              className={cn(
                'inline-flex h-7 w-7 items-center justify-center rounded transition-colors',
                viewMode === 'cards'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {managementTab === 'courses' ? (
        <CoursesTableContent
          searchInput={coursesSearchInput}
          viewMode={coursesViewMode}
        />
      ) : (
        <CategoriesPanel search={categoriesSearchInput} viewMode={categoriesViewMode} />
      )}

      <CreateCategoryModal open={createCategoryOpen} onOpenChange={setCreateCategoryOpen} />
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  className,
  iconClassName,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', iconClassName)} />
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </span>
  );
}
