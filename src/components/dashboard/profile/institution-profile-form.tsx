'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Loader2, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { uploadImage } from '@/api/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useCurrentInstitutionProfile,
  useUpdateCurrentInstitutionProfile,
} from '@/hooks/use-profile-settings';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import {
  institutionProfileSchema,
  type InstitutionProfileFormData,
} from '@/types/auth.schema';
import { ProfileSettingsPanel } from './profile-settings-panel';
import { ProfileSettingsSkeleton } from './profile-settings-skeleton';

export function InstitutionProfileForm() {
  const { data: institution, isPending, isError } = useCurrentInstitutionProfile();
  const updateInstitution = useUpdateCurrentInstitutionProfile();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const form = useForm<InstitutionProfileFormData>({
    resolver: zodResolver(institutionProfileSchema),
    defaultValues: {
      name: '',
      abbreviation: '',
      website: '',
      contactPhone: '',
      logo: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!institution) {
      return;
    }

    form.reset({
      name: institution.name ?? '',
      abbreviation: institution.abbreviation ?? '',
      website: institution.website ?? '',
      contactPhone: institution.contactPhone ?? '',
      logo: institution.logo ?? '',
      description: institution.description ?? '',
    });
  }, [form, institution]);

  async function onSubmit(values: InstitutionProfileFormData) {
    await updateInstitution.mutateAsync({
      name: values.name.trim(),
      abbreviation: values.abbreviation.trim(),
      website: values.website?.trim() || undefined,
      contactPhone: values.contactPhone?.trim() || undefined,
      logo: values.logo?.trim() || undefined,
      description: values.description?.trim() || undefined,
    });
  }

  async function handleLogoChange(file?: File) {
    if (!file) {
      return;
    }

    setIsUploadingLogo(true);
    try {
      const uploadedUrl = await uploadImage(file);
      form.setValue('logo', uploadedUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload institution logo'));
    } finally {
      setIsUploadingLogo(false);
    }
  }

  if (isPending) {
    return <ProfileSettingsSkeleton />;
  }

  if (isError || !institution) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load institution profile.
      </div>
    );
  }

  return (
    <ProfileSettingsPanel
      title="Institution Profile"
      description="Manage the public institution details connected to your admin account."
    >
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary-muted bg-primary-subtle">
            {form.watch('logo') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.watch('logo')}
                alt={institution.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution-logo">Institution logo</Label>
            <Input
              id="institution-logo"
              type="file"
              accept="image/*"
              className="max-w-xs"
              placeholder="Upload institution logo"
              disabled={isUploadingLogo}
              onChange={(event) => void handleLogoChange(event.target.files?.[0])}
            />
            {isUploadingLogo ? (
              <p className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading image...
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This appears with institution branding.
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="institution-name">Institution name</Label>
            <Input
              id="institution-name"
              placeholder="Gisenyi Institute"
              {...form.register('name')}
            />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution-abbreviation">Abbreviation</Label>
            <Input
              id="institution-abbreviation"
              placeholder="GIS"
              {...form.register('abbreviation')}
            />
            {form.formState.errors.abbreviation ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.abbreviation.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution-website">Website</Label>
            <Input
              id="institution-website"
              placeholder="https://example.edu.rw"
              {...form.register('website')}
            />
            {form.formState.errors.website ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.website.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="institution-phone">Contact phone</Label>
            <Input
              id="institution-phone"
              placeholder="+250788888888"
              {...form.register('contactPhone')}
            />
            {form.formState.errors.contactPhone ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.contactPhone.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="institution-description">Description</Label>
          <Textarea
            id="institution-description"
            rows={5}
            placeholder="Describe your institution."
            {...form.register('description')}
          />
          {form.formState.errors.description ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateInstitution.isPending || isUploadingLogo}>
            {updateInstitution.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save institution
          </Button>
        </div>
      </form>
    </ProfileSettingsPanel>
  );
}
