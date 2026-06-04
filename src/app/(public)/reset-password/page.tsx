import { Suspense } from 'react';
import Head from 'next/head';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

function ResetPasswordPageContent() {
  return (
    <>
      <Head>
        <title>Reset Password</title>
        <meta name="description" content="Set a new password for your account" />
      </Head>

      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat auth-page-overlay">
          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-panel-foreground h-full">
            <div className="space-y-4 max-w-md">
              <h1 className="text-5xl font-bold leading-tight text-panel-foreground">
                Set a new password
                <br />
                <span className="text-4xl font-light">Secure your account</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-panel relative">
          <div className="relative z-10 w-full max-w-md p-8">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-panel-foreground">Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}
