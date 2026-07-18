'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActivateStudent, useVerifyStudentInvitation } from '@/hooks/use-students';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { PROTECTED_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';

const activateStudentSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ActivateStudentFormValues = z.infer<typeof activateStudentSchema>;

export function ActivateStudentForm() {
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
  } = useVerifyStudentInvitation(token, Boolean(token));

  const activateStudent = useActivateStudent();

  const form = useForm<ActivateStudentFormValues>({
    resolver: zodResolver(activateStudentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!invitation) return;

    if (invitation.email) {
      form.setValue('email', invitation.email);
    }
    if (invitation.firstName) {
      form.setValue('firstName', invitation.firstName);
    }
    if (invitation.lastName) {
      form.setValue('lastName', invitation.lastName);
    }
  }, [invitation, form]);

  const onSubmit = async (values: ActivateStudentFormValues) => {
    if (!token) return;

    try {
      const response = await activateStudent.mutateAsync({
        token,
        password: values.password,
      });

      setSession({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      });

      toast.success(response.message || 'Student account activated successfully');
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
        <h1 className="text-2xl font-bold">Activate Student Account</h1>
        <p className="text-sm text-muted-foreground">
          Join {invitation?.institutionName} on the e-learning platform
        </p>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              readOnly
              disabled
              className="bg-muted/50"
              {...form.register('firstName')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              readOnly
              disabled
              className="bg-muted/50"
              {...form.register('lastName')}
            />
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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create your password"
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
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
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
        </div>

        <Button type="submit" className="w-full" disabled={activateStudent.isPending}>
          {activateStudent.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Activate Account
        </Button>
      </form>
    </div>
  );
}
