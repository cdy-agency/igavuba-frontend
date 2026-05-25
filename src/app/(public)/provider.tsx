'use client';

import { Providers as AppProviders } from '@/providers/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>;
}
