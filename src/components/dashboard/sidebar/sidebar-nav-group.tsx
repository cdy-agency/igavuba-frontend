'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import type { NavigationGroup } from '@/types/dashboard';
import { SidebarNavLink } from '@/components/dashboard/sidebar/sidebar-nav-link';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface SidebarNavGroupProps {
  group: NavigationGroup;
}

export function SidebarNavGroup({ group }: SidebarNavGroupProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [open, setOpen] = useState(true);

  if (collapsed) {
    return (
      <nav className="px-2">
        <ul className="flex flex-col gap-0.5">
          {group.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));

            return (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                title={item.title}
                icon={item.icon}
                isActive={isActive}
                badge={item.badge}
              />
            );
          })}
        </ul>
      </nav>
    );
  }

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const content = (
    <ul className="flex flex-col gap-0.5">
      {group.items.map((item) => (
        <SidebarNavLink
          key={item.href}
          href={item.href}
          title={item.title}
          icon={item.icon}
          isActive={isItemActive(item.href)}
          badge={item.badge}
        />
      ))}
    </ul>
  );

  if (group.collapsible) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          {group.label}
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </CollapsibleTrigger>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      <p className="px-6 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {group.label}
      </p>
      {content}
    </div>
  );
}
