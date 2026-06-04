'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormDialog } from '@/components/ui/form-dialog';
import { CreateInstitutionForm } from '@/components/dashboard/institutions/create-institution-form';

export function CreateInstitutionDialog() {
  const [open, setOpen] = useState(false);

  return (
    <FormDialog
      open={open}
      onOpenChange={setOpen}
      title="Create institution"
      description="An invitation email will be sent to the institution admin to complete onboarding."
      trigger={
        <Button className="h-10 gap-2">
          <Plus className="h-4 w-4" />
          Create institution
        </Button>
      }
    >
      <CreateInstitutionForm
        onSuccess={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </FormDialog>
  );
}
