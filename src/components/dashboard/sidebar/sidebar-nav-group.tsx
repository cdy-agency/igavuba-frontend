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

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  if (collapsed) {
    return (
      <nav className="px-2">
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
      </nav>
    );
  }

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
        <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-colors hover:text-muted-foreground">
          <span>{group.label}</span>
          <ChevronDown
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>{content}</CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div>
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
        {group.label}
      </p>
      {content}
    </div>
  );
}