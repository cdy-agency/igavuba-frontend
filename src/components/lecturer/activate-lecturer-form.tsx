'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Building2, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useActivateLecturer,
  useVerifyLecturerInvitation,
} from '@/hooks/use-lecturers';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { PROTECTED_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';

const activateLecturerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().email(),
    phoneNumber: z.string().trim().max(30).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ActivateLecturerFormValues = z.infer<typeof activateLecturerSchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}

export function ActivateLecturerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const token = searchParams.get('token') ?? '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    data: invitation,
    isPending: isVerifying,
    isError: verifyFailed,
    error: verifyError,
  } = useVerifyLecturerInvitation(token, Boolean(token));

  const activateLecturer = useActivateLecturer();

  const form = useForm<ActivateLecturerFormValues>({
    resolver: zodResolver(activateLecturerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { errors } = form.formState;

  useEffect(() => {
    if (invitation?.email) {
      form.setValue('email', invitation.email);
    }
  }, [invitation, form]);

  const onSubmit = async (values: ActivateLecturerFormValues) => {
    if (!token) return;

    try {
      const response = await activateLecturer.mutateAsync({
        token,
        firstName: values.firstName,
        lastName: values.lastName,
        password: values.password,
        phoneNumber: values.phoneNumber?.trim() || undefined,
      });

      setSession({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      });

      toast.success(response.message || 'Lecturer activated successfully');
      router.push(PROTECTED_ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to activate account.'));
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-lg border bg-card p-6 text-center text-sm text-destructive">
        Invalid activation link. Please request a new invitation.
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (verifyFailed) {
    return (
      <div className="mx-auto max-w-md rounded-lg border bg-card p-6 text-center text-sm text-destructive">
        {getApiErrorMessage(verifyError, 'Invalid or expired invitation link.')}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-sm">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Activate Lecturer Account</h1>
        <p className="text-sm text-muted-foreground">
          Join {invitation?.institutionName} on the e-learning platform
        </p>
      </div>

      {invitation?.department ? (
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>
            Department:{' '}
            <span className="font-medium text-foreground">{invitation.department.name}</span>
          </span>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="e.g. Jean"
              autoComplete="given-name"
              {...form.register('firstName')}
            />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="e.g. Mukamana"
              autoComplete="family-name"
              {...form.register('lastName')}
            />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            readOnly
            disabled
            className="bg-muted/50"
            {...form.register('email')}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber" className="inline-flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            Phone number
            <span className="text-xs font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="e.g. +250 788 000 000"
            autoComplete="tel"
            {...form.register('phoneNumber')}
          />
          <FieldError message={errors.phoneNumber?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create your password"
              autoComplete="new-password"
              {...form.register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowConfirmPassword((value) => !value)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={activateLecturer.isPending}>
          {activateLecturer.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Activate Account
        </Button>
      </form>
    </div>
  );
}
