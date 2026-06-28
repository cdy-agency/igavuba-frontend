'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { UserCog, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AssignCourseOwnerModal,
  TransferCourseOwnershipModal,
} from '@/components/dashboard/courses/course-ownership-modals';
import { CourseLecturerSelect } from '@/components/dashboard/courses/course-lecturer-select';
import { useAssignCourseOwner } from '@/hooks/use-course-ownership';
import { useLecturersList } from '@/hooks/use-lecturers';
import { useDashboard } from '@/contexts/dashboard-context';
import type { Course } from '@/types/course';
import type { LecturerListItem } from '@/types/lecturer.types';
import { UserRole } from '@/types/enum';
import { getRoleLabel } from '@/lib/role-utils';

function displayUserName(name: string | null | undefined, email: string) {
  return name?.trim() || email;
}

export function CourseOwnerSection({ course }: { course: Course }) {
  const { role, user } = useDashboard();
  const [assignOpen, setAssignOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState(course.lecturerId ?? undefined);
  const assignOwner = useAssignCourseOwner(course.slug);
  const { data: lecturers = [] } = useLecturersList();

  const isInstitutionAdmin = role === UserRole.INSTITUTION_ADMIN;
  const isOwner = user?.id === course.ownerId;
  const categoryLabel =
    course.categories?.[0]?.category.name ?? course.department?.name ?? '—';

  const handleLecturerAssign = async (lecturerProfileId: string | undefined) => {
    setSelectedLecturerId(lecturerProfileId);
    if (!lecturerProfileId) return;

    const lecturer = lecturers.find(
      (entry: LecturerListItem) => entry.id === lecturerProfileId,
    );
    if (!lecturer || lecturer.userId === course.ownerId) return;

    await assignOwner.mutateAsync({ ownerId: lecturer.userId });
  };

  useEffect(() => {
    setSelectedLecturerId(course.lecturerId ?? undefined);
  }, [course.lecturerId, course.ownerId]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Course ownership</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The owner manages course content, modules, assessments, and review submission.
          </p>
        </div>
        {isInstitutionAdmin ? (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssignOpen(true)}>
              <UserCog className="mr-1.5 h-3.5 w-3.5" />
              Assign Owner
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setTransferOpen(true)}>
              <UserRound className="mr-1.5 h-3.5 w-3.5" />
              Transfer Ownership
            </Button>
          </div>
        ) : null}
      </div>

      {isInstitutionAdmin ? (
        <div className="mt-4 max-w-md space-y-1.5">
          <p className="text-sm font-medium">Lecturers (optional)</p>
          <p className="text-xs text-muted-foreground">
            Select a lecturer from your institution. They will become the course owner.
          </p>
          <CourseLecturerSelect
            value={selectedLecturerId}
            onChange={handleLecturerAssign}
            disabled={assignOwner.isPending}
            allowUnassigned={false}
            showSelectionStatus={false}
          />
        </div>
      ) : null}

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Owner</dt>
          <dd className="font-medium">
            {displayUserName(course.owner?.name, course.owner?.email ?? '')}
            <span className="ml-1 text-xs text-muted-foreground">
              ({getRoleLabel(course.owner?.role as UserRole)})
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Institution</dt>
          <dd>{course.institution?.name ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Category</dt>
          <dd>{categoryLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Created by</dt>
          <dd>{displayUserName(course.createdBy?.name, course.createdBy?.email ?? '')}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last updated by</dt>
          <dd>
            {course.updatedBy
              ? displayUserName(course.updatedBy.name, course.updatedBy.email)
              : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Your access</dt>
          <dd>{isOwner ? 'Course owner' : 'View only'}</dd>
        </div>
        {course.ownerAssignedAt ? (
          <div>
            <dt className="text-muted-foreground">Owner assigned</dt>
            <dd>{format(new Date(course.ownerAssignedAt), 'MMM d, yyyy')}</dd>
          </div>
        ) : null}
        {course.lastOwnershipTransferAt ? (
          <div>
            <dt className="text-muted-foreground">Last transfer</dt>
            <dd>{format(new Date(course.lastOwnershipTransferAt), 'MMM d, yyyy')}</dd>
          </div>
        ) : null}
      </dl>

      {isInstitutionAdmin ? (
        <>
          <AssignCourseOwnerModal
            courseIdOrSlug={course.slug}
            open={assignOpen}
            onOpenChange={setAssignOpen}
          />
          <TransferCourseOwnershipModal
            courseIdOrSlug={course.slug}
            currentOwnerId={course.ownerId}
            open={transferOpen}
            onOpenChange={setTransferOpen}
          />
        </>
      ) : null}
    </div>
  );
}

export function canEditCourse(course: Course, userId?: string | null) {
  return Boolean(userId && course.ownerId === userId);
}
