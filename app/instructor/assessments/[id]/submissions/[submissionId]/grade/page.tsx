'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import { useGradeSubmission, useSubmissionById } from '@/lib/hooks/assessments';

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const submissionId = params?.submissionId as string;

  const { data: submissionResult, isLoading: loading } = useSubmissionById(submissionId);
  const submission = submissionResult?.ok && submissionResult.data ? submissionResult.data : null;

  const initialManualScores = useMemo(() => {
    if (!submission?.answers) return {};
    const initial: Record<string, number> = {};
    submission.answers.forEach((a: { _id: string; manualScore?: number; question?: unknown }) => {
      if (a._id && (a.manualScore != null || a.question)) {
        initial[a._id] = a.manualScore ?? 0;
      }
    });
    return initial;
  }, [submission]);

  const [manualScores, setManualScores] = useState<Record<string, number>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!submission || initializedRef.current) return;
    if (Object.keys(initialManualScores).length > 0) {
      setManualScores(initialManualScores);
      initializedRef.current = true;
    }
  }, [submission, initialManualScores]);

  useEffect(() => {
    initializedRef.current = false;
  }, [submissionId]);

  const gradeSubmission = useGradeSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;
    const payload = {
      manualScores: Object.entries(manualScores).map(([answerId, manualScore]) => ({
        answerId,
        manualScore: Number(manualScore) || 0,
      })),
    };
    const res = await gradeSubmission.mutateAsync({
      submissionId,
      manualScores: payload.manualScores,
    });
    if (res.ok) {
      toast.success('Grading saved');
      router.push(`/instructor/assessments/${id}/submissions`);
    } else {
      toast.error(res.message ?? 'Failed to save');
    }
  };

  if (loading || !submission) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const attempt = submission.attempt as any;
  const student = attempt?.student ?? {};
  const studentName = student.name ?? student.email ?? 'Unknown';
  const answers = submission.answers ?? [];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor">Instructor</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/instructor/assessments">Assessments</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/instructor/assessments/${id}`}>Assessment</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/instructor/assessments/${id}/submissions`}>
                Submissions
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Grade</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-2xl font-semibold">Grade submission</h1>
        <p className="text-muted-foreground">Student: {studentName}</p>
        <p className="text-sm text-muted-foreground">
          Auto score: {submission.autoScore ?? 0} · Manual: {submission.manualScore ?? 0} · Total: {submission.totalScore ?? 0}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {answers.map((answer: any) => {
            const q = answer.question ?? {};
            const isManual = !q.type || q.type === 'ESSAY' || q.type === 'TEXT' || answer.textAnswer != null;
            return (
              <Card key={answer._id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {q.questionText ?? 'Answer'}
                  </CardTitle>
                  {q.marks != null && (
                    <p className="text-sm text-muted-foreground">Max marks: {q.marks}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {answer.textAnswer && (
                    <div className="rounded bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                      {answer.textAnswer}
                    </div>
                  )}
                  {answer.fileUrl && (
                    <p className="text-sm">
                      <a href={answer.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                        View document
                      </a>
                    </p>
                  )}
                  {answer.selectedOptions?.length > 0 && (
                    <p className="text-sm">Selected: {answer.selectedOptions.join(', ')}</p>
                  )}
                  {answer.autoScore != null && (
                    <p className="text-sm text-muted-foreground">Auto score: {answer.autoScore}</p>
                  )}
                  {(isManual || answer.textAnswer || answer.fileUrl) && (
                    <div>
                      <Label>Manual score</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        value={manualScores[answer._id] ?? ''}
                        onChange={(e) =>
                          setManualScores((prev) => ({
                            ...prev,
                            [answer._id]: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-24 mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {answers.length === 0 && (
            <p className="text-muted-foreground">No answers to grade.</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={gradeSubmission.isPending}>
              {gradeSubmission.isPending ? 'Saving...' : 'Save grading'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/instructor/assessments/${id}/submissions`}>Back to submissions</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
