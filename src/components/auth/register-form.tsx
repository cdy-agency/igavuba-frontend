'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowRight, Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSignupMutation } from '@/hooks/use-auth-mutations';
import { getApiErrorMessage } from '@/lib/auth';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from '@/lib/toast';
import { GUEST_ROUTES } from '@/lib/routes';
import type { SignupFormData } from '@/types';
import { signupSchema } from '@/types';

export function RegisterForm() {
  const router = useRouter();
  const { setPendingVerification } = useAuth();
  const signupMutation = useSignupMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await signupMutation.mutateAsync(values);
      setPendingVerification({ email: values.email, userId: response.userId });
      toast.success(response.message, 'Enter the OTP sent to your email');
      router.push(`${GUEST_ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Signup failed'));
    }
  });

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-panel-foreground mb-2">Create an account</h1>
        <p className="text-panel-muted">
          Already have an account?{' '}
          <Link href={GUEST_ROUTES.LOGIN} className="text-link hover:text-link-hover ml-1 underline">
            Sign in here
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-panel-subtle text-sm font-medium">
            Full Name
          </Label>
          <div className="relative">
            <Input
              id="name"
              placeholder="Enter your full name"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
              {...form.register('name')}
            />
            <User className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-panel-muted" />
          </div>
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-panel-subtle text-sm font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
              {...form.register('email')}
            />
            <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-panel-muted" />
          </div>
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-panel-subtle text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your phone number"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg"
              {...form.register('phoneNumber')}
            />
            <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-panel-muted" />
          </div>
          {form.formState.errors.phoneNumber && (
            <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-panel-subtle text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a password"
              className="h-12 bg-panel-input border-panel-border text-panel-foreground placeholder:text-panel-muted focus:border-primary focus:ring-1 focus:ring-primary rounded-lg pr-12"
              {...form.register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-panel-muted hover:text-panel-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary-active text-primary-foreground font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group border-0"
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Creating account...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-panel-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-panel-muted bg-panel">Or</span>
          </div>
        </div>

        <div className="text-center text-sm mt-6">
          <span className="text-panel-muted">
            Already have an account?{' '}
            <Link href={GUEST_ROUTES.LOGIN} className="text-link hover:text-link-hover font-medium">
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
}
