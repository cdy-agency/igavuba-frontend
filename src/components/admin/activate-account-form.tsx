'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Upload,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { completeInvitation, verifyInvitationToken } from '@/api/invitation.api';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { PROTECTED_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';
import {
  activationAccountStep1Schema,
  activationAccountStep2Schema,
  type ActivationAccountStep1FormData,
  type ActivationAccountStep2FormData,
} from '@/types';

export function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const token = searchParams.get('token') ?? '';

  const [step, setStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step1Form = useForm<ActivationAccountStep1FormData>({
    resolver: zodResolver(activationAccountStep1Schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const step2Form = useForm<ActivationAccountStep2FormData>({
    resolver: zodResolver(activationAccountStep2Schema),
    defaultValues: {
      website: '',
      description: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (!token) {
      setVerifyError('Invalid activation link. Please request a new invitation.');
      setIsVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyInvitationToken(token);
        step1Form.setValue('email', result.email);
        setInstitutionName(result.institutionName);
        setVerifyError(null);
      } catch (error) {
        setVerifyError(getApiErrorMessage(error, 'Invalid or expired invitation link'));
      } finally {
        setIsVerifying(false);
      }
    };

    void verify();
  }, [token, step1Form]);

  const onStep1Submit = step1Form.handleSubmit(() => {
    setStep(2);
  });

  const onStep2Submit = step2Form.handleSubmit(async (step2Values) => {
    if (!token) {
      return;
    }

    setIsSubmitting(true);
    try {
      const step1Values = step1Form.getValues();
      const response = await completeInvitation(token, step1Values, step2Values, logoFile);
      setSession(response);
      toast.success(response.message, 'Welcome to your dashboard');
      router.replace(PROTECTED_ROUTES.DASHBOARD);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Activation failed'));
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isVerifying) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Verifying your invitation...</p>
      </div>
    );
  }

  if (verifyError) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-foreground">Unable to activate account</p>
        <p className="mt-2 text-sm text-muted-foreground">{verifyError}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Building2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Activate your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {institutionName ? (
            <>
              Complete setup for <strong>{institutionName}</strong>
            </>
          ) : (
            'Complete your institution administrator setup'
          )}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <span
            className={`h-2 w-12 rounded-full ${step === 1 ? 'bg-primary' : 'bg-muted'}`}
          />
          <span
            className={`h-2 w-12 rounded-full ${step === 2 ? 'bg-primary' : 'bg-muted'}`}
          />
        </div>
      </div>

      {step === 1 ? (
        <form
          onSubmit={onStep1Submit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                readOnly
                className="h-11 bg-muted pr-10"
                {...step1Form.register('email')}
              />
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <Input
                id="name"
                placeholder="Enter your full name"
                className="h-11 pr-10"
                {...step1Form.register('name')}
              />
              <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            {step1Form.formState.errors.name && (
              <p className="text-sm text-destructive">{step1Form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="h-11 pr-10"
                {...step1Form.register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {step1Form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className="h-11 pr-10"
                {...step1Form.register('confirmPassword')}
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
            {step1Form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {step1Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      ) : (
        <form
          onSubmit={onStep2Submit}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="logo">Institution logo (optional)</Label>
            <div className="flex items-center gap-3">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="h-11"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setLogoFile(file);
                }}
              />
              <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              placeholder="https://your-institution.com"
              className="h-11"
              {...step2Form.register('website')}
            />
            {step2Form.formState.errors.website && (
              <p className="text-sm text-destructive">{step2Form.formState.errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Institution description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your institution"
              rows={3}
              {...step2Form.register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact phone (optional)</Label>
            <Input
              id="contactPhone"
              placeholder="+250 788 000 000"
              className="h-11"
              {...step2Form.register('contactPhone')}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              onClick={() => setStep(1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button type="submit" className="h-11 flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Complete setup'
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
