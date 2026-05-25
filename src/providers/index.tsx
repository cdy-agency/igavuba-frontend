'use client';

import { AuthProvider } from './auth-provider';
import { ToastProvider } from '@/components/ui/toast';
import { RouteGuard } from '@/components/auth/route-guard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setGlobalToast } from '@/lib/toast';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider onToastAdded={setGlobalToast}>
        <AuthProvider>
          <RouteGuard>{children}</RouteGuard>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
