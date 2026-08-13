'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { FileEdit, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
  getContentTitleError,
} from '@/components/course-builder/lesson-form-ui';
import { Checkbox } from '@/components/ui/checkbox';
import { DateTimePicker, toDatetimeLocalValue } from '@/components/ui/date-time-picker';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TiptapEditor from '@/components/editor/TiptapEditor';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
  type AcademicRulesSaveStatus,
} from '@/components/academic/assessment-academic-rules';
import { AcademicRulesImpactDialog } from '@/components/academic/academic-rules-impact-dialog';
import { AssessmentSettingsTabs } from '@/components/academic/assessment-settings-tabs';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import { useAssignmentDetail, useUpdateAssignment } from '@/hooks/use-assignment';
import { useCourseDetail } from '@/hooks/use-courses';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import type { ModuleContentItem } from '@/types/content';
import type { UpdateAssignmentPayload } from '@/types/assignment.types';
import { AssignmentSubmissionType } from '@/types/assignment.types';
import { CourseLifecycleStatus } from '@/types/course-status';

interface AssignmentLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
  readOnly?: boolean;
}

const SUBMISSION_TYPE_OPTIONS = [
  { value: AssignmentSubmissionType.TEXT, label: 'Text' },
  { value: AssignmentSubmissionType.FILE, label: 'File upload' },
  { value: AssignmentSubmissionType.LINK, label: 'Link' },
];

function normalizeInstructions(html: string) {
  const trimmed = html.trim();
  if (!trimmed || trimmed === '<p></p>' || trimmed === '<p><br></p>' || trimmed === '<p><br/></p>') {
    return '';
  }
  return trimmed;
}

type AssignmentFormState = {
  title: string;
  description: string;
  instructions: string;
  passingScore: number;
  maxAttempts: number;
  dueDate: string;
  allowLateSubmission: boolean;
  showFeedbackAfterGrading: boolean;
  submissionTypes: AssignmentSubmissionType[];
  isVisible: boolean;
};

function toFormState(
  source: AssignmentFormState,
  overrides: Partial<AssignmentFormState> = {},
): AssignmentFormState {
  return { ...source, ...overrides };
}

function academicRulesEqual(
  a: AssessmentAcademicRulesFormValues,
  b: AssessmentAcademicRulesFormValues,
) {
  return (
    a.required === b.required &&
    a.countsTowardCertificate === b.countsTowardCertificate &&
    a.blockProgressUntilPassed === b.blockProgressUntilPassed &&
    a.passingScore === b.passingScore &&
    a.maxAttempts === b.maxAttempts
  );
}

function formStatesEqual(a: AssignmentFormState, b: AssignmentFormState) {
  return (
    a.title.trim() === b.title.trim() &&
    a.description.trim() === b.description.trim() &&
    normalizeInstructions(a.instructions) === normalizeInstructions(b.instructions) &&
    a.passingScore === b.passingScore &&
    a.maxAttempts === b.maxAttempts &&
    a.dueDate === b.dueDate &&
    a.allowLateSubmission === b.allowLateSubmission &&
    a.showFeedbackAfterGrading === b.showFeedbackAfterGrading &&
    a.isVisible === b.isVisible &&
    a.submissionTypes.length === b.submissionTypes.length &&
    a.submissionTypes.every((type, index) => type === b.submissionTypes[index])
  );
}

