'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { uploadImage } from '@/api/upload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileSchema, type ProfileFormData } from '@/types/auth.schema';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import type { AuthUser } from '@/types';
import { useUpdateProfile } from '@/hooks/use-profile-settings';
import { ProfileSettingsPanel } from './profile-settings-panel';

interface PersonalProfileFormProps {
  user: AuthUser;
}

function getInitials(name?: string, email?: string) {
  if (name?.trim()) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  return email?.slice(0, 2).toUpperCase() ?? 'U';
}

export function PersonalProfileForm({ user }: PersonalProfileFormProps) {
  const updateProfile = useUpdateProfile();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name ?? '',
      phoneNumber: user.phoneNumber ?? '',
      profileImage: user.profileImage ?? '',
    },
  });

  const imageUrl = form.watch('profileImage');
  const initials = useMemo(() => getInitials(form.watch('name'), user.email), [form, user.email]);

  useEffect(() => {
    form.reset({
      name: user.name ?? '',
      phoneNumber: user.phoneNumber ?? '',
      profileImage: user.profileImage ?? '',
    });
  }, [form, user]);

  async function onSubmit(values: ProfileFormData) {
    await updateProfile.mutateAsync({
      name: values.name.trim(),
      phoneNumber: values.phoneNumber?.trim() || undefined,
      profileImage: values.profileImage?.trim() || undefined,
    });
  }

  async function handleImageChange(file?: File) {
    if (!file) {
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadImage(file);
      form.setValue('profileImage', uploadedUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to upload profile image'));
    } finally {
      setIsUploadingImage(false);
    }
  }

  const isSaving = updateProfile.isPending;
  const isBusy = isSaving || isUploadingImage;

  return (
    <ProfileSettingsPanel
      title="Profile Information"
      description="Keep your personal profile details accurate across the platform."
    >
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 border border-primary-muted bg-primary-subtle">
            {imageUrl ? <AvatarImage src={imageUrl} alt={user.name || user.email} /> : null}
            <AvatarFallback className="bg-primary-subtle text-lg font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label htmlFor="profile-image" className="text-sm font-medium">
              Profile photo
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              <Input
                id="profile-image"
                type="file"
                accept="image/*"
                className="max-w-xs"
                placeholder="Upload profile photo"
                disabled={isUploadingImage}
                onChange={(event) => void handleImageChange(event.target.files?.[0])}
              />
              {isUploadingImage ? (
                <span className="inline-flex items-center gap-2 text-xs font-medium text-primary">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading image...
                </span>
              ) : (
                <Upload className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG, PNG, or GIF image.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input id="profile-name" placeholder="Jean Uwimana" {...form.register('name')} />
            {form.formState.errors.name ? (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-phone">Phone number</Label>
            <Input
              id="profile-phone"
              placeholder="+250788888888"
              {...form.register('phoneNumber')}
            />
            {form.formState.errors.phoneNumber ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.phoneNumber.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email address</Label>
          <Input
            id="profile-email"
            value={user.email}
            placeholder="name@example.com"
            disabled
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isBusy}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save changes
          </Button>
        </div>
      </form>
    </ProfileSettingsPanel>
  );
}
