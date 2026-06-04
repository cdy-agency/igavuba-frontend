'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock, BarChart3, Users, Lock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/types/course';
import { formatDuration, formatDifficulty, getAccessStatus } from '@/util/courseUtil';
import { useState } from 'react';

interface CourseListItemProps {
  course: Course;
  categoryName?: string;
}

export function CourseListItem({ course, categoryName }: CourseListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const accessStatus = getAccessStatus(course.price);
  const formattedDuration = formatDuration(course.duration_weeks);
  const formattedLevel = formatDifficulty(course.difficulty_level);

  const getDifficultyColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'text-success';
      case 'intermediate':
        return 'text-accent';
      case 'advanced':
        return 'text-destructive';
      default:
        return 'text-foreground-muted';
    }
  };

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Main Card ── */}
      <Link href={`/course/${course._id}`}>
        <div className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full bg-background rounded-sm cursor-pointer">

          {/* Thumbnail */}
          <div className="relative h-48 bg-muted">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary" />
            )}

            {/* Certified badge overlay */}
            {course.is_certified && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-secondary/100 text-panel-foreground text-xs font-semibold px-2 py-1 rounded-sm">
                  CERTIFIED
                </Badge>
              </div>
            )}
          </div>

          {/* Card body */}
          <div className="p-5">
            {/* Category + Difficulty badges */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="text-xs font-medium uppercase rounded-none border-none bg-transparent hover:bg-transparent px-0"
              >
                {categoryName || course.category?.name || 'General'}
              </Badge>

              <Badge
                className={`text-xs font-medium uppercase bg-background border border-border hover:bg-transparent ${getDifficultyColor(course.difficulty_level)}`}
              >
                {formattedLevel}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            {/* Duration + Price row */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formattedDuration !== '—' ? formattedDuration : '—'}</span>
              </div>

              {accessStatus === 'Free' ? (
                <span className="font-bold text-success">Free</span>
              ) : (
                <span className="font-bold text-foreground">
                  {course.price.toLocaleString()} RWF
                </span>
              )}
            </div>

            {/* Enrollments */}
            {course.totalStudent > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Users className="w-3.5 h-3.5" />
                <span>{course.totalStudent.toLocaleString()} enrolled</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* ── Hover Popup ── */}
      <div
        className={`
          absolute inset-0 bg-background z-50 shadow-xl rounded-sm
          transition-all duration-200 ease-out pointer-events-none
          ${isHovered
            ? 'opacity-100 scale-105 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-100 translate-y-2'
          }
        `}
      >
        <div className="p-6 flex flex-col h-full">
          {/* Category badge */}
          <div className="mb-3">
            <Badge
              variant="outline"
              className="text-xs font-medium uppercase rounded-none border-none px-0"
            >
              {categoryName || course.category?.name || 'General'}
            </Badge>
          </div>

          {/* Title */}
          <h2 className="text-base font-bold text-foreground mb-3 line-clamp-2">
            {course.title}
          </h2>

          {/* Description */}
          {course.description && (
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {course.description}
            </p>
          )}

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span>
                {course.instructor_id?.profession_name ?? 'Course'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <Clock className="h-4 w-4 flex-shrink-0" />
              <span>{formattedDuration !== '—' ? formattedDuration : '—'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <BarChart3 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="uppercase">{formattedLevel}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-foreground-muted">
              <Lock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {accessStatus === 'Free'
                  ? 'Free'
                  : `${course.price.toLocaleString()} RWF`}
              </span>
            </div>
          </div>

          {/* Institution row */}
          {course.institution && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              {course.institution.logo ? (
                <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={course.institution.logo}
                    alt={course.institution.name}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded bg-primary-muted border border-primary-muted flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-active font-bold text-[10px]">
                    {course.institution.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{course.institution.name}</span>
            </div>
          )}

          {/* Preview button */}
          <div className="mt-auto">
            <Link href={`/course/${course._id}`}>
              <button className="w-full bg-primary hover:bg-primary text-panel-foreground py-2 px-4 rounded text-sm font-medium transition-colors">
                Preview
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
