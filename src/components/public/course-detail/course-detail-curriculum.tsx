'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { CatalogCourseDetail } from '@/types/catalog';
import { formatCatalogDuration } from '@/lib/catalog-utils';

interface CourseDetailCurriculumSectionProps {
  course: CatalogCourseDetail;
}

export function CourseDetailCurriculumSection({ course }: CourseDetailCurriculumSectionProps) {
  if (course.curriculum.length === 0) return null;

  const durationLabel = formatCatalogDuration(course.estimatedHours);

  return (
    <section>
      <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">Course content</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {course.curriculum.length} section{course.curriculum.length === 1 ? '' : 's'}
        {durationLabel !== '—' ? ` • ${durationLabel} total length` : ''}
      </p>

      <Accordion type="multiple" className="border border-border">
        {course.curriculum.map((module, index) => (
          <AccordionItem
            key={module.id}
            value={module.id}
            className="border-b border-border px-4 last:border-b-0"
          >
            <AccordionTrigger className="py-4 text-left hover:no-underline [&>svg]:text-foreground">
              <span className="pr-4 text-sm font-bold text-foreground sm:text-base">
                {index + 1}. {module.title}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {module.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{module.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Module content available after enrollment.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
