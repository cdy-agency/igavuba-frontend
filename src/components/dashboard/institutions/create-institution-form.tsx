'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogClose, DialogFooter } from '@/components/ui/dialog';
import { createInstitution } from '@/api/institution.api';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { createInstitutionSchema, type CreateInstitutionFormData } from '@/types';

interface CreateInstitutionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateInstitutionForm({ onSuccess, onCancel }: CreateInstitutionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CreateInstitutionFormData>({
    resolver: zodResolver(createInstitutionSchema),
    defaultValues: {
      name: '',
      adminEmail: '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const response = await createInstitution(values);
      toast.success(
        response.message,
        `Invitation sent to ${values.adminEmail}`,
      );
      form.reset();
      await queryClient.invalidateQueries({ queryKey: ['institutions'] });
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create institution'));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="institution-name">Institution name</Label>
        <div className="relative">
          <Input
            id="institution-name"
            placeholder="Acme Academy"
            className="h-11 pl-10"
            disabled={isSubmitting}
            {...form.register('name')}
          />
          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="institution-admin-email">Admin email</Label>
        <div className="relative">
          <Input
            id="institution-admin-email"
            type="email"
            placeholder="admin@institution.com"
            className="h-11 pl-10"
            disabled={isSubmitting}
            {...form.register('adminEmail')}
          />
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {form.formState.errors.adminEmail && (
          <p className="text-sm text-destructive">{form.formState.errors.adminEmail.message}</p>
        )}
      </div>

      <DialogFooter className="gap-2 pt-2 sm:gap-0">
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create & send invitation'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
