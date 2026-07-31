'use client';

import Link from 'next/link';
import { Eye, KeyRound, ListPlus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDashboardActionButtonClass } from '@/lib/dashboard-action-button';
import type { StudentListItem } from '@/types/student.types';
import { UserStatus } from '@/types/enum';

type StudentRowActionsMenuProps = {
  student: StudentListItem;
  canManage: boolean;
  resetPasswordPending?: boolean;
  onAssignCourses: (student: StudentListItem) => void;
  onResetPassword: (studentId: string) => void;
  onCancelInvitation?: (email: string) => void;
};

export function StudentRowActionsMenu({
  student,
  canManage,
  resetPasswordPending,
  onAssignCourses,
  onResetPassword,
  onCancelInvitation,
}: StudentRowActionsMenuProps) {
  const isActive = student.status === UserStatus.ACTIVE;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={getDashboardActionButtonClass()}
          aria-label="Student actions"
        >
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/students/${student.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View profile
          </Link>
        </DropdownMenuItem>
        {canManage && isActive ? (
          <DropdownMenuItem onClick={() => onAssignCourses(student)}>
            <ListPlus className="mr-2 h-4 w-4" />
            Assign courses
          </DropdownMenuItem>
        ) : null}
        {canManage && isActive ? (
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
