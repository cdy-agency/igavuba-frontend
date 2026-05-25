'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useAuth } from './auth-provider';
import { toast } from '@/lib/toast';

interface WishlistItem {
  courseId: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isWishlisted: (courseId: string) => boolean;
  toggleWishlist: (courseId: string) => Promise<void>;
  isLoading: boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const wishlistCount = wishlistItems.length;

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
    }
  }, [user]);

  const isWishlisted = useCallback(
    (courseId: string) => {
      return wishlistItems.some((item) => item.courseId === courseId);
    },
    [wishlistItems],
  );

  const toggleWishlist = useCallback(
    async (courseId: string) => {
      if (!user) {
        toast.error('Please log in to manage your wishlist');
        return;
      }

      const currentlyWishlisted = isWishlisted(courseId);

      try {
        setIsLoading(true);

        if (currentlyWishlisted) {
          setWishlistItems((prev) => prev.filter((item) => item.courseId !== courseId));
          toast.success('Removed from wishlist');
        } else {
          setWishlistItems((prev) => [...prev, { courseId }]);
          toast.success('Added to wishlist');
        }
      } catch (error) {
        console.error('Failed to toggle wishlist:', error);
        toast.error('Failed to update wishlist');
      } finally {
        setIsLoading(false);
      }
    },
    [user, isWishlisted, refreshWishlist],
  );

  const value: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    isWishlisted,
    toggleWishlist,
    isLoading,
    refreshWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
