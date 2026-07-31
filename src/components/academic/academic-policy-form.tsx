'use client';

import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

      {/* Course Completion */}
      <div>
        <h4 className="text-sm font-medium">Course Completion</h4>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          Learners must complete all required learning content before the course is considered completed.
        </p>
        <AcademicPolicyToggle
          id="require-course-completion"
          label="Require Course Completion"
          description="Learners must complete required learning content for the course to be marked completed."
          checked={data.requireCourseCompletion ?? true}
          disabled={readOnly || updatePolicy.isPending}
          onCheckedChange={(checked) => saveField({ requireCourseCompletion: checked })}
        />
      </div>

      {/* Certificate generation */}
      <div>
        <h4 className="text-sm font-medium">Certificate</h4>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">Choose how certificates are issued after learners satisfy academic requirements.</p>
        <div className="rounded-lg border bg-muted/10 p-4">
          <Label className="text-sm font-medium">Certificate Generation</Label>
          <RadioGroup
            className="mt-2 space-y-2"
            defaultValue={data.certificateGenerationStrategy ?? 'AUTOMATIC'}
            onValueChange={(value) => saveField({ certificateGenerationStrategy: value as 'AUTOMATIC' | 'MANUAL_APPROVAL' })}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <RadioGroupItem value="AUTOMATIC" id="cert-auto" />
                <Label htmlFor="cert-auto" className="text-sm font-medium">Automatically generate certificates</Label>
                <p className="text-xs text-muted-foreground">Certificates are issued immediately once the learner satisfies all requirements.</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <RadioGroupItem value="MANUAL_APPROVAL" id="cert-manual" />
                <Label htmlFor="cert-manual" className="text-sm font-medium">Require manual approval</Label>
                <p className="text-xs text-muted-foreground">A staff member must review and approve certificate issuance.</p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Assessment defaults */}
      <div>
        <h4 className="text-sm font-medium">Assessment Defaults</h4>
        <p className="mt-1 mb-3 text-xs text-muted-foreground">
          Default values applied when creating new assessments. These do not modify existing assessments.
        </p>

        <div className="grid gap-3">
          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/10 p-4">
            <div className="space-y-1 pr-4">
              <Label className="text-sm font-medium">Default Passing Score</Label>
              <p className="text-xs text-muted-foreground">Default passing score (percentage) applied to new assessments.</p>
            </div>
            <Input
              type="number"
              defaultValue={(data.defaultPassingScore ?? 50).toString()}
              min={0}
              max={100}
              disabled={readOnly || updatePolicy.isPending}
              onBlur={(e) => {
                const val = Number(e.currentTarget.value || 0);
                saveField({ defaultPassingScore: isNaN(val) ? 50 : val });
              }}
              className="w-28"
            />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/10 p-4">
            <div className="space-y-1 pr-4">
              <Label className="text-sm font-medium">Default Maximum Attempts</Label>
              <p className="text-xs text-muted-foreground">Default maximum attempts applied to new assessments.</p>
            </div>
            <Input
              type="number"
              defaultValue={(data.defaultMaxAttempts ?? 3).toString()}
              min={1}
              disabled={readOnly || updatePolicy.isPending}
              onBlur={(e) => {
                const val = Number(e.currentTarget.value || 1);
                saveField({ defaultMaxAttempts: isNaN(val) ? 3 : Math.max(1, Math.floor(val)) });
              }}
              className="w-28"
            />
          </div>

          <div>
            <AcademicPolicyToggle
              id="default-block-progress-until-passed"
              label="Default: Block Progress Until Passed"
              description="By default, newly created assessments will block progress until passed. Lecturers can override this per assessment."
              checked={data.defaultBlockProgressUntilPassed ?? false}
              disabled={readOnly || updatePolicy.isPending}
              onCheckedChange={(checked) => saveField({ defaultBlockProgressUntilPassed: checked })}
            />
          </div>
        </div>
      </div>

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
