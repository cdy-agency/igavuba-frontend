'use client';

import type { ReactNode } from 'react';

interface ProfileSettingsPanelProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ProfileSettingsPanel({
  title,
  description,
  children,
}: ProfileSettingsPanelProps) {
  return (
    <section className="rounded-lg border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
