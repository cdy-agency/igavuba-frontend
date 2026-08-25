'use client';

import { RoleGuard } from '@/guards/role-guard';
import { PageHeader } from '@/components/dashboard/page-header';
import { EventsTable } from '@/components/dashboard/events/events-table';
import { UserRole } from '@/types/enum';

const EVENTS_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.INSTITUTION_ADMIN,
  UserRole.LECTURER,
  UserRole.LEARNER,
];

export function EventsPage() {
  return (
    <RoleGuard allowedRoles={EVENTS_ROLES}>
      <div className="space-y-8">
        <PageHeader
          title="Events"
          description="Create and manage course, institution, and personal scheduled events."
        />
        <EventsTable />
      </div>
    </RoleGuard>
  );
}
