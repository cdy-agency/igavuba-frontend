import { CourseBuilderPage } from '@/components/course-builder/course-builder-page';

interface BuilderCoursePageProps {
  params: Promise<{ slug: string }>;
}

export default async function BuilderCoursePage({ params }: BuilderCoursePageProps) {
  const { slug } = await params;
  return <CourseBuilderPage slug={slug} />;
}
