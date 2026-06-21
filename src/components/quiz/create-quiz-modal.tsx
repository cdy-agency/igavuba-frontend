'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { FormDialog } from '@/components/ui/form-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  QuizQuestionBuilder,
  createInitialDraftQuestions,
  mapDraftQuestionsToPayload,
  validateDraftQuestions,
} from '@/components/quiz/quiz-question-builder';
import { QuizManagedQuestionBuilder } from '@/components/quiz/quiz-managed-question-builder';
import { createQuizContent } from '@/api/content.api';
import { persistQuizQuestions, updateQuiz } from '@/api/quiz.api';
import { getCourseModules } from '@/api/module.api';
import { getCourses } from '@/api/course.api';
import type { DraftQuestionValues } from '@/schema/question.schema';
import { quizInfoSchema, quizSettingsFormSchema } from '@/schema/quiz.schema';
import { useQuizDetail } from '@/hooks/use-quiz';
import { defaultQuizSettings } from '@/lib/quiz-utils';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

const STEPS = ['Quiz Information', 'Quiz Settings', 'Question Builder'] as const;

interface CreateQuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId?: string | null;
  moduleTitle?: string;
  courseId?: string | null;
  quizId?: string | null;
  onSuccess?: (payload: { contentId: string; quizId: string }) => void;
}

