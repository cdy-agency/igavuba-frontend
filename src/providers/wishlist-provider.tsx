'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './auth-provider';
import { toast } from '@/lib/toast';
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from '@/api/wishlist.api';
import type { WishlistItem } from '@/types/wishlist.types';
import { UserRole } from '@/types/enum';

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

  const isLearner = user?.role === UserRole.LEARNER;

  const refreshWishlist = useCallback(async () => {
    if (!user || !isLearner) {
      setWishlistItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await getWishlist({ page: 1, limit: 100 });
      setWishlistItems(response.data);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLearner]);

  useEffect(() => {
    void refreshWishlist();
  }, [refreshWishlist]);

  const isWishlisted = useCallback(
    (courseId: string) => wishlistItems.some((item) => item.courseId === courseId),
    [wishlistItems],
  );

  const toggleWishlist = useCallback(
    async (courseId: string) => {
      if (!user) {
        toast.error('Please log in to manage your wishlist');
        return;
      }

      if (!isLearner) {
        toast.error('Only learners can use the wishlist');
        return;
      }

      const currentlyWishlisted = isWishlisted(courseId);
      const previous = wishlistItems;

      try {
        if (currentlyWishlisted) {
          setWishlistItems((prev) => prev.filter((item) => item.courseId !== courseId));
          await removeFromWishlist(courseId);
        } else {
          setWishlistItems((prev) => [
            ...prev,
            {
              id: `temp-${courseId}`,
              learnerId: 'temp',
              courseId,
              createdAt: new Date().toISOString(),
              course: null,
            },
          ]);
          await addToWishlist(courseId);
          await refreshWishlist();
        }
      } catch (error) {
        setWishlistItems(previous);
        console.error('Failed to toggle wishlist:', error);
        toast.error('Failed to update wishlist');
      }
    },
    [user, isLearner, isWishlisted, wishlistItems, refreshWishlist],
  );

  const value = useMemo<WishlistContextType>(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      isWishlisted,
      toggleWishlist,
      isLoading,
      refreshWishlist,
    }),
    [wishlistItems, isWishlisted, toggleWishlist, isLoading, refreshWishlist],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
