'use client';

import * as React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from './auth-provider';
import { WishlistProvider } from './wishlist-provider';
import { ToastProvider } from '@/components/ui/toast';
import { setGlobalToast } from '@/lib/toast';
import { DashboardQuickAccess } from '@/components/dashboard/DashboardQuickAccess';
import { RouteGuard } from '@/components/auth/route-guard';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        enableColorScheme
      >
        <ToastProvider onToastAdded={setGlobalToast}>
          <AuthProvider>
            <DashboardQuickAccess />
            <WishlistProvider>
              <RouteGuard>{children}</RouteGuard>
            </WishlistProvider>
          </AuthProvider>
        </ToastProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
