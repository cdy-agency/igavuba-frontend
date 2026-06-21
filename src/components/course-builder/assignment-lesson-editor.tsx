'use client';

import { useEffect, useState } from 'react';
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
import { useAssignmentDetail, useUpdateAssignment } from '@/hooks/use-assignment';
import type { ModuleContentItem } from '@/types/content';
import { AssignmentSubmissionType } from '@/types/assignment.types';

interface AssignmentLessonEditorProps {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
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

export function AssignmentLessonEditor({ item, moduleId, onDelete }: AssignmentLessonEditorProps) {
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

  const updateAssignmentMutation = useUpdateAssignment(assignmentId ?? '', moduleId);

  useEffect(() => {
    if (!assignment) return;
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
  }, [assignment]);

  const persistAssignmentMeta = async () => {
    if (!assignmentId) return;
    await updateAssignmentMutation.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      instructions: instructions.trim() && instructions !== '<p></p>' ? instructions : undefined,
      passingScore,
      maxAttempts,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      allowLateSubmission,
      showFeedbackAfterGrading,
      submissionTypes,
      isPublished: isVisible,
    });
  };

  const toggleSubmissionType = (type: AssignmentSubmissionType, checked: boolean) => {
    setSubmissionTypes((current) => {
      const next = checked
        ? Array.from(new Set([...current, type]))
        : current.filter((entry) => entry !== type);
      return next.length ? next : [AssignmentSubmissionType.TEXT];
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
      title={title}
      onTitleChange={setTitle}
      onTitleBlur={persistAssignmentMeta}
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={persistAssignmentMeta}
      onDelete={onDelete}
      icon={<FileEdit className="h-4.5 w-4.5 text-yellow-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-foreground">Assignment settings</p>
          <LessonSettingsGroup>
            <ContentVisibilityToggle
              visible={isVisible}
              onChange={(visible) => {
                setIsVisible(visible);
                void updateAssignmentMutation.mutateAsync({ isPublished: visible });
              }}
            />
          </LessonSettingsGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Passing score (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={passingScore}
                onChange={(event) => setPassingScore(Number(event.target.value) || 0)}
                onBlur={persistAssignmentMeta}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max attempts</Label>
              <Input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(event) => setMaxAttempts(Number(event.target.value) || 1)}
                onBlur={persistAssignmentMeta}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Due date</Label>
              <Input
                type="datetime-local"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                onBlur={persistAssignmentMeta}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
              <Label>Allow late submission</Label>
              <Switch
                checked={allowLateSubmission}
                onCheckedChange={(checked) => {
                  setAllowLateSubmission(checked);
                  void updateAssignmentMutation.mutateAsync({ allowLateSubmission: checked });
                }}
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
              <Label>Show feedback after grading</Label>
              <Switch
                checked={showFeedbackAfterGrading}
                onCheckedChange={(checked) => {
                  setShowFeedbackAfterGrading(checked);
                  void updateAssignmentMutation.mutateAsync({ showFeedbackAfterGrading: checked });
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
                  onCheckedChange={(checked) => {
                    toggleSubmissionType(option.value, checked === true);
                    void persistAssignmentMeta();
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-1.5">
        <Label>Instructions</Label>
        <TiptapEditor
          name={`assignment-instructions-${item.contentId}`}
          content={instructions}
          onChange={setInstructions}
          onBlur={() => void persistAssignmentMeta()}
          placeholder="Explain what learners should submit and any formatting requirements."
          stickyToolbar={false}
        />
      </div>
    </BuilderLessonShell>
  );
}
