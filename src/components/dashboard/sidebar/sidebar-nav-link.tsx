'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarNavLinkProps {
  href: string;
  title: string;
  icon: LucideIcon;
  isActive: boolean;
  badge?: string;
}

function getRailLabel(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length > 1 && title.length > 11) {
    return words[0];
  }
  return title.length > 100 ? `${title.slice(0, 100)}…` : title;
}

export function SidebarNavLink({ href, title, icon: Icon, isActive, badge }: SidebarNavLinkProps) {
  const { state, isMobile } = useSidebar();
  const collapsed = state === 'collapsed' && !isMobile;
  const railLabel = getRailLabel(title);

  const link = (
    <Link
      href={href}
      className={cn(
        'dashboard-rail-nav-item',
        isActive && 'dashboard-rail-nav-item--active',
      )}
      aria-label={title}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-5 w-5 shrink-0 stroke-[1.6]" />
      {!collapsed ? (
        <span className="dashboard-rail-nav-label">{railLabel}</span>
      ) : null}
      {badge ? (
        <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-0.5 text-[8px] font-bold text-accent-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <li className="w-full">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="border-border font-medium">
            {title}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <li className="w-full">{link}</li>;
}
