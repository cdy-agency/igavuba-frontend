'use client';

import Link from 'next/link';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { useDashboard } from '@/contexts/dashboard-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { getRoleLabel } from '@/lib/role-utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function getInitials(name?: string, email?: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  return email?.slice(0, 2).toUpperCase() ?? 'U';
}

export function UserProfileDropdown() {
  const { user, role } = useDashboard();
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-10 gap-2 rounded-xl px-2 hover:bg-muted',
            'focus-visible:ring-2 focus-visible:ring-ring md:h-11 md:pl-2 md:pr-3',
          )}
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary-muted">
            <AvatarFallback className="bg-gradient-to-br from-primary-subtle to-primary-muted text-sm font-semibold text-primary">
              {getInitials(user?.name, user?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left md:block">
            <p className="truncate text-sm font-semibold leading-none text-foreground">
              {user?.name ?? 'User'}
            </p>
            {role ? (
              <p className="truncate pt-0.5 text-xs text-muted-foreground">{getRoleLabel(role)}</p>
            ) : null}
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5 shadow-lg">
        <DropdownMenuLabel className="rounded-lg bg-muted px-3 py-2.5 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user?.name ?? 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
            {role ? (
              <span className="mt-2 inline-flex w-fit rounded-md bg-primary-subtle px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {getRoleLabel(role)}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem asChild className="rounded-lg">
          <Link href="/dashboard/profile">
            <UserRound className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg">
          <Link href="/dashboard/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void logout();
          }}
          className="rounded-lg text-destructive focus:bg-red-50 focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
