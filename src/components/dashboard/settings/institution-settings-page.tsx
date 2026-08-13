'use client';

import { Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { RoleGuard } from '@/guards/role-guard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  useInstitutionSettings,
  useUpdateInstitutionSettings,
} from '@/hooks/use-institution-settings';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';

function InstitutionSettingsPanel() {
  const authReady = useAuthReady();
  const { role, user, institution } = useDashboard();
  const institutionId = user?.institutionId ?? institution?.id ?? null;
  const canUpdate = role === UserRole.INSTITUTION_ADMIN;
  const canFetchSettings =
    authReady &&
    Boolean(institutionId) &&
    (role === UserRole.INSTITUTION_ADMIN || role === UserRole.SUPER_ADMIN);
  const { data, isPending, isError } = useInstitutionSettings(canFetchSettings);
  const updateSettings = useUpdateInstitutionSettings();

  if (!authReady) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!institutionId) {
    return (
      <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-6 text-sm text-amber-950">
        Institution context is required to view settings. Super admins must operate within an
        institution context before these settings can be loaded.
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load institution settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">Course Publishing</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Control how courses are published in your institution.
          </p>
        </div>

        <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
          <div className="space-y-1 pr-4">
            <Label htmlFor="require-course-approval" className="text-sm font-medium">
              Require Course Approval Before Publishing
            </Label>
            <p className="text-sm leading-relaxed text-muted-foreground">
              When enabled, lecturers must submit courses for review before publishing. When
              disabled, lecturers can publish courses directly.
            </p>
          </div>
          <Switch
            id="require-course-approval"
            size="sm"
            checked={data.requireCourseApproval}
            disabled={!canUpdate || updateSettings.isPending}
            onCheckedChange={(checked) =>
              updateSettings.mutate({ requireCourseApproval: checked })
            }
          />
        </div>

        {!canUpdate ? (
          <p className="mt-3 text-xs text-muted-foreground">
            You have read-only access to these settings.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export function InstitutionSettingsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.INSTITUTION_ADMIN, UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <PageHeader
          badge="Institution"
          title="Settings"
          description="Configure institution-wide policies and defaults."
        />
        <InstitutionSettingsPanel />
      </div>
    </RoleGuard>
  );
}
