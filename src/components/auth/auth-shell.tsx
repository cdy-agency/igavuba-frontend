'use client';

import type { LucideIcon } from 'lucide-react';

interface AuthShellProps {
  children: React.ReactNode;
  heroLine1: string;
  heroLine2: string;
}

export function AuthShell({ children, heroLine1, heroLine2 }: AuthShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="auth-page-overlay relative hidden bg-cover bg-center bg-no-repeat lg:flex lg:w-1/2">
        <div className="relative z-10 flex h-full flex-col justify-center p-12 xl:p-16">
          <div className="max-w-md space-y-4">
            <h1 className="text-5xl font-bold leading-tight text-white">
              {heroLine1}
              <br />
              <span className="text-4xl font-light">{heroLine2}</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="relative flex w-full items-center justify-center bg-panel px-6 py-10 sm:px-8 lg:w-1/2">
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

export function AuthFormHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-link">{eyebrow}</p>
      <h2 className="text-3xl font-bold tracking-tight text-white">{title}</h2>
      {description ? <p className="text-sm leading-relaxed text-panel-muted">{description}</p> : null}
    </div>
  );
}

export function AuthFieldIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-panel-muted" />
  );
}

export const authInputClassName =
  'h-11 rounded-xl border-panel-border bg-panel-input pl-10 text-white shadow-sm placeholder:text-panel-muted focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary';
