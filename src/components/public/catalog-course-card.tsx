'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Lock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CatalogCourseCard } from '@/types/catalog';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
  getDifficultyColor,
  getPrimaryCategoryName,
} from '@/lib/catalog-utils';

interface PublicCatalogCourseCardProps {
  course: CatalogCourseCard;
  showHoverPreview?: boolean;
}

export function PublicCatalogCourseCard({
  course,
  showHoverPreview = true,
}: PublicCatalogCourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const levelLabel = formatCatalogLevel(course.level);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/courses/${course.slug}`}>
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow h-full">
          <div className="relative h-48 bg-muted">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-secondary" />
            )}
          </div>

          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Badge
                variant="outline"
                className="text-xs font-medium uppercase rounded-none border-none bg-transparent hover:bg-transparent"
              >
                {getPrimaryCategoryName(course)}
              </Badge>
              <Badge
                className={`text-xs font-medium uppercase bg-background hover:bg-transparent ${getDifficultyColor(course.level)}`}
              >
                {levelLabel}
              </Badge>
            </div>

            <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatCatalogDuration(course.estimatedHours)}</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {formatCatalogPrice(course)}
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {showHoverPreview && isHovered ? (
        <div className="absolute inset-0 bg-background z-50 scale-105 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 ease-out shadow-xl">
          <div className="p-6">
            <div className="mb-4">
              <Badge
                variant="outline"
                className="text-sm font-medium uppercase rounded-none border-none"
              >
                {getPrimaryCategoryName(course)}
              </Badge>
            </div>

            <h2 className="text-lg font-bold text-foreground mb-4">{course.title}</h2>

            <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
              {course.subtitle ?? course.title}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <BookOpen className="h-4 w-4" />
                <span>
                  {course.modulesCount} Module{course.modulesCount === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-foreground-muted">
                <Clock className="h-4 w-4" />
                <span>{formatCatalogDuration(course.estimatedHours)}</span>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-foreground-muted">
                <Star className="h-3 w-3" />
                <span className="uppercase">{levelLabel}</span>
              </div>

              <div className="flex items-center gap-2 text-[12px] text-foreground-muted">
                <Lock className="h-3 w-3" />
                <span>{formatCatalogPrice(course)}</span>
              </div>
            </div>

            <Link href={`/courses/${course.slug}`} className="flex-1">
              <button className="w-full bg-primary hover:bg-primary text-panel-foreground p-1 rounded">
                Preview
              </button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
