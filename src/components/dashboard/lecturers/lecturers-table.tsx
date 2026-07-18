'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Eye, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { InviteLecturerModal } from '@/components/dashboard/lecturers/invite-lecturer-modal';
import {
  useLecturersList,
  useUpdateLecturerStatus,
} from '@/hooks/use-lecturers';
import { useDashboard } from '@/contexts/dashboard-context';
import type { LecturerListItem } from '@/types/lecturer.types';
import { UserRole, UserStatus } from '@/types/enum';
import {
  getUserStatusClassName,
  getUserStatusLabel,
  isUserActiveStatus,
} from '@/lib/status-utils';
import {
  DashboardActionGroup,
  DashboardActionIconButton,
} from '@/components/dashboard/dashboard-action-icon-button';

function canToggleStatus(row: LecturerListItem) {
  return row.status !== UserStatus.PENDING;
}

export function LecturersTable() {
  const { role } = useDashboard();
  const canManage = role === UserRole.INSTITUTION_ADMIN;
  const [searchInput, setSearchInput] = useState('');
  const [searchq, setSearchq] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchq(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const queryParams = useMemo(
    () => ({
      searchq: searchq || undefined,
      status:
        statusFilter === 'all' ? undefined : (statusFilter as UserStatus),
    }),
    [searchq, statusFilter],
  );

  const { data: lecturers = [], isPending, isFetching } = useLecturersList(queryParams);
  const updateStatus = useUpdateLecturerStatus();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full max-w-xs"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
              <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {canManage ? (
          <Button type="button" size="sm" className="h-8 px-3 text-xs" onClick={() => setInviteOpen(true)}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Invite Lecturer
          </Button>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        {isPending || isFetching ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : lecturers.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No lecturers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted/30 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  {canManage ? (
                    <th className="px-4 py-3 font-medium">Active</th>
                  ) : null}
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((row: LecturerListItem) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <p className="font-medium">{row.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.department?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={getUserStatusClassName(row.status)}>
                        {getUserStatusLabel(row.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">{row.coursesCount}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(row.createdAt), 'MMM d, yyyy')}
                    </td>
                    {canManage ? (
                      <td className="px-4 py-3">
                        <StatusSwitchCell
                          checked={isUserActiveStatus(row.status)}
                          disabled={!canToggleStatus(row)}
                          isPending={pendingId === row.id}
                          onCheckedChange={(active) => {
                            setPendingId(row.id);
                            updateStatus.mutate(
                              {
                                lecturerId: row.id,
                                status: active ? UserStatus.ACTIVE : UserStatus.INACTIVE,
                              },
                              { onSettled: () => setPendingId(null) },
                            );
                          }}
                        />
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <DashboardActionGroup>
                        <DashboardActionIconButton
                          label="View profile"
                          icon={Eye}
                          variant="primary"
                          href={`/dashboard/lecturers/${row.id}`}
                        />
                      </DashboardActionGroup>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {canManage ? (
        <InviteLecturerModal open={inviteOpen} onOpenChange={setInviteOpen} />
      ) : null}
    </div>
  );
}
