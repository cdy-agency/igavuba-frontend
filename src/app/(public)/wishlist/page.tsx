'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingHeader from '@/components/landing-pages/header';
import { LandingFooter } from '@/components/landing-pages/landingFooter';
import { WishlistPage } from '@/components/wishlist/WishlistPage';
import { useAuth } from '@/lib/hooks/use-auth';
import { GUEST_ROUTES } from '@/lib/routes';
import { Loader2 } from 'lucide-react';

export default function PublicWishlistRoutePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(
        `${GUEST_ROUTES.LOGIN}?redirect=${encodeURIComponent('/wishlist')}`,
      );
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-muted/40 via-background to-background">
      <LandingHeader />
      <main className="flex-1">
        <WishlistPage variant="public" />
      </main>
      <LandingFooter />
    </div>
  );
}
