'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Clock, BarChart3, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CatalogCourseCard } from '@/types/catalog';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
  getDifficultyColor,
  getPrimaryCategoryName,
} from '@/lib/catalog-utils';

interface CourseListItemProps {
  course: CatalogCourseCard;
  categoryName?: string;
}

export function CourseListItem({ course, categoryName }: CourseListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const formattedDuration = formatCatalogDuration(course.estimatedHours);
  const formattedLevel = formatCatalogLevel(course.level);
  const priceLabel = formatCatalogPrice(course);
  const isFree = priceLabel === 'Free';

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/courses/${course.slug}`}>
        <div className="h-full cursor-pointer overflow-hidden border-0 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="relative h-48 bg-gray-100">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500" />
            )}
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-none border-none bg-transparent px-0 text-xs font-medium uppercase hover:bg-transparent"
              >
                {categoryName || getPrimaryCategoryName(course)}
              </Badge>

              <Badge
                className={`border border-gray-200 bg-white text-xs font-medium uppercase hover:bg-transparent ${getDifficultyColor(course.level)}`}
              >
                {formattedLevel}
              </Badge>
            </div>

            <h3 className="mb-3 line-clamp-2 text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {course.title}
            </h3>

            <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formattedDuration !== '—' ? formattedDuration : '—'}</span>
              </div>

              {isFree ? (
                <span className="font-bold text-green-600">Free</span>
              ) : (
                <span className="font-bold text-gray-900">{priceLabel}</span>
              )}
            </div>

            {course.institution?.name ? (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                {course.institution.logo ? (
                  <div className="h-4 w-4 shrink-0 overflow-hidden">
                    <Image
                      src={course.institution.logo}
                      alt={course.institution.name}
                      width={16}
                      height={16}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <span className="truncate">{course.institution.name}</span>
              </div>
            ) : null}
          </div>
        </div>
      </Link>

      <div
        className={`absolute inset-0 z-50 bg-white shadow-xl transition-all duration-200 ease-out ${
          isHovered
            ? 'pointer-events-auto translate-y-0 scale-105 opacity-100'
            : 'pointer-events-none translate-y-2 scale-100 opacity-0'
        }`}
      >
        <div className="flex h-full flex-col p-6">
          <div className="mb-3">
            <Badge
              variant="outline"
              className="rounded-none border-none px-0 text-xs font-medium uppercase"
            >
              {categoryName || getPrimaryCategoryName(course)}
            </Badge>
          </div>

          <h2 className="mb-3 line-clamp-2 text-base font-bold text-gray-900">{course.title}</h2>

          {course.subtitle ? (
            <p className="mb-4 line-clamp-3 text-sm text-gray-600">{course.subtitle}</p>
          ) : null}

          <div className="mb-5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>
                {course.modulesCount} Module{course.modulesCount === 1 ? '' : 's'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formattedDuration !== '—' ? formattedDuration : '—'}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-700">
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              <span className="uppercase">{formattedLevel}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-700">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>{priceLabel}</span>
            </div>
          </div>

          {course.institution ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
              {course.institution.logo ? (
                <div className="h-6 w-6 shrink-0 overflow-hidden">
                  <Image
                    src={course.institution.logo}
                    alt={course.institution.name}
                    width={24}
                    height={24}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center border border-blue-200 bg-blue-100">
                  <span className="text-[10px] font-bold text-blue-900">
                    {course.institution.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="truncate">{course.institution.name}</span>
            </div>
          ) : null}

          <div className="mt-auto">
            <Link href={`/courses/${course.slug}`}>
              <button className="w-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90">
                Preview
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
