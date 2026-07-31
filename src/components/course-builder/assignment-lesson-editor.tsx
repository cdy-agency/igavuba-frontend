'use client';

import { useEffect, useRef, useState } from 'react';
import { FileEdit, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TiptapEditor from '@/components/editor/TiptapEditor';
import {
  AssessmentAcademicRules,
  defaultAssessmentAcademicRules,
} from '@/components/academic/assessment-academic-rules';
import { AssessmentSettingsTabs } from '@/components/academic/assessment-settings-tabs';
import { AcademicRuleBadges } from '@/components/academic/academic-rule-badge';
import { useAssignmentDetail, useUpdateAssignment } from '@/hooks/use-assignment';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import type { ModuleContentItem } from '@/types/content';
import type { UpdateAssignmentPayload } from '@/types/assignment.types';
import { AssignmentSubmissionType } from '@/types/assignment.types';

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

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

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
  const assignmentId = item.content.assessment?.assignment?.id ?? null;
  const { data: assignment, isPending } = useAssignmentDetail(
    assignmentId ?? '',
    Boolean(assignmentId),
  );

  const [title, setTitle] = useState(item.content.title);
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
    setDueDate(toDateTimeLocalValue(assignment.dueDate));
    setAllowLateSubmission(assignment.allowLateSubmission);
    setShowFeedbackAfterGrading(assignment.showFeedbackAfterGrading);
    setSubmissionTypes(assignment.submissionTypes);
    setIsVisible(assignment.isPublished);
    setAcademicRules(
      defaultAssessmentAcademicRules({
        required: assignment.required ?? true,
        countsTowardCertificate: assignment.countsTowardCertificate ?? true,
        blockProgressUntilPassed: assignment.blockProgressUntilPassed ?? false,
        passingScore: assignment.passingScore,
        maxAttempts: assignment.maxAttempts,
      }),
    );
    lastSavedRef.current = {
      title: assignment.title,
      description: assignment.description ?? '',
      instructions: assignment.instructions?.trim() ? assignment.instructions : '<p></p>',
      passingScore: assignment.passingScore,
      maxAttempts: assignment.maxAttempts,
      dueDate: toDateTimeLocalValue(assignment.dueDate),
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
      ...academicRules,
    };

    if (includeInstructions) {
      const normalizedInstructions = normalizeInstructions(current.instructions);
      payload.instructions = normalizedInstructions || undefined;
    }

    await updateAssignmentMutation.mutateAsync(payload);
    lastSavedRef.current = current;
  };

  const scheduleSave = (
    overrides: Partial<AssignmentFormState> = {},
    options: { includeInstructions?: boolean } = {},
  ) => {
    if (readOnly) return;

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
      onTitleChange={setTitle}
      onTitleBlur={readOnly ? undefined : () => scheduleSave()}
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
                    <Input
                      type="datetime-local"
                      value={dueDate}
                      disabled={readOnly}
                      onChange={(event) => setDueDate(event.target.value)}
                      onBlur={readOnly ? undefined : () => scheduleSave()}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
                    <Label>Allow late submission</Label>
                    <Switch
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
                onChange={(values) =>
                  setAcademicRules((current) => ({ ...current, ...values }))
                }
                onBlur={() => {
                  if (readOnly) return;
                  void updateAssignmentMutation
                    .mutateAsync(academicRules)
                    .then(syncLastSavedFromForm);
                }}
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
    </BuilderLessonShell>
  );
}
