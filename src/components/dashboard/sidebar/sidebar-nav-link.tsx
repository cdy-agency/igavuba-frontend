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

export function SidebarNavLink({ href, title, icon: Icon, isActive, badge }: SidebarNavLinkProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const link = (
    <Link
      href={href}
      className={cn(
        'relative flex h-10 w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'justify-center px-2' : 'pl-4 pr-3',
        isActive
          ? 'bg-primary-subtle font-medium text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {isActive ? (
        <span
          aria-hidden
          className="absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-r-full bg-primary"
        />
      ) : null}
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 stroke-[1.75]',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )}
      />
      {!collapsed ? <span className="flex-1 truncate">{title}</span> : null}
      {!collapsed && badge ? (
        <span className="ml-auto rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );

  if (collapsed) {
    return (
      <li>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {title}
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <li>{link}</li>;
}
