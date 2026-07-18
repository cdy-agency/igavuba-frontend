'use client';

import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useCourseAcademicPolicy, useUpdateCourseAcademicPolicy } from '@/hooks/use-academic';
import type { UpdateCourseAcademicPolicyPayload } from '@/types/academic.types';

interface AcademicPolicyToggleProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function AcademicPolicyToggle({
  id,
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: AcademicPolicyToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/20 p-4">
      <div className="space-y-1 pr-4">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        size="default"
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

interface AcademicPolicyFormProps {
  courseIdOrSlug: string;
  readOnly?: boolean;
}

export function AcademicPolicyForm({ courseIdOrSlug, readOnly = false }: AcademicPolicyFormProps) {
  const { data, isPending, isError } = useCourseAcademicPolicy(courseIdOrSlug);
  const updatePolicy = useUpdateCourseAcademicPolicy(courseIdOrSlug);

  const saveField = (payload: UpdateCourseAcademicPolicyPayload) => {
    if (readOnly) return;
    updatePolicy.mutate(payload);
  };

  if (isPending) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load course academic policy.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Course Academic Policy</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure certificate and completion requirements for this course.
        </p>
      </div>

      <AcademicPolicyToggle
        id="require-final-exam"
        label="Require Final Exam"
        description="Learners must pass the required Final Exam before becoming eligible for a certificate."
        checked={data.requireFinalExam}
        disabled={readOnly || updatePolicy.isPending}
        onCheckedChange={(checked) => saveField({ requireFinalExam: checked })}
      />

      <AcademicPolicyToggle
        id="require-assignments"
        label="Require Assignments"
        description="Assignments are required to complete this course."
        checked={data.requireAssignments}
        disabled={readOnly || updatePolicy.isPending}
        onCheckedChange={(checked) => saveField({ requireAssignments: checked })}
      />

      <AcademicPolicyToggle
        id="require-all-required-assessments"
        label="Require All Required Assessments"
        description="Every assessment marked as Required must be successfully completed."
        checked={data.requireAllRequiredAssessments}
        disabled={readOnly || updatePolicy.isPending}
        onCheckedChange={(checked) => saveField({ requireAllRequiredAssessments: checked })}
      />

      {data.assessments.length > 0 ? (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm font-medium">Configured assessments</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.assessments.length} assessment{data.assessments.length === 1 ? '' : 's'} in this
            course. Edit assessment-specific rules from each quiz, assignment, or exam.
          </p>
        </div>
      ) : null}
    </div>
  );
}
