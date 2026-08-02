"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, Clock, Lock, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import type { CatalogCourseCard } from '@/types/catalog';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
  getDifficultyColor,
  getPrimaryCategoryName,
} from '@/lib/catalog-utils';
import { WishlistButton } from '@/components/wishlist/WishlistButton';

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
    <motion.div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.03, y: -6 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <Link href={`/courses/${course.slug}`}>
        <motion.div className="h-full" layout>
          <Card className="overflow-hidden border-0 shadow-sm h-full">
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
            <div className="absolute right-2 top-2 z-10" onClick={(e) => e.preventDefault()}>
              <WishlistButton
                courseId={course.id}
                className="bg-background/90 shadow-sm hover:bg-background"
              />
            </div>
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

            <h3 className="font-semibold text-foreground text-base mb-3 line-clamp-2 transition-colors">
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
        </motion.div>
      </Link>

      <AnimatePresence>
        {showHoverPreview && isHovered ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1.02 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 overflow-hidden bg-background z-50 shadow-xl"
          >
            <div className="p-6 flex h-full flex-col">
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

              <div className="mt-auto min-w-0">
                <Link href={`/courses/${course.slug}`} className="block w-full">
                  <button className="w-full max-w-full overflow-hidden bg-primary hover:bg-primary text-panel-foreground px-4 py-3 rounded-md text-sm font-semibold">
                    Preview
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
