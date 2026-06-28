'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { ChevronRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusSwitchCell } from '@/components/data-table/status-switch-cell';
import { useDashboard } from '@/contexts/dashboard-context';
import { useLecturerDetail, useUpdateLecturerStatus } from '@/hooks/use-lecturers';
import { UserRole, UserStatus } from '@/types/enum';
import {
  getUserStatusClassName,
  getUserStatusLabel,
  isUserActiveStatus,
} from '@/lib/status-utils';

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return '—';
  return `${value}%`;
}

export function LecturerProfilePage({ lecturerId }: { lecturerId: string }) {
  const { role } = useDashboard();
  const canManage = role === UserRole.INSTITUTION_ADMIN;
  const { data, isPending } = useLecturerDetail(lecturerId, Boolean(lecturerId));
  const updateStatus = useUpdateLecturerStatus();

  if (isPending) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-lg border px-6 py-12 text-center text-sm text-muted-foreground">
        Lecturer not found.
      </div>
    );
  }

  const canToggle = data.status !== UserStatus.PENDING;

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/lecturers" className="hover:text-foreground">
            Lecturers
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{data.name ?? data.email}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              {data.name ?? 'Lecturer'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{data.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className={getUserStatusClassName(data.status)}>
              {getUserStatusLabel(data.status)}
            </Badge>
            {canManage && canToggle ? (
              <div className="flex items-center gap-2 text-sm">
                <span>Active</span>
                <StatusSwitchCell
                  checked={isUserActiveStatus(data.status)}
                  disabled={updateStatus.isPending}
                  isPending={updateStatus.isPending}
                  onCheckedChange={(active) =>
                    updateStatus.mutate({
                      lecturerId: data.id,
                      status: active ? UserStatus.ACTIVE : UserStatus.INACTIVE,
                    })
                  }
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-semibold">Profile information</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{data.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Phone</dt>
              <dd>{data.phoneNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Department</dt>
              <dd>{data.department?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Institution</dt>
              <dd>{data.institution?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Joined</dt>
              <dd>{format(new Date(data.createdAt), 'MMM d, yyyy')}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Specialization</dt>
              <dd>{data.specialization ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Qualification</dt>
              <dd>{data.qualification ?? '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold">Teaching statistics</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Total courses</p>
              <p className="mt-1 text-2xl font-semibold">{data.statistics.totalCourses}</p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Published</p>
              <p className="mt-1 text-2xl font-semibold">
                {data.statistics.publishedCourses}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Draft</p>
              <p className="mt-1 text-2xl font-semibold">{data.statistics.draftCourses}</p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Assigned courses</p>
              <p className="mt-1 text-2xl font-semibold">
                {data.statistics.assignedCoursesCount}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Created courses</p>
              <p className="mt-1 text-2xl font-semibold">
                {data.statistics.createdCoursesCount}
              </p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-xs uppercase text-muted-foreground">Total learners</p>
              <p className="mt-1 text-2xl font-semibold">{data.statistics.totalLearners}</p>
            </div>
            <div className="rounded-md border bg-muted/20 p-3 sm:col-span-2 lg:col-span-3">
              <p className="text-xs uppercase text-muted-foreground">
                Average completion rate
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {formatPercent(data.statistics.averageCompletionRate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/dashboard/lecturers">Back to lecturers</Link>
        </Button>
      </div>
    </div>
  );
}
