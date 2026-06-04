import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import Head from 'next/head';

export default function ForgotPasswordPage() {
  return (
    <>
      <Head>
        <title>Forgot Password</title>
        <meta name="description" content="Reset your account password" />
      </Head>

      <div className="min-h-screen flex">
        <div className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center bg-no-repeat auth-page-overlay">
          <div className="relative z-10 flex flex-col justify-center items-start p-16 text-panel-foreground h-full">
            <div className="space-y-4 max-w-md">
              <h1 className="text-5xl font-bold leading-tight text-panel-foreground">
                Forgot your password?
                <br />
                <span className="text-4xl font-light">We&apos;ve got you</span>
              </h1>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center bg-panel relative">
          <div className="relative z-10 w-full max-w-md p-8">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}
