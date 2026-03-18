"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssessmentById,
  usePublishResults,
  useUpdateAssessmentQuestion,
  useAddAssessmentQuestions,
} from "@/lib/hooks/assessments";
import { toast } from "react-toastify";
import type {
  Assessment,
  AssessmentQuestion,
  QuestionOption,
} from "@/lib/types/assessment-unified";

function QuestionCard({
  assessmentId,
  question,
  onOptionsChange,
  updateQuestion,
}: {
  assessmentId: string;
  question: AssessmentQuestion;
  onOptionsChange: () => void;
  updateQuestion: ReturnType<typeof useUpdateAssessmentQuestion>;
}) {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [marks, setMarks] = useState(question.marks);
  const [type, setType] = useState(question.type);
  const [options, setOptions] = useState<QuestionOption[]>(
    question.options ?? [{ text: "", isCorrect: false }],
  );

  useEffect(() => {
    setQuestionText(question.questionText);
    setMarks(question.marks);
    setType(question.type);
    setOptions(
      question.options?.length
        ? question.options
        : [{ text: "", isCorrect: false }],
    );
  }, [
    question._id,
    question.questionText,
    question.marks,
    question.type,
    question.options,
  ]);

  const saveQuestionText = () => {
    if (questionText.trim() === question.questionText) return;
    updateQuestion.mutate(
      {
        assessmentId,
        questionId: question._id,
        payload: { questionText: questionText.trim() },
      },
      { onSuccess: (r) => { if (!r.ok) toast.error(r.message); } },
    );
  };
  const saveMarks = () => {
    if (marks === question.marks) return;
    updateQuestion.mutate(
      { assessmentId, questionId: question._id, payload: { marks } },
      { onSuccess: (r) => { if (!r.ok) toast.error(r.message); } },
    );
  };
  const saveType = (newType: AssessmentQuestion["type"]) => {
    setType(newType);
    updateQuestion.mutate(
      {
        assessmentId,
        questionId: question._id,
        payload: { type: newType },
      },
      { onSuccess: (r) => { if (!r.ok) toast.error(r.message); } },
    );
  };
  const saveOptions = (newOpts: QuestionOption[]) => {
    const valid = newOpts.filter((o) => o.text.trim());
    if (
      valid.length < 2 &&
      (type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT")
    )
      return;
    const correctCount = valid.filter((o) => o.isCorrect).length;
    if (type === "MULTIPLE_CHOICE" && correctCount !== 1) return;
    if (type === "MULTI_SELECT" && correctCount < 1) return;
    updateQuestion.mutate(
      { assessmentId, questionId: question._id, payload: { options: valid } },
      {
        onSuccess: (r) => {
          if (r.ok) onOptionsChange();
          else toast.error(r.message);
        },
      },
    );
  };

  const setOptionText = (i: number, text: string) => {
    const next = options.map((o, j) => (j === i ? { ...o, text } : o));
    setOptions(next);
  };
  const setOptionCorrect = (i: number, isCorrect: boolean) => {
    const next =
      type === "MULTIPLE_CHOICE"
        ? options.map((o, j) => ({ ...o, isCorrect: j === i }))
        : options.map((o, j) => (j === i ? { ...o, isCorrect } : o));
    setOptions(next);
    const valid = next.filter((o) => o.text.trim());
    if (valid.length >= 2) saveOptions(valid);
  };
  const addOption = () => {
    setOptions((prev) => [...prev, { text: "", isCorrect: false }]);
  };
  const applyOptions = () => {
    const valid = options.filter((o) => o.text.trim());
    if (valid.length >= 2) saveOptions(valid);
  };

  const isMcq = type === "MULTIPLE_CHOICE" || type === "MULTI_SELECT";

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs text-muted-foreground">Question</Label>
          <span className="text-xs text-muted-foreground">{marks} pts</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <textarea
          className="w-full rounded-md border px-3 py-2 text-sm"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          onBlur={saveQuestionText}
          rows={2}
          placeholder="Question text"
        />
        <div>
          <Label className="text-xs">Type</Label>
          <select
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            value={type}
            onChange={(e) =>
              saveType(e.target.value as AssessmentQuestion["type"])
            }
          >
            <option value="MULTIPLE_CHOICE">Single choice</option>
            <option value="MULTI_SELECT">Multi-select</option>
          </select>
        </div>
        {isMcq && (
          <div>
            <Label className="text-xs">Options (select correct answer)</Label>
            <div className="mt-2 space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                  {type === "MULTIPLE_CHOICE" ? (
                    <input
                      type="radio"
                      name={`q-${question._id}`}
                      checked={opt.isCorrect}
                      onChange={() => setOptionCorrect(i, true)}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) => setOptionCorrect(i, e.target.checked)}
                    />
                  )}
                  <Input
                    className="flex-1"
                    value={opt.text}
                    onChange={(e) => setOptionText(i, e.target.value)}
                    onBlur={applyOptions}
                    placeholder="Option text"
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                Add option
              </Button>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label className="text-xs">Marks</Label>
          <Input
            type="number"
            min={0}
            className="w-20"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value) || 0)}
            onBlur={saveMarks}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function InstructorAssessmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: res, isLoading } = useAssessmentById(id);
  const publishResults = usePublishResults();
  const updateQuestion = useUpdateAssessmentQuestion();
  const addQuestions = useAddAssessmentQuestions();
  const assessment: Assessment | null = res?.ok ? res.data : null;
  const questions: AssessmentQuestion[] = Array.isArray(
    (assessment as any)?.questions,
  )
    ? (assessment as any).questions
    : [];

  const [, setOptionsChangeCounter] = useState(0);

  const handleAddNewQuestion = () => {
    if (!id || assessment?.type === "ASSIGNMENT") return;
    addQuestions.mutate(
      {
        assessmentId: id,
        questions: [
          {
            questionText: "New question",
            type: "MULTIPLE_CHOICE",
            options: [
              { text: "Option 1", isCorrect: true },
              { text: "Option 2", isCorrect: false },
            ],
            marks: 1,
            order: questions.length,
          },
        ],
      },
      {
        onSuccess: (result) => {
          if (result.ok) toast.success("Question added");
          else toast.error(result.message ?? "Failed to add question");
        },
      },
    );
  };

  const handlePublish = () => {
    if (!id) return;
    publishResults.mutate(id, {
      onSuccess: (result) => {
        if (result.ok) toast.success("Results published");
        else toast.error(result.message ?? "Failed");
      },
    });
  };

  if (!assessment && !isLoading) {
    return (
      <div className="p-4">
        <p className="text-destructive">Assessment not found.</p>
        <Button asChild variant="link">
          <Link href="/instructor/assessments">Back</Link>
        </Button>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const canAddQuestions = assessment.type !== "ASSIGNMENT";

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
              <BreadcrumbLink href="/instructor/assessments">
                Assessments
              </BreadcrumbLink>
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
            <p className="text-sm text-muted-foreground">
              Type: {assessment.type} · {questions.length} question(s) ·{" "}
              {assessment.totalMarks} pts
              {assessment.duration != null && ` · ${assessment.duration} min`}
            </p>
            {assessment.type === "EXAM" && (
              <p className="text-sm">
                Results published: {assessment.publishResults ? "Yes" : "No"}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/instructor/assessments/${id}/submissions`}>
                  View submissions
                </Link>
              </Button>
              {assessment.type === "EXAM" && !assessment.publishResults && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishResults.isPending}
                >
                  Publish results
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {canAddQuestions && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Questions</h2>
              <Button
                onClick={handleAddNewQuestion}
                disabled={addQuestions.isPending}
              >
                {addQuestions.isPending ? "Adding..." : "Add new question"}
              </Button>
            </div>
            <div className="space-y-4">
              {questions.map((q) => (
                <QuestionCard
                  key={q._id}
                  assessmentId={id}
                  question={q}
                  onOptionsChange={() => setOptionsChangeCounter((c) => c + 1)}
                  updateQuestion={updateQuestion}
                />
              ))}
            </div>
          </>
        )}

        {assessment.type === "ASSIGNMENT" && (
          <p className="text-muted-foreground text-sm">
            Assignments do not have questions; students submit text or documents
            as configured.
          </p>
        )}
      </div>
    </div>
  );
}
