'use client';

import { Building2, ShieldCheck, UserRound } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthReady } from '@/hooks/use-auth-ready';
import { useDashboard } from '@/contexts/dashboard-context';
import { UserRole } from '@/types/enum';
import { PersonalProfileForm } from './personal-profile-form';
import { SecurityProfileForm } from './security-profile-form';
import { InstitutionProfileForm } from './institution-profile-form';
import { ProfileSettingsSkeleton } from './profile-settings-skeleton';

export function ProfileSettingsPage() {
  const authReady = useAuthReady();
  const { user, role } = useDashboard();
  const canManageInstitution = role === UserRole.INSTITUTION_ADMIN;

  if (!authReady || !user) {
    return <ProfileSettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Account"
        title="Profile"
        description="Manage your account details, password, and institution profile access."
      />

      <Tabs defaultValue="personal" className="space-y-5">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg border border-border/70 bg-card p-1 shadow-sm sm:w-auto">
          <TabsTrigger value="personal" className="gap-2 rounded-md">
            <UserRound className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 rounded-md">
            <ShieldCheck className="h-4 w-4" />
            Security
          </TabsTrigger>
          {canManageInstitution ? (
            <TabsTrigger value="institution" className="gap-2 rounded-md">
              <Building2 className="h-4 w-4" />
              Institution
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="personal" className="mt-0 focus-visible:outline-none">
          <PersonalProfileForm user={user} />
        </TabsContent>

        <TabsContent value="security" className="mt-0 focus-visible:outline-none">
          <SecurityProfileForm />
        </TabsContent>

        {canManageInstitution ? (
          <TabsContent value="institution" className="mt-0 focus-visible:outline-none">
            <InstitutionProfileForm />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}
