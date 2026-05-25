import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';

function VerifyEmailPageContent() {
  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_28%),linear-gradient(135deg,_#0f172a_0%,_#0b1f3a_42%,_#0a2540_100%)]">
      <div
        className="hidden lg:flex lg:w-[48%] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(59,130,246,0.28),_transparent_25%),radial-gradient(circle_at_80%_30%,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_50%_80%,_rgba(14,165,233,0.14),_transparent_26%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-16 text-white">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-cyan-300" />
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-blue-100/80">
              E-Learning Verification
            </p>
          </div>

          <div className="max-w-xl">
            <h1 className="text-6xl font-semibold leading-[1.05] text-white">
              One final check before you enter the platform
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-blue-100/75">
              Use the verification code from your inbox to activate your account and continue into
              your learning workspace.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Fast verification</p>
                <p className="mt-1 text-sm text-blue-100/70">
                  6-digit OTP delivery with instant resend support.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Secure access</p>
                <p className="mt-1 text-sm text-blue-100/70">
                  Email confirmation protects sign-up and confirms account ownership.
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-blue-100/55">
            Trusted learning access for students, instructors, and institutions.
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center px-6 py-10 lg:w-[52%] lg:px-10">
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_30%)]" />
        <div className="relative z-10 w-full max-w-2xl">
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading...</div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}
