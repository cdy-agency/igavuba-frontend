'use client';



import { Suspense, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { RoleGuard } from '@/guards/role-guard';

import { UserRole } from '@/types/enum';

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

import { Textarea } from '@/components/ui/textarea';

import { ExamManagedQuestionBuilder } from '@/components/exam/exam-managed-question-builder';

import {

  QuizQuestionBuilder,

  createInitialDraftQuestions,

  mapDraftQuestionsToPayload,

  validateDraftQuestions,

} from '@/components/quiz/quiz-question-builder';

import { getCourse, getCourses } from '@/api/course.api';

import { persistExamQuestions } from '@/api/exam.api';
import { setCourseFinalExam } from '@/api/course-final-exam.api';

import type { DraftQuestionValues } from '@/schema/question.schema';

import { quizInfoSchema, quizSettingsFormSchema } from '@/schema/quiz.schema';

import { useCreateExam, useExamDetail, useUpdateExam } from '@/hooks/use-exam';

import type { ExamQuestion } from '@/types/exam.types';

import { defaultQuizSettings } from '@/lib/quiz-utils';

import {

  buildAssessmentsPath,

  buildCourseBuilderContentPath,

} from '@/lib/course-builder-navigation';

import { getApiErrorMessage } from '@/lib/auth';

import { toast } from '@/lib/toast';



const EXAM_MANAGER_ROLES = [

  UserRole.SUPER_ADMIN,

  UserRole.INSTITUTION_ADMIN,

  UserRole.LECTURER,

];



type BuilderView = 'builder' | 'settings';



interface ExamBuilderPageProps {

  examId?: string;

}



function toDateTimeLocalValue(value: string | null | undefined) {

  if (!value) return '';

  const date = new Date(value);

  const offset = date.getTimezoneOffset();

  const local = new Date(date.getTime() - offset * 60_000);

  return local.toISOString().slice(0, 16);

}



function ExamBuilderPageContent({ examId }: ExamBuilderPageProps) {

  const router = useRouter();

  const searchParams = useSearchParams();

  const isEditMode = Boolean(examId);



  const presetCourseSlug = searchParams.get('courseSlug');

  const returnTo = searchParams.get('returnTo');



  const [view, setView] = useState<BuilderView>('builder');

  const [isSaving, setIsSaving] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);



  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [instructions, setInstructions] = useState('');

  const [courseId, setCourseId] = useState('');

  const [courseSlug, setCourseSlug] = useState(presetCourseSlug ?? '');

  const [courseTitle, setCourseTitle] = useState('');

  const [passingScore, setPassingScore] = useState(70);

  const [maxAttempts, setMaxAttempts] = useState(1);

  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');

  const [availableFrom, setAvailableFrom] = useState('');

  const [availableTo, setAvailableTo] = useState('');

  const [settings, setSettings] = useState(defaultQuizSettings());

  const [isPublished, setIsPublished] = useState(true);

  const [questions, setQuestions] = useState<DraftQuestionValues[]>(createInitialDraftQuestions);



  const [courses, setCourses] = useState<Array<{ id: string; title: string; slug: string }>>([]);

  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const [isLoadingCoursePrefill, setIsLoadingCoursePrefill] = useState(Boolean(presetCourseSlug));



  const lockCourseSelection = Boolean(presetCourseSlug);



  const { data: examDetail, isLoading: isLoadingExam } = useExamDetail(

    examId ?? '',

    isEditMode,

  );

  const createExamMutation = useCreateExam();

  const updateExamMutation = useUpdateExam(examId ?? '');



  useEffect(() => {

    if (!presetCourseSlug) return;



    setIsLoadingCoursePrefill(true);

    getCourse(presetCourseSlug)

      .then((response) => {

        setCourseId(response.data.id);

        setCourseSlug(response.data.slug);

        setCourseTitle(response.data.title);

      })

      .catch((error) => {

        toast.error(getApiErrorMessage(error, 'Unable to load course.'));

      })

      .finally(() => setIsLoadingCoursePrefill(false));

  }, [presetCourseSlug]);



  useEffect(() => {

    if (!examDetail || !isEditMode) return;



    setTitle(examDetail.assessment.title);

    setDescription(examDetail.assessment.description ?? '');

    setInstructions(examDetail.assessment.instructions ?? '');

    setPassingScore(examDetail.passingScore);

    setMaxAttempts(examDetail.maxAttempts);

    setTimeLimitMinutes(

      examDetail.timeLimitMinutes ? String(examDetail.timeLimitMinutes) : '',

    );

    setAvailableFrom(toDateTimeLocalValue(examDetail.availableFrom));

    setAvailableTo(toDateTimeLocalValue(examDetail.availableTo));

    setSettings(examDetail.assessment.settings ?? defaultQuizSettings());

    setIsPublished(examDetail.assessment.content.isPublished);

  }, [examDetail, isEditMode]);



  useEffect(() => {

    if (lockCourseSelection || isEditMode) return;



    setIsLoadingCourses(true);

    getCourses({ page: 1, limit: 100 })

      .then((response) => {

        setCourses(

          response.data.map((course) => ({

            id: course.id,

            title: course.title,

            slug: course.slug,

          })),

        );

      })

      .catch((error) => {

        toast.error(getApiErrorMessage(error, 'Unable to load courses.'));

      })

      .finally(() => setIsLoadingCourses(false));

  }, [lockCourseSelection, isEditMode]);



  const totalMarks = useMemo(() => {

    if (isEditMode) {

      return (

        examDetail?.questions.reduce(

          (sum: number, question: ExamQuestion) => sum + question.points,

          0,

        ) ?? 0

      );

    }

    return questions.reduce((sum, question) => sum + question.points, 0);

  }, [examDetail?.questions, isEditMode, questions]);



  const handleBack = () => {

    if (returnTo === 'builder' && courseSlug) {

      if (examDetail) {

        router.push(

          buildCourseBuilderContentPath({

            courseSlug,

            contentId: examDetail.assessment.contentId,

          }),

        );

        return;

      }



      router.push(`/builder/course/${courseSlug}`);

      return;

    }



    router.push(buildAssessmentsPath('exams'));

  };



  const validateForm = () => {

    const infoResult = quizInfoSchema.safeParse({

      title,

      description,

      courseId,

    });



    if (!infoResult.success) {

      return infoResult.error.issues[0]?.message ?? 'Invalid exam information';

    }



    if (!isEditMode && !courseId) {

      return 'Select the course this exam belongs to.';

    }



    const settingsResult = quizSettingsFormSchema.safeParse({

      passingScore,

      maxAttempts,

      timeLimitMinutes,

      settings,

    });



    if (!settingsResult.success) {

      return settingsResult.error.issues[0]?.message ?? 'Invalid exam settings';

    }



    if (!isEditMode) {

      const questionsResult = validateDraftQuestions(questions);

      if (!questionsResult.success) {

        return questionsResult.message;

      }

    }



    return null;

  };



  const buildExamPayload = () => ({

    title: title.trim() || 'Untitled Exam',

    description: description.trim() || undefined,

    instructions: instructions.trim() || undefined,

    passingScore,

    maxAttempts,

    timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : undefined,

    availableFrom: availableFrom ? new Date(availableFrom).toISOString() : undefined,

    availableTo: availableTo ? new Date(availableTo).toISOString() : undefined,

    settings,

    isPublished,

  });



  const handleSave = async () => {

    const error = validateForm();

    if (error) {

      setFormError(error);

      toast.error(error);

      return;

    }



    setFormError(null);

    setIsSaving(true);



    try {

      if (isEditMode && examId) {

        await updateExamMutation.mutateAsync(buildExamPayload());

        toast.success('Exam saved successfully');

        return;

      }



      const createResponse = await createExamMutation.mutateAsync(buildExamPayload());

      const createdExam = createResponse.data;



      await persistExamQuestions(createdExam.id, mapDraftQuestionsToPayload(questions));

      if (courseId) {
        await setCourseFinalExam(courseId, createdExam.assessment.contentId);
      }

      toast.success('Exam created successfully');

      router.replace(

        `/dashboard/exams/${createdExam.id}/edit?${new URLSearchParams({

          ...(courseSlug ? { courseSlug } : {}),

          ...(returnTo ? { returnTo } : {}),

        }).toString()}`,

      );

    } catch (submitError) {

      toast.error(getApiErrorMessage(submitError, 'Unable to save exam.'));

    } finally {

      setIsSaving(false);

    }

  };



  const isLoading = (isEditMode && isLoadingExam) || isLoadingCoursePrefill;



  if (isLoading) {

    return (

      <div className="flex min-h-[50vh] items-center justify-center">

        <Loader2 className="h-8 w-8 animate-spin text-primary" />

      </div>

    );

  }



  return (

    <div className="space-y-4">

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">

        <Button type="button" variant="ghost" onClick={handleBack}>

          <ArrowLeft className="mr-2 h-4 w-4" />

          Back

        </Button>



        <div className="inline-flex rounded-md border bg-muted/40 p-1">

          <Button

            type="button"

            size="sm"

            variant={view === 'builder' ? 'default' : 'ghost'}

            onClick={() => setView('builder')}

          >

            Builder

          </Button>

          <Button

            type="button"

            size="sm"

            variant={view === 'settings' ? 'default' : 'ghost'}

            onClick={() => setView('settings')}

          >

            Settings

          </Button>

        </div>



        <Button type="button" onClick={handleSave} disabled={isSaving}>

          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}

          {isEditMode ? 'Save All' : 'Create Exam'}

        </Button>

      </div>



      <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">

        <div className="space-y-4">

          <Input

            value={title}

            onChange={(event) => setTitle(event.target.value)}

            placeholder="Exam title"

            className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"

          />



          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-md border px-3 py-2">

              <p className="text-xs text-muted-foreground">Time Limit</p>

              <div className="mt-1 flex items-center gap-2">

                <Input

                  type="number"

                  min={1}

                  value={timeLimitMinutes}

                  onChange={(event) => setTimeLimitMinutes(event.target.value)}

                  placeholder="Optional"

                  className="h-8"

                />

                <span className="text-sm text-muted-foreground">min</span>

              </div>

            </div>

            <div className="rounded-md border px-3 py-2">

              <p className="text-xs text-muted-foreground">Total Marks</p>

              <p className="mt-2 text-lg font-semibold">{totalMarks}</p>

            </div>

            <div className="rounded-md border px-3 py-2">

              <p className="text-xs text-muted-foreground">Passing Score</p>

              <div className="mt-1 flex items-center gap-2">

                <Input

                  type="number"

                  min={0}

                  max={100}

                  value={passingScore}

                  onChange={(event) => setPassingScore(Number(event.target.value) || 0)}

                  className="h-8"

                />

                <span className="text-sm text-muted-foreground">%</span>

              </div>

            </div>

            <div className="rounded-md border px-3 py-2">

              <p className="text-xs text-muted-foreground">Max Attempts</p>

              <Input

                type="number"

                min={1}

                value={maxAttempts}

                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}

                className="mt-1 h-8"

              />

            </div>

          </div>

        </div>

      </div>



      {view === 'settings' ? (

        <div className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">

          <div className="space-y-2">

            <Label htmlFor="exam-description">Description</Label>

            <Input

              id="exam-description"

              value={description}

              onChange={(event) => setDescription(event.target.value)}

              placeholder="Short description"

            />

          </div>



          <div className="space-y-2">

            <Label htmlFor="exam-instructions">Instructions</Label>

            <Textarea

              id="exam-instructions"

              value={instructions}

              onChange={(event) => setInstructions(event.target.value)}

              rows={4}

              placeholder="Explain how learners should complete this exam."

            />

          </div>



          {lockCourseSelection ? (

            <div className="space-y-2">

              <Label>Course</Label>

              <Input value={courseTitle || courseSlug} disabled />

            </div>

          ) : (

            <div className="space-y-2">

              <Label>Course</Label>

              <Select

                value={courseId}

                onValueChange={(value) => {

                  const selected = courses.find((course) => course.id === value);

                  setCourseId(value);

                  setCourseSlug(selected?.slug ?? '');

                  setCourseTitle(selected?.title ?? '');

                }}

                disabled={isLoadingCourses}

              >

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

          )}



          <div className="grid gap-4 sm:grid-cols-2">

            <div className="space-y-2">

              <Label htmlFor="exam-available-from">Available from</Label>

              <Input

                id="exam-available-from"

                type="datetime-local"

                value={availableFrom}

                onChange={(event) => setAvailableFrom(event.target.value)}

              />

            </div>

            <div className="space-y-2">

              <Label htmlFor="exam-available-to">Available to</Label>

              <Input

                id="exam-available-to"

                type="datetime-local"

                value={availableTo}

                onChange={(event) => setAvailableTo(event.target.value)}

              />

            </div>

          </div>



          <div className="flex items-center justify-between rounded-md border px-3 py-2">

            <Label htmlFor="exam-published">Published</Label>

            <Switch id="exam-published" checked={isPublished} onCheckedChange={setIsPublished} />

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

              <Label htmlFor={`exam-${key}`}>{label}</Label>

              <Switch

                id={`exam-${key}`}

                checked={settings[key]}

                onCheckedChange={(checked) =>

                  setSettings((current) => ({ ...current, [key]: checked }))

                }

              />

            </div>

          ))}

        </div>

      ) : null}



      {view === 'builder' ? (

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5">

          {isEditMode && examId ? (

            <ExamManagedQuestionBuilder examId={examId} />

          ) : (

            <QuizQuestionBuilder questions={questions} onChange={setQuestions} allowEssayTypes />

          )}

        </div>

      ) : null}



      {formError ? <p className="text-sm text-destructive">{formError}</p> : null}



      {!isEditMode ? (

        <p className="text-sm text-muted-foreground">

          Choose the course in Settings before creating the exam. From the course builder, the course

          is filled in automatically.

        </p>

      ) : null}

    </div>

  );

}



export function ExamBuilderPage(props: ExamBuilderPageProps) {

  return (

    <RoleGuard allowedRoles={EXAM_MANAGER_ROLES}>

      <Suspense

        fallback={

          <div className="flex min-h-[50vh] items-center justify-center">

            <Loader2 className="h-8 w-8 animate-spin text-primary" />

          </div>

        }

      >

        <ExamBuilderPageContent {...props} />

      </Suspense>

    </RoleGuard>

  );

}


