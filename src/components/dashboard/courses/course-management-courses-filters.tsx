'use client';

import { FolderOpen, GraduationCap } from 'lucide-react';
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
import { CourseLevel, type CourseDepartment } from '@/types/course';
import { COURSE_LEVEL_LABELS } from '@/lib/course-utils';

const LEVEL_OPTIONS = Object.values(CourseLevel);

interface CourseManagementCoursesFiltersProps {
  statusTab: CourseStatusTab;
  onStatusChange: (value: CourseStatusTab) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  level: string;
  onLevelChange: (value: string) => void;
  departments: CourseDepartment[];
  statusCounts?: CourseStatusCounts;
  isLoadingCounts?: boolean;
}

export function CourseManagementCoursesFilters({
  statusTab,
  onStatusChange,
  departmentId,
  onDepartmentChange,
  level,
  onLevelChange,
  departments,
  statusCounts,
  isLoadingCounts,
}: CourseManagementCoursesFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
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
      </div>

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
