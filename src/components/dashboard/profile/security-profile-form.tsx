'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChangePassword } from '@/hooks/use-profile-settings';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/types/auth.schema';
import { ProfileSettingsPanel } from './profile-settings-panel';

interface PasswordInputFieldProps {
  id: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  registration: UseFormRegisterReturn;
  error?: string;
}

function PasswordInputField({
  id,
  label,
  placeholder,
  autoComplete,
  registration,
  error,
}: PasswordInputFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pr-10"
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function SecurityProfileForm() {
  const changePassword = useChangePassword();
  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: ChangePasswordFormData) {
    await changePassword.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    form.reset();
  }

  return (
    <ProfileSettingsPanel
      title="Security Settings"
      description="Update your password and keep your account protected."
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-3">
          <PasswordInputField
            id="current-password"
            label="Current password"
            placeholder="Enter current password"
            autoComplete="current-password"
            registration={form.register('currentPassword')}
            error={form.formState.errors.currentPassword?.message}
          />

          <PasswordInputField
            id="new-password"
            label="New password"
            placeholder="Enter new password"
            autoComplete="new-password"
            registration={form.register('newPassword')}
            error={form.formState.errors.newPassword?.message}
          />

          <PasswordInputField
            id="confirm-password"
            label="Confirm password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            registration={form.register('confirmPassword')}
            error={form.formState.errors.confirmPassword?.message}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={changePassword.isPending}>
            {changePassword.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Update password
          </Button>
        </div>
      </form>
    </ProfileSettingsPanel>
  );
}
