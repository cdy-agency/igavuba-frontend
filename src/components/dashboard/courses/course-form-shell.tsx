'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CourseFormShellProps {
  mode: 'create' | 'edit';
  children: ReactNode;
}

export function CourseFormShell({ mode, children }: CourseFormShellProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <div className="relative flex flex-col items-center gap-1 border-b border-border/60 pb-5 pt-0.5">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="absolute left-0 top-0 h-8 border-border/80 text-[12px] font-medium"
        >
          <Link href="/dashboard/courses">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Courses
          </Link>
        </Button>
        <div className="flex items-center gap-2 px-24">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={2} />
          <h1 className="text-center text-[17px] font-semibold tracking-tight text-foreground sm:text-lg">
            {mode === 'create' ? 'Create New Course' : 'Edit Course'}
          </h1>
        </div>
        <p className="max-w-md px-6 text-center text-[12px] text-muted-foreground/85">
          {mode === 'create'
            ? 'Fill in the details below. Your course will be saved as a draft.'
            : 'Update course information, media, and settings.'}
        </p>
      </div>
      {children}
    </div>
  );
}
