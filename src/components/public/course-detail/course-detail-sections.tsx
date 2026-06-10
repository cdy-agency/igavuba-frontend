'use client';

import { Check } from 'lucide-react';
import type { CatalogCourseDetail } from '@/types/catalog';

interface CourseDetailLearnSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailLearnSection({ course }: CourseDetailLearnSectionProps) {
  if (course.skills.length === 0) return null;

  return (
    <section className="border border-border bg-background p-6 sm:p-8">
      <h2 className="mb-5 text-xl font-bold text-foreground sm:text-2xl">What you&apos;ll learn</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {course.skills.map((skill) => (
          <li key={skill} className="flex items-start gap-3 text-sm text-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={2.5} />
            <span>{skill}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

interface CourseDetailToolsSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailToolsSection({ course }: CourseDetailToolsSectionProps) {
  if (course.tools.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">
        Tools &amp; technologies
      </h2>
      <div className="flex flex-wrap gap-2">
        {course.tools.map((tool) => (
          <span
            key={tool}
            className="border border-border bg-muted/30 px-3 py-1.5 text-sm font-medium text-foreground"
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
}

interface CourseDetailDescriptionSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailDescriptionSection({ course }: CourseDetailDescriptionSectionProps) {
  if (!course.description) return null;

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold text-foreground sm:text-2xl">About this course</h2>
      <div
        className="prose prose-sm max-w-none text-foreground prose-headings:font-bold prose-p:text-muted-foreground"
        dangerouslySetInnerHTML={{ __html: course.description }}
      />
    </section>
  );
}