export function AssignmentLessonEditor({
  item,
  moduleId,
  onDelete,
  readOnly = false,
}: AssignmentLessonEditorProps) {
  const params = useParams<{ slug?: string }>();
  const courseSlug = params.slug ?? '';
  const { data: course } = useCourseDetail(courseSlug, Boolean(courseSlug));
  const assignmentId = item.content.assessment?.assignment?.id ?? null;
  const { data: assignment, isPending } = useAssignmentDetail(
    assignmentId ?? '',
    Boolean(assignmentId),
  );
  const isPublishedCourse = course?.status === CourseLifecycleStatus.PUBLISHED;

  const [title, setTitle] = useState(item.content.title);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [instructions, setInstructions] = useState('<p></p>');
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [dueDate, setDueDate] = useState('');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [showFeedbackAfterGrading, setShowFeedbackAfterGrading] = useState(true);
  const [submissionTypes, setSubmissionTypes] = useState<AssignmentSubmissionType[]>([
    AssignmentSubmissionType.TEXT,
  ]);
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [academicRules, setAcademicRules] = useState<AssessmentAcademicRulesFormValues>(
    defaultAssessmentAcademicRules(),
  );

  const updateAssignmentMutation = useUpdateAssignment(assignmentId ?? '', moduleId);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRulesRef = useRef<AssessmentAcademicRulesFormValues | null>(null);
  const [rulesSaveStatus, setRulesSaveStatus] = useState<AcademicRulesSaveStatus>('idle');
  const [pendingRules, setPendingRules] = useState<AssessmentAcademicRulesFormValues | null>(
    null,
  );
  const [impactOpen, setImpactOpen] = useState(false);
  const pendingSaveRef = useRef<{
    overrides: Partial<AssignmentFormState>;
    includeInstructions: boolean;
  } | null>(null);
  const lastSavedRef = useRef<AssignmentFormState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const formRef = useRef({
    title,
    description,
    instructions,
    passingScore,
    maxAttempts,
    dueDate,
    allowLateSubmission,
    showFeedbackAfterGrading,
    submissionTypes,
    isVisible,
  });

  useEffect(() => {
    formRef.current = {
      title,
      description,
      instructions,
      passingScore,
      maxAttempts,
      dueDate,
      allowLateSubmission,
      showFeedbackAfterGrading,
      submissionTypes,
      isVisible,
    };
  }, [
    title,
    description,
    instructions,
    passingScore,
    maxAttempts,
    dueDate,
    allowLateSubmission,
    showFeedbackAfterGrading,
    submissionTypes,
    isVisible,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setHydrated(false);
  }, [assignmentId]);

  useEffect(() => {
    if (!assignment || hydrated) return;
    setTitle(assignment.title);
    setDescription(assignment.description ?? '');
    setInstructions(assignment.instructions?.trim() ? assignment.instructions : '<p></p>');
    setPassingScore(assignment.passingScore);
    setMaxAttempts(assignment.maxAttempts);
    setDueDate(toDatetimeLocalValue(assignment.dueDate));
    setAllowLateSubmission(assignment.allowLateSubmission);
    setShowFeedbackAfterGrading(assignment.showFeedbackAfterGrading);
    setSubmissionTypes(assignment.submissionTypes);
    setIsVisible(assignment.isPublished);
    const nextRules = defaultAssessmentAcademicRules({
      required: assignment.required ?? true,
      countsTowardCertificate: assignment.countsTowardCertificate ?? false,
      blockProgressUntilPassed: assignment.blockProgressUntilPassed ?? false,
      passingScore: assignment.passingScore,
      maxAttempts: assignment.maxAttempts,
    });
    setAcademicRules(nextRules);
    lastSavedRulesRef.current = nextRules;
    setRulesSaveStatus('idle');
    lastSavedRef.current = {
      title: assignment.title,
      description: assignment.description ?? '',
      instructions: assignment.instructions?.trim() ? assignment.instructions : '<p></p>',
      passingScore: assignment.passingScore,
      maxAttempts: assignment.maxAttempts,
      dueDate: toDatetimeLocalValue(assignment.dueDate),
      allowLateSubmission: assignment.allowLateSubmission,
      showFeedbackAfterGrading: assignment.showFeedbackAfterGrading,
      submissionTypes: assignment.submissionTypes,
      isVisible: assignment.isPublished,
    };
    setHydrated(true);
  }, [assignment, hydrated]);

  const persistAssignmentMeta = async (
    overrides: Partial<AssignmentFormState> = {},
    options: { includeInstructions?: boolean } = {},
  ) => {
    if (readOnly || !assignmentId) return;

    const current = toFormState(formRef.current, overrides);
    const error = getContentTitleError(current.title);
    setTitleError(error);
    if (error) return;

    if (lastSavedRef.current && formStatesEqual(lastSavedRef.current, current)) {
      return;
    }

    const includeInstructions =
      options.includeInstructions === true || overrides.instructions !== undefined;

    const payload: UpdateAssignmentPayload = {
      title: current.title.trim(),
      description: current.description.trim() || undefined,
      dueDate: current.dueDate ? new Date(current.dueDate).toISOString() : null,
      allowLateSubmission: current.allowLateSubmission,
      showFeedbackAfterGrading: current.showFeedbackAfterGrading,
      submissionTypes: current.submissionTypes,
      isPublished: current.isVisible,
      ...(lastSavedRulesRef.current ?? academicRules),
    };

    if (includeInstructions) {
      const normalizedInstructions = normalizeInstructions(current.instructions);
      payload.instructions = normalizedInstructions || undefined;
    }

    await updateAssignmentMutation.mutateAsync(payload);
    lastSavedRef.current = current;
  };

  const persistAcademicRules = async (nextRules: AssessmentAcademicRulesFormValues) => {
    if (readOnly || !assignmentId) return;
    if (lastSavedRulesRef.current && academicRulesEqual(lastSavedRulesRef.current, nextRules)) {
      setRulesSaveStatus('saved');
      return;
    }

    setRulesSaveStatus('saving');
    try {
      await updateAssignmentMutation.mutateAsync(nextRules);
      lastSavedRulesRef.current = nextRules;
      setAcademicRules(nextRules);
      setPassingScore(nextRules.passingScore);
      setMaxAttempts(nextRules.maxAttempts);
      formRef.current.passingScore = nextRules.passingScore;
      formRef.current.maxAttempts = nextRules.maxAttempts;
      if (lastSavedRef.current) {
        lastSavedRef.current = {
          ...lastSavedRef.current,
          passingScore: nextRules.passingScore,
          maxAttempts: nextRules.maxAttempts,
        };
      }
      setRulesSaveStatus('saved');
    } catch {
      if (lastSavedRulesRef.current) {
        setAcademicRules(lastSavedRulesRef.current);
      }
      setRulesSaveStatus('error');
    }
  };

  const requestAcademicRulesSave = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    if (readOnly) return;
    const nextRules = { ...academicRules, ...patch };
    if (lastSavedRulesRef.current && academicRulesEqual(lastSavedRulesRef.current, nextRules)) {
      setRulesSaveStatus('saved');
      return;
    }

    if (isPublishedCourse) {
      setPendingRules(nextRules);
      setImpactOpen(true);
      return;
    }

    void persistAcademicRules(nextRules);
  };

  const scheduleSave = (
    overrides: Partial<AssignmentFormState> = {},
    options: { includeInstructions?: boolean } = {},
  ) => {
    if (readOnly) return;

    const nextTitle = overrides.title ?? formRef.current.title;
    if (getContentTitleError(nextTitle)) {
      setTitleError(getContentTitleError(nextTitle));
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      pendingSaveRef.current = null;
      return;
    }

    const includeInstructions =
      options.includeInstructions === true || overrides.instructions !== undefined;

    pendingSaveRef.current = { overrides, includeInstructions };

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      const pending = pendingSaveRef.current;
      pendingSaveRef.current = null;
      if (!pending) return;
      void persistAssignmentMeta(pending.overrides, {
        includeInstructions: pending.includeInstructions,
      });
    }, 600);
  };

  const flushPendingSave = () => {
    if (readOnly || !assignmentId || !saveTimerRef.current) return;

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = null;

    const pending = pendingSaveRef.current;
    pendingSaveRef.current = null;
    if (!pending) return;

    void persistAssignmentMeta(pending.overrides, {
      includeInstructions: pending.includeInstructions,
    });
  };

  const flushInstructionsSave = (content: string) => {
    formRef.current.instructions = content;
    setInstructions(content);
    pendingSaveRef.current = null;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    void persistAssignmentMeta({ instructions: content }, { includeInstructions: true });
  };

  const syncLastSavedFromForm = () => {
    lastSavedRef.current = { ...formRef.current };
  };

  useEffect(() => {
    return () => {
      flushPendingSave();
    };
    // Flush pending debounced saves when switching lessons.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId, readOnly]);

  const toggleSubmissionType = (type: AssignmentSubmissionType, checked: boolean) => {
    setSubmissionTypes((current) => {
      const next = checked
        ? Array.from(new Set([...current, type]))
        : current.filter((entry) => entry !== type);
      const resolved = next.length ? next : [AssignmentSubmissionType.TEXT];
      scheduleSave({ submissionTypes: resolved }, { includeInstructions: false });
      return resolved;
    });
  };

  if (!assignmentId) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Assignment data is unavailable for this lesson.
        </p>
      </div>
    );
  }

  if (isPending && !assignment) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BuilderLessonShell
      readOnly={readOnly}
      title={title}
      titleError={titleError}
      onTitleChange={(value) => {
        if (readOnly) return;
        setTitle(value);
        setTitleError(getContentTitleError(value));
        if (!getContentTitleError(value)) {
          scheduleSave({ title: value });
        }
      }}
      onTitleBlur={
        readOnly
          ? undefined
          : () => {
              const error = getContentTitleError(title);
              setTitleError(error);
              if (!error) scheduleSave();
            }
      }
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={readOnly ? undefined : () => scheduleSave()}
      onDelete={readOnly ? undefined : onDelete}
      icon={<FileEdit className="h-4.5 w-4.5 text-yellow-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-foreground">Assignment configuration</p>
            <AcademicRuleBadges
              required={academicRules.required}
              countsTowardCertificate={academicRules.countsTowardCertificate}
              blockProgressUntilPassed={academicRules.blockProgressUntilPassed}
            />
          </div>
          <AssessmentSettingsTabs
            settingsContent={
              <>
                <LessonSettingsGroup>
                  <ContentVisibilityToggle
                    visible={isVisible}
                    disabled={readOnly}
                    onChange={(visible) => {
                      if (readOnly) return;
                      setIsVisible(visible);
                      void updateAssignmentMutation
                        .mutateAsync({ isPublished: visible })
                        .then(syncLastSavedFromForm);
                    }}
                  />
                </LessonSettingsGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label>Due date</Label>
                    <DateTimePicker
                      value={dueDate}
                      disabled={readOnly}
                      placeholder="Pick due date & time"
                      onChange={setDueDate}
                      onBlur={readOnly ? undefined : () => scheduleSave()}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
                    <Label>Allow late submission</Label>
                    <Switch
                      size="sm"
                      checked={allowLateSubmission}
                      disabled={readOnly}
                      onCheckedChange={(checked) => {
                        if (readOnly) return;
                        setAllowLateSubmission(checked);
                        void updateAssignmentMutation
                          .mutateAsync({ allowLateSubmission: checked })
                          .then(syncLastSavedFromForm);
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
                    <Label>Show feedback after grading</Label>
                    <Switch
                      size="sm"
                      checked={showFeedbackAfterGrading}
                      disabled={readOnly}
                      onCheckedChange={(checked) => {
                        if (readOnly) return;
                        setShowFeedbackAfterGrading(checked);
                        void updateAssignmentMutation
                          .mutateAsync({ showFeedbackAfterGrading: checked })
                          .then(syncLastSavedFromForm);
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Submission types</Label>
                  {SUBMISSION_TYPE_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={submissionTypes.includes(option.value)}
                        disabled={readOnly}
                        onCheckedChange={(checked) => {
                          if (readOnly) return;
                          toggleSubmissionType(option.value, checked === true);
                        }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </>
            }
            academicRulesContent={
              <AssessmentAcademicRules
                idPrefix={`assignment-${item.contentId}`}
                values={academicRules}
                readOnly={readOnly}
                disabled={updateAssignmentMutation.isPending}
                saveStatus={rulesSaveStatus}
                onChange={(values) =>
                  setAcademicRules((current) => ({ ...current, ...values }))
                }
                onCommit={requestAcademicRulesSave}
              />
            }
          />
        </div>
      }
    >
      <div className="space-y-1.5">
        <Label>Instructions</Label>
        {hydrated ? (
          <TiptapEditor
            key={`assignment-instructions-${assignmentId}`}
            name={`assignment-instructions-${item.contentId}`}
            content={instructions}
            isPreview={readOnly}
            onChange={(value) => {
              if (readOnly) return;
              setInstructions(value);
              formRef.current.instructions = value;
              scheduleSave({ instructions: value }, { includeInstructions: true });
            }}
            onBlur={readOnly ? undefined : flushInstructionsSave}
            placeholder="Explain what learners should submit and any formatting requirements."
            stickyToolbar={false}
          />
        ) : (
          <div className="min-h-[400px] rounded-xl border border-border bg-muted/30 animate-pulse" />
        )}
      </div>
      <AcademicRulesImpactDialog
        open={impactOpen}
        onOpenChange={(open) => {
          setImpactOpen(open);
          if (!open && pendingRules) {
            if (lastSavedRulesRef.current) {
              setAcademicRules(lastSavedRulesRef.current);
            }
            setPendingRules(null);
            setRulesSaveStatus('idle');
          }
        }}
        learnerCountHint={
          assignment?.submissionsCount
            ? `${assignment.submissionsCount} learner submission${assignment.submissionsCount === 1 ? '' : 's'} already exist.`
            : null
        }
        onConfirm={async () => {
          if (!pendingRules) return;
          await persistAcademicRules(pendingRules);
          setPendingRules(null);
        }}
        onCancel={() => {
          if (lastSavedRulesRef.current) {
            setAcademicRules(lastSavedRulesRef.current);
          }
          setPendingRules(null);
          setRulesSaveStatus('idle');
        }}
      />
    </BuilderLessonShell>
  );
}
