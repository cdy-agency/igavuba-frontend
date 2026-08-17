'use client';

import Link from 'next/link';
import { Eye, KeyRound, ListPlus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { StudentListItem } from '@/types/student.types';
import { UserStatus } from '@/types/enum';

type StudentRowActionsMenuProps = {
  student: StudentListItem;
  canManage?: boolean;
  resetPasswordPending?: boolean;
  onViewDetails?: (student: StudentListItem) => void;
  onAssignCourses?: (student: StudentListItem) => void;
  onResetPassword?: (studentId: string) => void | Promise<void>;
  onCancelInvitation?: (email: string) => void | Promise<void>;
};

export function StudentRowActionsMenu({
  student,
  canManage = false,
  resetPasswordPending,
  onViewDetails,
  onAssignCourses,
  onResetPassword,
  onCancelInvitation,
}: StudentRowActionsMenuProps) {
  const isActive = student.status === UserStatus.ACTIVE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onViewDetails ? (
          <DropdownMenuItem onClick={() => onViewDetails(student)}>
            View details
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/students/${student.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Open profile
          </Link>
        </DropdownMenuItem>
        {canManage && isActive && onAssignCourses ? (
          <DropdownMenuItem onClick={() => onAssignCourses(student)}>
            <ListPlus className="mr-2 h-4 w-4" />
            Assign courses
          </DropdownMenuItem>
        ) : null}
        {canManage && isActive && onResetPassword ? (
          <DropdownMenuItem
            disabled={resetPasswordPending}
            onClick={() => void onResetPassword(student.id)}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Reset password
          </DropdownMenuItem>
        ) : null}
        {canManage && student.status === UserStatus.PENDING ? (
          <DropdownMenuItem
            onClick={() => {
              if (!onCancelInvitation) return;
              void onCancelInvitation(student.email);
            }}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Cancel invitation
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
