import { Suspense } from 'react';
import { ActivateAccountForm } from '@/components/admin/activate-account-form';

export default function ActivateAccountPage() {
  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        }
      >
        <ActivateAccountForm />
      </Suspense>
    </div>
  );
}
