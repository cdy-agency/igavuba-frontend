'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessments } from '@/lib/hooks/assessments';
import { useQuery } from '@tanstack/react-query';
import { fetchCourseById } from '@/lib/api/student/courses.api';
import type { Assessment } from '@/lib/types/assessment-unified';
import { FileQuestion, ClipboardList, FileText, Clock } from 'lucide-react';

function AssessmentTypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; icon: typeof FileQuestion; class: string }> = {
    QUIZ: { label: 'Quiz', icon: FileQuestion, class: 'bg-blue-100 text-blue-800' },
    EXAM: { label: 'Exam', icon: ClipboardList, class: 'bg-amber-100 text-amber-800' },
    ASSIGNMENT: { label: 'Assignment', icon: FileText, class: 'bg-green-100 text-green-800' },
  };
  const c = config[type] ?? { label: type, icon: FileQuestion, class: 'bg-gray-100 text-gray-800' };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.class}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export default function CourseAssessmentsPage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  const { data: assessmentsResult, isLoading } = useAssessments(courseId);
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => fetchCourseById(courseId),
    enabled: !!courseId,
  });

  const allAssessments: Assessment[] = assessmentsResult?.ok ? assessmentsResult.data : [];
  const assessments = allAssessments.filter((a) => a.type === 'EXAM');
  const courseTitle = (course as any)?.title ?? 'Course';

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student">Student</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/student/courses/${courseId}/home`}>{courseTitle}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Assessments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold">Exams</h1>
        <p className="text-muted-foreground">
          Course-level exams. Quizzes and assignments are in each module.
        </p>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No exams for this course. Check modules for quizzes and assignments.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assessments.map((a) => (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2">{a.title}</CardTitle>
                    <AssessmentTypeBadge type={a.type} />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  {a.description && <p className="line-clamp-2">{a.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {a.duration != null && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {a.duration} min
                      </span>
                    )}
                    {a.totalMarks != null && (
                      <span>{a.totalMarks} pts</span>
                    )}
                    {a.dueDate && (
                      <span>Due {new Date(a.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-end pt-2">
                  <Button asChild>
                    <Link href={`/student/assessments/${a._id}?courseId=${courseId}`}>
                      {a.type === 'ASSIGNMENT' ? 'Submit' : 'Attempt'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
