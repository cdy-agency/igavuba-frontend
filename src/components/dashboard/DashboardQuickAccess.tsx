'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/providers/auth-provider';

export function DashboardQuickAccess() {
  const { user } = useAuth();
  const pathname = usePathname();

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  if (!user) return null;
  if (pathname?.startsWith('/dashboard')) return null;

  const isLearnPage = pathname?.startsWith('/learn');

  const positionClasses = isLearnPage
    ? 'bottom-28 sm:bottom-24 right-4 sm:right-6'
    : 'bottom-20 right-4 sm:bottom-6 sm:right-6';

  const node = (
    <div className={`fixed ${positionClasses} z-50`}>
      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg h-12 w-12 hover:scale-95 transition-transform"
        aria-label="Open dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z"
            fill="currentColor"
          />
        </svg>
      </Link>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(node, document.body) : null;
}
