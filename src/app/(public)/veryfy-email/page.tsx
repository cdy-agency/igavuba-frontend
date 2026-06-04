import { Suspense } from 'react';
import Head from 'next/head';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';

function VerifyEmailPageContent() {
  return (
    <>
      <Head>
        <title>Verify Email</title>
        <meta name="description" content="Verify your email address" />
      </Head>

      <div className="min-h-screen flex">
        {/* Left side - Mountain landscape background */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat auth-page-overlay">
          {/* Content overlay */}
          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-panel-foreground h-full">
            <div className="space-y-4 max-w-md">
              <h1 className="text-5xl font-bold leading-tight text-panel-foreground">
                Almost there
                <br />
                <span className="text-4xl font-light">Verify Your Email</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Right side - Verify email form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-panel relative">
          <div className="relative z-10 w-full max-w-md p-8">
            <VerifyEmailForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-panel-foreground">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
