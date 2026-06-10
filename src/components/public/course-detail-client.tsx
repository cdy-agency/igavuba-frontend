'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import LandingHeader from '@/components/landing-pages/header';
import { LandingFooter } from '@/components/landing-pages/landingFooter';
import { CourseDetailCurriculumSection } from '@/components/public/course-detail/course-detail-curriculum';
import { CourseDetailHero } from '@/components/public/course-detail/course-detail-hero';
import {
  CourseDetailInstitutionSection,
  CourseDetailInstructorSection,
} from '@/components/public/course-detail/course-detail-people';
import { CourseDetailRelatedSection } from '@/components/public/course-detail/course-detail-related';
import {
  CourseDetailDescriptionSection,
  CourseDetailLearnSection,
  CourseDetailToolsSection,
} from '@/components/public/course-detail/course-detail-sections';
import { CourseDetailSidebar } from '@/components/public/course-detail/course-detail-sidebar';
import { useCatalogCourseDetail, useRelatedCatalogCourses } from '@/hooks/use-catalog';

interface CourseDetailClientProps {
  slug: string;
}

function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <div className="bg-[#0c1f42] py-16">
        <div className="mx-auto max-w-7xl animate-pulse space-y-4 px-4">
          <div className="h-4 w-40 bg-white/10" />
          <div className="h-10 w-2/3 bg-white/10" />
          <div className="h-5 w-1/2 bg-white/10" />
        </div>
      </div>
      <div className="flex min-h-[20rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      <LandingFooter />
    </div>
  );
}

export default function CourseDetailClient({ slug }: CourseDetailClientProps) {
  const { data: course, isPending, isError } = useCatalogCourseDetail(slug);
  const { data: relatedCourses = [] } = useRelatedCatalogCourses(slug, Boolean(course));

  if (isPending) {
    return <CourseDetailLoading />;
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Course not found</h1>
          <p className="mt-2 text-muted-foreground">
            This course may have been removed or is not publicly available.
          </p>
          <Link href="/courses" className="mt-6 inline-block text-primary hover:underline">
            Back to courses
          </Link>
        </div>
        <LandingFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <CourseDetailHero course={course} />

      <div className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <main className="order-2 space-y-10 py-8 lg:order-1 lg:py-10">
            <CourseDetailCurriculumSection course={course} />
            <CourseDetailDescriptionSection course={course} />
            <CourseDetailLearnSection course={course} />
            <CourseDetailToolsSection course={course} />
            <CourseDetailInstructorSection course={course} />
            <CourseDetailInstitutionSection course={course} />
          </main>

          <CourseDetailSidebar course={course} />
        </div>
      </div>

      <CourseDetailRelatedSection courses={relatedCourses} />

      <LandingFooter />
    </div>
  );
}
