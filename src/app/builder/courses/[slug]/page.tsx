import { notFound } from "next/navigation";

interface BuilderCoursePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BuilderCoursePage({
  params,
}: BuilderCoursePageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  return notFound();
}
