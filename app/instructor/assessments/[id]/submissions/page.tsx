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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessmentById, useAssessmentSubmissions } from '@/lib/hooks/assessments';

export default function AssessmentSubmissionsPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: assessmentRes } = useAssessmentById(id);
  const { data: submissionsRes, isLoading } = useAssessmentSubmissions(id);

  const assessment = assessmentRes?.ok ? assessmentRes.data : null;
  const submissions = submissionsRes?.ok ? submissionsRes.data : [];
  const list = Array.isArray(submissions) ? submissions : [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor">Instructor</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor/assessments">Assessments</BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbSeparator />
            <BreadcrumbItem />
              <BreadcrumbLink href={`/instructor/assessments/${id}`}>
                {assessment?.title ?? 'Assessment'}
              </BreadcrumbLink>
            <BreadcrumbSeparator />
            <BreadcrumbSeparator />
            <BreadcrumbItem />
              <BreadcrumbPage>Submissions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold">Submissions</h1>
        {assessment && (
          <p className="text-muted-foreground">{assessment.title}</p>
        )}

        {isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : list.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No submissions yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {list.map((sub: any) => {
              const attempt = sub.attempt ?? {};
              const student = attempt.student ?? {};
              const studentName = student.name ?? student.email ?? 'Unknown';
              return (
                <Card key={sub._id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{studentName}</p>
                      <p className="text-sm text-muted-foreground">
                        Score: {sub.totalScore ?? 0} · {sub.isGraded ? 'Graded' : 'Pending'}
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/instructor/assessments/${id}/submissions/${sub._id}/grade`}>
                        {sub.isGraded ? 'View / Re-grade' : 'Grade'}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Button variant="outline" asChild>
          <Link href={`/instructor/assessments/${id}`}>Back to assessment</Link>
        </Button>
      </div>
    </div>
  );
}
