'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Clock,
  Heart,
  Loader2,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WishlistItem } from '@/types/wishlist.types';
import { useWishlistContext } from '@/providers/wishlist-provider';
import { useCreateEnrollment } from '@/hooks/use-enrollment';
import {
  formatCatalogDuration,
  formatCatalogLevel,
  formatCatalogPrice,
} from '@/lib/catalog-utils';
import { cn } from '@/lib/utils';

export function WishlistCard({ item }: { item: WishlistItem }) {
  const router = useRouter();
  const { toggleWishlist, refreshWishlist } = useWishlistContext();
  const createEnrollment = useCreateEnrollment();
  const [removing, setRemoving] = useState(false);
  const course = item.course;

  if (!course) {
    return null;
  }

  const categoryName = course.categories[0]?.category?.name ?? 'Course';
  const priceLabel = formatCatalogPrice({
    accessType: course.accessType as never,
    publicPrice: course.publicPrice,
  });
  const isFree = priceLabel === 'Free';
  const durationLabel = formatCatalogDuration(course.estimatedHours);
  const levelLabel = formatCatalogLevel(course.level as never);
  const courseHref = `/courses/${course.slug}`;
  const learnHref = `/learn/${course.slug}`;

  const handleEnroll = async () => {
    try {
      await createEnrollment.mutateAsync({ courseId: course.id });
      await refreshWishlist();
      router.push(learnHref);
    } catch {
      // toast handled by mutation
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await toggleWishlist(course.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <article
      className={cn(
        'group grid gap-4 border-b border-border/80 py-5 last:border-b-0',
        'sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-start sm:gap-5',
      )}
    >
      <Link
        href={courseHref}
        className="relative block aspect-video w-full overflow-hidden rounded-lg bg-muted sm:aspect-auto sm:h-[90px] sm:w-[160px]"
      >
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="160px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-secondary/20" />
        )}
      </Link>

      <div className="min-w-0 space-y-2">
        <div className="space-y-1">
          <Link href={courseHref} className="block">
            <h3 className="text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-[1.05rem]">
              {course.title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{course.institution.name}</p>
        </div>

        {course.shortDescription ? (
          <p className="line-clamp-2 text-sm text-muted-foreground/90">
            {course.shortDescription}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{categoryName}</span>
          <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
          <span>{levelLabel}</span>
          {durationLabel !== '—' ? (
            <>
              <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {durationLabel}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-3 sm:pt-0.5">
        <div className="text-left sm:text-right">
          <p
            className={cn(
              'text-lg font-bold tracking-tight',
              isFree ? 'text-emerald-600' : 'text-foreground',
            )}
          >
            {priceLabel}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:flex-col sm:items-stretch sm:gap-2">
          <Button
            type="button"
            size="sm"
            className="h-10 min-w-[8.5rem] gap-1.5 rounded-md px-4 font-semibold shadow-sm"
            disabled={createEnrollment.isPending || removing}
            onClick={() => void handleEnroll()}
          >
            {createEnrollment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enrolling…
              </>
            ) : (
              <>
                Enroll now
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-md px-3 text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
            disabled={removing || createEnrollment.isPending}
            onClick={() => void handleRemove()}
          >
            {removing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Remove
          </Button>
        </div>
      </div>
    </article>
  );
}

export function WishlistEmptyState({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Heart className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Your wishlist is empty</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Save courses you like and come back when you are ready to enroll.
      </p>
      <Button asChild className="mt-6 h-11 rounded-md px-6 font-semibold">
        <Link href="/courses" onClick={onBrowse}>
          Browse courses
        </Link>
      </Button>
    </div>
  );
}
