'use client';

import Link from 'next/link';
import {
  BookOpen,
  FolderOpen,
  GraduationCap,
  LayoutGrid,
  List,
  Plus,
  Search,
  Shapes,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CourseStatusTabs,
  type CourseStatusTab,
} from '@/components/dashboard/courses/course-status-tabs';
import type { CourseStatusCounts } from '@/hooks/use-course-status-counts';
import { CourseLevel } from '@/types/course';
import type { CourseDepartment } from '@/types/course';
import { COURSE_LEVEL_LABELS } from '@/lib/course-utils';
import { cn } from '@/lib/utils';

type ViewMode = 'list' | 'cards';

const LEVEL_OPTIONS = Object.values(CourseLevel);

interface CoursesPageHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusTab: CourseStatusTab;
  onStatusChange: (value: CourseStatusTab) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  level: string;
  onLevelChange: (value: string) => void;
  departments: CourseDepartment[];
  statusCounts?: CourseStatusCounts;
  isLoadingCounts?: boolean;
  className?: string;
}

export function CoursesPageHeader({
  searchValue,
  onSearchChange,
  statusTab,
  onStatusChange,
  viewMode,
  onViewModeChange,
  departmentId,
  onDepartmentChange,
  level,
  onLevelChange,
  departments,
  statusCounts,
  isLoadingCounts,
  className,
}: CoursesPageHeaderProps) {
  return (
    <div
      className={cn(
        'space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:space-y-5 sm:p-5',
        className,
      )}
    >
      {/* Row 1 — title, section tabs, primary action */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center lg:gap-6">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Course Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your courses, categories, and learning content
          </p>
        </div>

        <div className="inline-flex w-fit rounded-md border border-border bg-muted/30 p-0.5">
          <span className="inline-flex items-center gap-1.5 rounded bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            Courses
          </span>
        </div>

        <Button asChild size="sm" className="h-8 w-full shrink-0 px-3 text-xs lg:w-auto">
          <Link href="/dashboard/courses/new">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Row 2 — search, filters, view toggle */}
      <div className="flex flex-col gap-3 border-t border-border/60 pt-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search courses..."
            className="h-8 border-border/80 bg-muted/20 pl-8 text-xs shadow-none focus-visible:bg-background"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={departmentId} onValueChange={onDepartmentChange}>
            <SelectTrigger className="h-8 w-full min-w-[9.5rem] gap-1.5 border-border/80 bg-muted/20 text-xs sm:w-[10.5rem]">
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={onLevelChange}>
            <SelectTrigger className="h-8 w-full min-w-[9.5rem] gap-1.5 border-border/80 bg-muted/20 text-xs sm:w-[10.5rem]">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {COURSE_LEVEL_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="inline-flex shrink-0 rounded-md border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
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
              onClick={() => onViewModeChange('cards')}
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

      {/* Row 3 — status pills with counts */}
      <div className="border-t border-border/60 pt-4">
        <CourseStatusTabs
          value={statusTab}
          onChange={onStatusChange}
          counts={statusCounts}
          isLoadingCounts={isLoadingCounts}
        />
      </div>
    </div>
  );
}
