'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlistContext } from '@/providers/wishlist-provider';
import { cn } from '@/lib/utils';

export function WishlistButton({
  courseId,
  className,
  size = 'icon',
  showLabel = false,
}: {
  courseId: string;
  className?: string;
  size?: 'icon' | 'default' | 'sm';
  showLabel?: boolean;
}) {
  const { isWishlisted, toggleWishlist, isLoading } = useWishlistContext();
  const saved = isWishlisted(courseId);
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn(
        'relative z-10',
        saved ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      disabled={isLoading || pending}
      onClick={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        setPending(true);
        try {
          await toggleWishlist(courseId);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
      )}
      {showLabel ? (
        <span className="ml-1.5 text-xs">{saved ? 'Saved' : 'Save'}</span>
      ) : null}
    </Button>
  );
}
