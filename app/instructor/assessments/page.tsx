'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAssessments, useInstructorCourses } from '@/lib/hooks/assessments';
import type { Assessment } from '@/lib/types/assessment-unified';
import { FileQuestion, ClipboardList, FileText } from 'lucide-react';

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; class: string }> = {
    QUIZ: { label: 'Quiz', class: 'bg-blue-100 text-blue-800' },
    EXAM: { label: 'Exam', class: 'bg-amber-100 text-amber-800' },
    ASSIGNMENT: { label: 'Assignment', class: 'bg-green-100 text-green-800' },
  };
  const c = config[type] ?? { label: type, class: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${c.class}`}>
      {c.label}
    </span>
  );
}

export default function InstructorAssessmentsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const { data: courses = [], isLoading: loadingCourses } = useInstructorCourses();
  const { data: assessmentsResult, isLoading } = useAssessments(selectedCourseId || undefined);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const assessments: Assessment[] = assessmentsResult?.ok ? assessmentsResult.data : [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor">Instructor</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Assessments</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold">Assessments</h1>
          <Button asChild>
            <Link href="/instructor/assessments/new">New Assessment</Link>
          </Button>
        </div>

        {loadingCourses ? (
          <Skeleton className="h-10 w-64" />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Course:</span>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c: { _id: string; title: string }) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {!selectedCourseId ? (
          <p className="text-muted-foreground">Select a course to view its assessments.</p>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No assessments in this course. Create one from the button above.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {assessments.map((a) => (
              <Card key={a._id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-lg">{a.title}</CardTitle>
                  <TypeBadge type={a.type} />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  {a.description && <p className="line-clamp-2">{a.description}</p>}
                  {(a as any).module && (
                    <p className="text-xs">Module: {(a as any).module?.title ?? (a as any).module}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {a.duration != null && <span>{a.duration} min</span>}
                    {a.totalMarks != null && <span>{a.totalMarks} pts</span>}
                    {a.publishResults && <span>Results published</span>}
                  </div>
                </CardContent>
                <CardContent className="pt-0 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/assessments/${a._id}`}>Edit / Questions</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/instructor/assessments/${a._id}/submissions`}>Submissions</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
