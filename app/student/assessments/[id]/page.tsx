'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-toastify';
import {
  useAssessmentById,
  useStartAttempt,
  useAssessmentQuestions,
  useSubmitAssessment,
} from '@/lib/hooks/assessments';
import type { AssessmentQuestion as AQ, AssessmentAnswerPayload } from '@/lib/types/assessment-unified';
import QuestionForm from '@/components/assessments/QuestionForm';

export default function TakeAssessmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params?.id as string;
  const courseId = searchParams?.get('courseId') ?? '';

  const { data: assessmentRes } = useAssessmentById(id);
  const assessment = assessmentRes?.ok ? assessmentRes.data : null;

  const startAttempt = useStartAttempt();
  const submitAssessment = useSubmitAssessment();

  const [attemptStarted, setAttemptStarted] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AQ[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const [publishResults, setPublishResults] = useState(false);

  // Load questions after attempt started (for quiz/exam)
  const { data: questionsRes, refetch: refetchQuestions } = useAssessmentQuestions(
    attemptStarted && assessment?.type !== 'ASSIGNMENT' ? id : undefined
  );

  useEffect(() => {
    if (!questionsRes?.ok) return;
    const q = questionsRes.data.questions ?? [];
    setQuestions(q);
    if (questionsRes.data.expiresAt) setExpiresAt(questionsRes.data.expiresAt);
  }, [questionsRes]);

  // Timer from expiresAt; auto-submit when time reaches 0 (once)
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (!expiresAt || assessment?.type === 'ASSIGNMENT') return;
    const update = () => {
      const end = new Date(expiresAt).getTime();
      const now = Date.now();
      const left = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeftSeconds(left);
      if (left <= 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        submitAssessment.mutate(
          {
            assessmentId: id,
            answers: Object.entries(answers).map(([questionId, selectedOptions]) => ({
              questionId,
              selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
            })),
          },
          {
            onSuccess: (res) => {
              if (res.ok) {
                setSubmitted(true);
                setResultMessage(res.data.message ?? 'Submitted (time ended).');
                setTotalScore(res.data.totalScore ?? null);
                setPublishResults(res.data.publishResults ?? false);
                toast.success('Auto-submitted');
              }
            },
          }
        );
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [expiresAt, assessment?.type, id, answers]);

  const handleStart = async () => {
    if (!id) return;
    const res = await startAttempt.mutateAsync(id);
    if (res.ok) {
      setAttemptStarted(true);
      if (res.data.expiresAt) setExpiresAt(res.data.expiresAt);
      if (assessment?.type !== 'ASSIGNMENT') refetchQuestions();
      toast.success('Attempt started');
    } else {
      toast.error(res.message ?? 'Failed to start');
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    let payload: AssessmentAnswerPayload[] = [];
    if (assessment?.type === 'ASSIGNMENT') {
      payload = [{ textAnswer: assignmentText || undefined, fileUrl: assignmentFileUrl || undefined }];
    } else {
      payload = Object.entries(answers).map(([questionId, selectedOptions]) => ({
        questionId,
        selectedOptions: Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions],
      }));
    }
    const res = await submitAssessment.mutateAsync({ assessmentId: id, answers: payload });
    if (res.ok) {
      setSubmitted(true);
      setResultMessage(res.data.message ?? 'Submitted.');
      setTotalScore(res.data.totalScore ?? null);
      setPublishResults(res.data.publishResults ?? false);
      toast.success('Submission saved');
    } else {
      toast.error(res.message ?? 'Failed to submit');
    }
  };

  const simpleQuestions = useMemo(
    () =>
      questions.map((q) => ({
        id: q._id,
        type: 'multiple_choice' as const,
        question: q.questionText,
        options: (q.options ?? []).map((o) => (typeof o === 'object' ? o.text : String(o))),
      })),
    [questions]
  );

  const backHref = courseId
    ? `/student/courses/${courseId}/assessments`
    : '/student';

  if (!assessment && assessmentRes !== undefined && !assessmentRes?.ok) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        <p className="text-destructive">Assessment not found.</p>
        <Button asChild variant="link">
          <Link href={backHref}>Back</Link>
        </Button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/student">Student</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={backHref}>{courseId ? 'Assessments' : 'Dashboard'}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{assessment.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card>
          <CardHeader>
            <CardTitle>{assessment.title}</CardTitle>
            {assessment.description && (
              <p className="text-sm text-muted-foreground">{assessment.description}</p>
            )}
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              {assessment.duration != null && <span>{assessment.duration} min</span>}
              {assessment.totalMarks != null && <span>{assessment.totalMarks} pts</span>}
            </div>
          </CardHeader>
        </Card>

        {submitted ? (
          <Card>
            <CardHeader>
              <CardTitle>Submission complete</CardTitle>
              <p className="text-muted-foreground">{resultMessage}</p>
              {totalScore != null && (
                <p className="font-medium">Score: {totalScore} / {assessment.totalMarks ?? '—'}</p>
              )}
              {!publishResults && assessment.type === 'EXAM' && (
                <p className="text-sm text-amber-600">Results will be visible after the instructor publishes them.</p>
              )}
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={backHref}>Back to assessments</Link>
              </Button>
            </CardContent>
          </Card>
        ) : !attemptStarted ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {assessment.type === 'ASSIGNMENT'
                ? 'Submit your work as text or document according to the instructions.'
                : `You have ${assessment.duration ?? '—'} minutes. Questions will be randomized.`}
            </p>
            <Button
              onClick={handleStart}
              disabled={startAttempt.isPending}
            >
              {startAttempt.isPending ? 'Starting...' : assessment.type === 'ASSIGNMENT' ? 'Start & Submit' : 'Start Attempt'}
            </Button>
          </div>
        ) : assessment.type === 'ASSIGNMENT' ? (
          <Card>
            <CardHeader>
              <CardTitle>Your submission</CardTitle>
              <p className="text-sm text-muted-foreground">
                {assessment.assignmentSettings?.submissionType === 'DOCUMENT'
                  ? 'Upload a document (paste URL if your instructor provided upload instructions).'
                  : assessment.assignmentSettings?.submissionType === 'BOTH'
                  ? 'Provide text and/or document URL.'
                  : 'Enter your answer below.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {(assessment.assignmentSettings?.submissionType === 'TEXT' ||
                assessment.assignmentSettings?.submissionType === 'BOTH') && (
                <>
                  <Label>Your answer</Label>
                  <Textarea
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    placeholder="Type your answer..."
                    rows={8}
                    className="resize-y"
                  />
                </>
              )}
              {(assessment.assignmentSettings?.submissionType === 'DOCUMENT' ||
                assessment.assignmentSettings?.submissionType === 'BOTH') && (
                <>
                  <Label>Document URL (if applicable)</Label>
                  <input
                    type="url"
                    value={assignmentFileUrl}
                    onChange={(e) => setAssignmentFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitAssessment.isPending}
              >
                {submitAssessment.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {timeLeftSeconds != null && (
              <div className="text-right text-sm">
                Time left:{' '}
                <span className={timeLeftSeconds < 60 ? 'text-red-600 font-medium' : 'font-medium'}>
                  {Math.floor(timeLeftSeconds / 60)}:{String(timeLeftSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            )}
            {simpleQuestions.length > 0 && (
              <QuestionForm
                questions={simpleQuestions}
                value={answers}
                onChange={setAnswers}
              />
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                disabled={submitAssessment.isPending || timeLeftSeconds === 0}
              >
                {submitAssessment.isPending ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
