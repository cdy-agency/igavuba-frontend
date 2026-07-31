'use client';

import { useState } from 'react';
import { FileEdit, Loader2 } from 'lucide-react';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  ContentVisibilityToggle,
  LessonFormFooter,
  LessonSettingsGroup,
} from '@/components/course-builder/lesson-form-ui';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import TiptapEditor from '@/components/editor/TiptapEditor';
import {
  assignmentInfoSchema,
  assignmentSettingsSchema,
  defaultAssignmentSettings,
} from '@/schema/assignment.schema';
import { useCreateAssignmentContent } from '@/hooks/use-module-contents';
import { AssignmentSubmissionType } from '@/types/assignment.types';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';

interface AssignmentCreateFormProps {
  moduleId: string;
  onCreated: (contentId: string) => void;
  onCancel: () => void;
}

const SUBMISSION_TYPE_OPTIONS = [
  { value: AssignmentSubmissionType.TEXT, label: 'Text' },
  { value: AssignmentSubmissionType.FILE, label: 'File upload' },
  { value: AssignmentSubmissionType.LINK, label: 'Link' },
];

export function AssignmentCreateForm({
  moduleId,
  onCreated,
  onCancel,
}: AssignmentCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('<p></p>');
  const [settings, setSettings] = useState(defaultAssignmentSettings());
  const [isVisible, setIsVisible] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const createAssignment = useCreateAssignmentContent(moduleId);

  const toggleSubmissionType = (type: AssignmentSubmissionType, checked: boolean) => {
    setSettings((current) => {
      const next = checked
        ? Array.from(new Set([...current.submissionTypes, type]))
        : current.submissionTypes.filter((entry) => entry !== type);
      return { ...current, submissionTypes: next.length ? next : [AssignmentSubmissionType.TEXT] };
    });
  };

  const validateForm = () => {
    const infoResult = assignmentInfoSchema.safeParse({ title, description, instructions });
    if (!infoResult.success) {
      return infoResult.error.issues[0]?.message ?? 'Invalid assignment information';
    }

    const settingsResult = assignmentSettingsSchema.safeParse(settings);
    if (!settingsResult.success) {
      return settingsResult.error.issues[0]?.message ?? 'Invalid assignment settings';
    }

    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setFormError(error);
      toast.error(error);
      return;
    }

    setFormError(null);

    try {
      const response = await createAssignment.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        instructions: instructions.trim() && instructions !== '<p></p>' ? instructions : undefined,
        passingScore: settings.passingScore,
        maxAttempts: settings.maxAttempts,
        dueDate: settings.dueDate || undefined,
        allowLateSubmission: settings.allowLateSubmission,
        showFeedbackAfterGrading: settings.showFeedbackAfterGrading,
        submissionTypes: settings.submissionTypes,
        isPublished: isVisible,
      });

      onCreated(response.data.content.id);
    } catch (submitError) {
      toast.error(getApiErrorMessage(submitError, 'Unable to create assignment.'));
    }
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      description={description}
      onDescriptionChange={setDescription}
      onDelete={onCancel}
      icon={<FileEdit className="h-4.5 w-4.5 text-yellow-600" strokeWidth={2} />}
      settings={
        <div className="space-y-3">
          <p className="text-[13px] font-semibold text-foreground">Assignment settings</p>
          <LessonSettingsGroup>
            <ContentVisibilityToggle visible={isVisible} onChange={setIsVisible} />
          </LessonSettingsGroup>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Passing score (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={settings.passingScore}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    passingScore: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Max attempts</Label>
              <Input
                type="number"
                min={1}
                value={settings.maxAttempts}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    maxAttempts: Number(event.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Due date</Label>
              <Input
                type="datetime-local"
                value={settings.dueDate ?? ''}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, dueDate: event.target.value }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
              <Label>Allow late submission</Label>
              <Switch
                checked={settings.allowLateSubmission}
                onCheckedChange={(checked) =>
                  setSettings((current) => ({ ...current, allowLateSubmission: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
              <Label>Show feedback after grading</Label>
              <Switch
                checked={settings.showFeedbackAfterGrading}
                onCheckedChange={(checked) =>
                  setSettings((current) => ({ ...current, showFeedbackAfterGrading: checked }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Submission types</Label>
            {SUBMISSION_TYPE_OPTIONS.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={settings.submissionTypes.includes(option.value)}
                  onCheckedChange={(checked) =>
                    toggleSubmissionType(option.value, checked === true)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      }
      footer={
        <LessonFormFooter
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel="Create Assignment"
          isSubmitting={createAssignment.isPending}
        />
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Instructions</Label>
          <TiptapEditor
            name="assignment-instructions-create"
            content={instructions}
            onChange={setInstructions}
            placeholder="Explain what learners should submit and any formatting requirements."
            stickyToolbar={false}
          />
        </div>
        {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
        {createAssignment.isPending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating assignment...
          </div>
        ) : null}
      </div>
    </BuilderLessonShell>
  );
}