export function CreateQuizModal({
  open,
  onOpenChange,
  moduleId: presetModuleId,
  moduleTitle,
  courseId: presetCourseId,
  quizId,
  onSuccess,
}: CreateQuizModalProps) {
  const isEditMode = Boolean(quizId);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState(presetCourseId ?? '');
  const [moduleId, setModuleId] = useState(presetModuleId ?? '');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');
  const [settings, setSettings] = useState(defaultQuizSettings());
  const [questions, setQuestions] = useState<DraftQuestionValues[]>(createInitialDraftQuestions);
  const [stepError, setStepError] = useState<string | null>(null);

  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [modules, setModules] = useState<Array<{ id: string; title: string }>>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);

  const { data: quizDetail, isPending: isLoadingQuiz } = useQuizDetail(quizId ?? '', open && isEditMode);

  const lockModuleSelection = Boolean(presetModuleId);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setStepError(null);

    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setCourseId(presetCourseId ?? '');
      setModuleId(presetModuleId ?? '');
      setPassingScore(70);
      setMaxAttempts(1);
      setTimeLimitMinutes('');
      setSettings(defaultQuizSettings());
      setQuestions(createInitialDraftQuestions());
    }
  }, [open, isEditMode, presetCourseId, presetModuleId]);

  useEffect(() => {
    if (!quizDetail || !isEditMode) return;
    setTitle(quizDetail.assessment.title);
    setDescription(quizDetail.assessment.description ?? '');
    setPassingScore(quizDetail.passingScore);
    setMaxAttempts(quizDetail.maxAttempts);
    setTimeLimitMinutes(
      quizDetail.timeLimitMinutes ? String(quizDetail.timeLimitMinutes) : '',
    );
    setSettings(quizDetail.assessment.settings ?? defaultQuizSettings());
  }, [quizDetail, isEditMode]);

  useEffect(() => {
    if (!open || lockModuleSelection || isEditMode) return;

    setIsLoadingCourses(true);
    getCourses({ page: 1, limit: 100 })
      .then((response) => {
        setCourses(response.data.map((course) => ({ id: course.id, title: course.title })));
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, 'Unable to load courses.'));
      })
      .finally(() => setIsLoadingCourses(false));
  }, [open, lockModuleSelection, isEditMode]);

  useEffect(() => {
    if (!open || lockModuleSelection || !courseId || isEditMode) {
      setModules([]);
      return;
    }

    setIsLoadingModules(true);
    getCourseModules(courseId)
      .then((response) => {
        setModules(response.map((courseModule) => ({ id: courseModule.id, title: courseModule.title })));
      })
      .catch((error) => {
        toast.error(getApiErrorMessage(error, 'Unable to load modules.'));
      })
      .finally(() => setIsLoadingModules(false));
  }, [open, lockModuleSelection, courseId, isEditMode]);

  const resolvedModuleTitle = useMemo(() => {
    if (moduleTitle) return moduleTitle;
    return modules.find((courseModule) => courseModule.id === moduleId)?.title ?? 'Selected module';
  }, [moduleTitle, modules, moduleId]);

  const validateStep = (currentStep: number) => {
    if (currentStep === 0) {
      const result = quizInfoSchema.safeParse({
        title,
        description,
        moduleId: lockModuleSelection ? presetModuleId ?? moduleId : moduleId,
        courseId: lockModuleSelection ? presetCourseId ?? courseId : courseId,
      });

      if (!result.success) {
        setStepError(result.error.issues[0]?.message ?? 'Invalid quiz information');
        return false;
      }

      if (!lockModuleSelection && !isEditMode && !moduleId) {
        setStepError('Module is required');
        return false;
      }
    }

    if (currentStep === 1) {
      const result = quizSettingsFormSchema.safeParse({
        passingScore,
        maxAttempts,
        timeLimitMinutes,
        settings,
      });

      if (!result.success) {
        setStepError(result.error.issues[0]?.message ?? 'Invalid quiz settings');
        return false;
      }
    }

    if (currentStep === 2 && !isEditMode) {
      const result = validateDraftQuestions(questions);
      if (!result.success) {
        setStepError(result.message);
        return false;
      }
    }

    setStepError(null);
    return true;
  };

  const buildSettingsPayload = () => ({
    title: title.trim(),
    description: description.trim() || undefined,
    passingScore,
    maxAttempts,
    timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,
    settings,
  });

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (isEditMode && quizId && step < 2) {
      try {
        setIsSubmitting(true);
        await updateQuiz(quizId, buildSettingsPayload());
        if (step === 1) {
          toast.success('Quiz updated successfully');
        }
        setStep((current) => current + 1);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to update quiz.'));
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    if (isEditMode) {
      onOpenChange(false);
      return;
    }

    const targetModuleId = presetModuleId ?? moduleId;
    if (!targetModuleId) {
      setStepError('Module is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const quizPayload = {
        ...buildSettingsPayload(),
        isPublished: true,
      };

      const moduleResponse = await createQuizContent(targetModuleId, quizPayload);
      const quizRecord = moduleResponse.data.content.assessment?.quiz;

      if (!quizRecord?.id) {
        throw new Error('Quiz was created but the quiz ID was not returned.');
      }

      await persistQuizQuestions(quizRecord.id, mapDraftQuestionsToPayload(questions));

      toast.success('Quiz created successfully');
      onSuccess?.({
        contentId: moduleResponse.data.contentId,
        quizId: quizRecord.id,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to create quiz.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isEditMode && isLoadingQuiz;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Edit Quiz' : 'Create Quiz'}
      description={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
      contentClassName="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-5 pb-2">
        <div className="flex items-center gap-2">
          {STEPS.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={
                  index === step
                    ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'
                    : index < step
                      ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary'
                      : 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground'
                }
              >
                {index + 1}
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
                {label}
              </span>
              {index < STEPS.length - 1 ? (
                <span className="hidden h-px w-6 bg-border sm:block" />
              ) : null}
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : null}

        {!isLoading && step === 0 ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Title</Label>
              <Input
                id="quiz-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Quiz title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiz-description">Description</Label>
              <Input
                id="quiz-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Short description"
              />
            </div>

            {lockModuleSelection ? (
              <div className="space-y-2">
                <Label>Module</Label>
                <Input value={resolvedModuleTitle} disabled />
              </div>
            ) : isEditMode ? null : (
              <>
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Select value={courseId} onValueChange={setCourseId} disabled={isLoadingCourses}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCourses ? 'Loading courses...' : 'Select course'} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Module</Label>
                  <Select value={moduleId} onValueChange={setModuleId} disabled={!courseId || isLoadingModules}>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingModules ? 'Loading modules...' : 'Select module'} />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((courseModule) => (
                        <SelectItem key={courseModule.id} value={courseModule.id}>
                          {courseModule.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        ) : null}

        {!isLoading && step === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="passing-score">Passing score (%)</Label>
              <Input
                id="passing-score"
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(event) => setPassingScore(Number(event.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-attempts">Max attempts</Label>
              <Input
                id="max-attempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="time-limit">Time limit (minutes)</Label>
              <Input
                id="time-limit"
                type="number"
                min={1}
                value={timeLimitMinutes}
                onChange={(event) => setTimeLimitMinutes(event.target.value)}
                placeholder="Optional"
              />
            </div>

            {(
              [
                ['showResults', 'Show results'],
                ['showCorrectAnswers', 'Show correct answers'],
                ['shuffleQuestions', 'Shuffle questions'],
                ['shuffleOptions', 'Shuffle options'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-md border px-3 py-2">
                <Label htmlFor={key}>{label}</Label>
                <Switch
                  id={key}
                  checked={settings[key]}
                  onCheckedChange={(checked) =>
                    setSettings((current) => ({ ...current, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && step === 2 ? (
          isEditMode && quizId ? (
            <QuizManagedQuestionBuilder quizId={quizId} moduleId={presetModuleId ?? moduleId} />
          ) : (
            <QuizQuestionBuilder questions={questions} onChange={setQuestions} />
          )
        ) : null}

        {stepError ? <p className="text-sm text-destructive">{stepError}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0 || isSubmitting}
            onClick={() => {
              setStepError(null);
              setStep((current) => Math.max(0, current - 1));
            }}
          >
            Back
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Next'}
              </Button>
            ) : isEditMode ? (
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Quiz'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </FormDialog>
  );
}
