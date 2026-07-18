'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ActivateStudentForm } from '@/components/student/activate-student-form';

export default function ActivateStudentAccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ActivateStudentForm />
      </Suspense>
    </div>
  );
}
