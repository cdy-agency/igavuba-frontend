import CourseDetailClient from '@/components/public/course-detail-client';

interface CourseDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}
