'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Mail, Trash2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  useInstitutionDetail,
  useInviteInstitutionAdmin,
  useRemoveInstitutionAdmin,
  useUpdateInstitution,
} from '@/hooks/use-admin-tables';
import { uploadImage } from '@/api/upload';
import { getUserStatusClassName, getUserStatusLabel } from '@/lib/status-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { InstitutionAdminSummary } from '@/types/admin';
import { DashboardActionIconButton } from '@/components/dashboard/dashboard-action-icon-button';

interface EditInstitutionModalProps {
  institutionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInstitutionModal({
  institutionId,
  open,
  onOpenChange,
}: EditInstitutionModalProps) {
  const { data: institution, isPending } = useInstitutionDetail(
    institutionId ?? '',
    open && Boolean(institutionId),
  );
  const updateInstitution = useUpdateInstitution(institutionId ?? '');
  const inviteAdmin = useInviteInstitutionAdmin(institutionId ?? '');
  const removeAdmin = useRemoveInstitutionAdmin(institutionId ?? '');

  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [adminToRemove, setAdminToRemove] = useState<InstitutionAdminSummary | null>(null);

  useEffect(() => {
    if (!institution || !open) return;
    setName(institution.name);
    setAbbreviation(institution.abbreviation ?? '');
    setLogo(institution.logo);
    setLogoFile(null);
    setAdminName('');
    setAdminEmail('');
    setActiveTab('details');
    setAdminToRemove(null);
  }, [institution, open]);

  const handleSaveDetails = async () => {
    if (!institutionId) return;

    let nextLogo = logo;
    if (logoFile) {
      nextLogo = await uploadImage(logoFile);
    }

    await updateInstitution.mutateAsync({
      name: name.trim(),
      abbreviation: abbreviation.trim(),
      logo: nextLogo ?? undefined,
    });
    onOpenChange(false);
  };

  const handleInviteAdmin = async () => {
    if (!adminEmail.trim()) return;

    await inviteAdmin.mutateAsync({
      ...(adminName.trim() ? { name: adminName.trim() } : {}),
      email: adminEmail.trim(),
    });

    setAdminName('');
    setAdminEmail('');
  };

  const handleRemoveAdmin = async () => {
    if (!adminToRemove) return;

    await removeAdmin.mutateAsync(adminToRemove.id);
    setAdminToRemove(null);
  };

  const isSaving = updateInstitution.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 border-b px-6 py-5 pr-12">
          <DialogTitle>Edit institution</DialogTitle>
          <DialogDescription>Update the institution details.</DialogDescription>
        </DialogHeader>

        {isPending || !institution ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-6 mt-4 h-auto w-auto justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="admins"
                className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Admins
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="details"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5 focus-visible:outline-none"
            >
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="institution-edit-name">Institution name *</Label>
                  <Input
                    id="institution-edit-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Gisenyi Institute"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="institution-edit-abbreviation">Abbreviation *</Label>
                  <Input
                    id="institution-edit-abbreviation"
                    value={abbreviation}
                    onChange={(event) => setAbbreviation(event.target.value)}
                    placeholder="GIS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution-edit-logo">Logo (optional)</Label>
                  <Input
                    id="institution-edit-logo"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setLogoFile(file);
                    }}
                  />
                  {(logoFile || logo) && (
                    <div className="flex items-center gap-3 rounded-md border bg-muted/20 p-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-background">
                        <Image
                          src={logoFile ? URL.createObjectURL(logoFile) : logo!}
                          alt="Institution logo preview"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {logoFile ? 'New logo selected' : 'Current logo'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="admins"
              className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5 focus-visible:outline-none"
            >
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/15 p-4">
                  <h3 className="mb-3 text-sm font-semibold">Add admin</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      value={adminName}
                      onChange={(event) => setAdminName(event.target.value)}
                      placeholder="Full name (optional)"
                    />
                    <Input
                      type="email"
                      value={adminEmail}
                      onChange={(event) => setAdminEmail(event.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                  <Button
                    type="button"
                    className="mt-3"
                    disabled={inviteAdmin.isPending || !adminEmail.trim()}
                    onClick={() => void handleInviteAdmin()}
                  >
                    {inviteAdmin.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Add admin
                  </Button>
                </div>

                <div className="space-y-3">
                  {institution.users.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No admins assigned yet.</p>
                  ) : (
                    institution.users.map((admin: InstitutionAdminSummary) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {admin.name ?? 'Pending onboarding'}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            {admin.email}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge
                            variant="outline"
                            className={getUserStatusClassName(admin.status)}
                          >
                            {getUserStatusLabel(admin.status)}
                          </Badge>
                          <DashboardActionIconButton
                            label="Remove admin"
                            icon={Trash2}
                            variant="destructive"
                            disabled={removeAdmin.isPending}
                            onClick={() => setAdminToRemove(admin)}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            {activeTab === 'details' ? (
              <DialogFooter className="shrink-0 border-t px-6 py-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isSaving || !name.trim() || !abbreviation.trim()}
                  onClick={() =>
                    void handleSaveDetails().catch((error) => {
                      toast.error(getApiErrorMessage(error, 'Failed to save institution'));
                    })
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating institution...
                    </>
                  ) : (
                    'Update institution'
                  )}
                </Button>
              </DialogFooter>
            ) : null}
          </Tabs>
        )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(adminToRemove)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removeAdmin.isPending) {
            setAdminToRemove(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove institution admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-medium text-foreground">
                {adminToRemove?.name || adminToRemove?.email}
              </span>{' '}
              from this institution? This will revoke their institution admin access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeAdmin.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeAdmin.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleRemoveAdmin();
              }}
            >
              {removeAdmin.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Remove admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
