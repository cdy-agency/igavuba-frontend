'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { DashboardQuickAction } from '@/types/dashboard.types';

interface QuickActionsProps {
  actions: DashboardQuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-muted-foreground">Quick actions</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Link
            key={action.key}
            href={action.href}
            className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm font-medium transition-colors hover:border-primary/30 hover:bg-muted/30"
          >
            <span>{action.label}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
