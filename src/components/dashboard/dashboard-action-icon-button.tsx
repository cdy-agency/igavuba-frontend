'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  dashboardActionGroupClass,
  dashboardActionIconClass,
  getDashboardActionButtonClass,
  type DashboardActionVariant,
} from '@/lib/dashboard-action-button';

type DashboardActionIconButtonProps = {
  label: string;
  icon: LucideIcon;
  variant?: DashboardActionVariant;
  href?: string;
  externalHref?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function DashboardActionIconButton({
  label,
  icon: Icon,
  variant = 'default',
  href,
  externalHref,
  onClick,
  disabled,
  className,
}: DashboardActionIconButtonProps) {
  const buttonClass = cn(getDashboardActionButtonClass(variant), className);
  const icon = <Icon className={dashboardActionIconClass} />;

  let trigger: ReactNode;

  if (href) {
    trigger = (
      <Button asChild variant="outline" size="sm" className={buttonClass} disabled={disabled}>
        <Link href={href} aria-label={label}>
          {icon}
        </Link>
      </Button>
    );
  } else if (externalHref) {
    trigger = (
      <Button asChild variant="outline" size="sm" className={buttonClass} disabled={disabled}>
        <a href={externalHref} target="_blank" rel="noreferrer" aria-label={label}>
          {icon}
        </a>
      </Button>
    );
  } else {
    trigger = (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={buttonClass}
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {icon}
      </Button>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function DashboardActionGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className={cn(dashboardActionGroupClass, className)}>{children}</div>
    </TooltipProvider>
  );
}
