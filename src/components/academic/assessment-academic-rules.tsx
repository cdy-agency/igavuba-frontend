'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';

interface AssessmentAcademicRulesProps {
  idPrefix: string;
  values: AssessmentAcademicRulesFormValues;
  readOnly?: boolean;
  disabled?: boolean;
  onChange: (values: Partial<AssessmentAcademicRulesFormValues>) => void;
  onBlur?: () => void;
}

export function AssessmentAcademicRules({
  idPrefix,
  values,
  readOnly = false,
  disabled = false,
  onChange,
  onBlur,
}: AssessmentAcademicRulesProps) {
  const isDisabled = readOnly || disabled;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-semibold text-foreground">Academic Rules</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Control completion, certificate eligibility, and progress blocking for this assessment.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-3">
          <div className="space-y-1 pr-4">
            <Label htmlFor={`${idPrefix}-required`}>Required Assessment</Label>
            <p className="text-xs text-muted-foreground">
              Learner must successfully complete this assessment.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-required`}
            size="default"
            checked={values.required}
            disabled={isDisabled}
            onCheckedChange={(checked) => onChange({ required: checked })}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-3">
          <div className="space-y-1 pr-4">
            <Label htmlFor={`${idPrefix}-certificate`}>Counts Toward Certificate</Label>
            <p className="text-xs text-muted-foreground">
              Include this assessment when evaluating certificate eligibility.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-certificate`}
            size="default"
            checked={values.countsTowardCertificate}
            disabled={isDisabled}
            onCheckedChange={(checked) => onChange({ countsTowardCertificate: checked })}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-3">
          <div className="space-y-1 pr-4">
            <Label htmlFor={`${idPrefix}-blocking`}>Block Progress Until Submitted</Label>
            <p className="text-xs text-muted-foreground">
              Learner cannot continue until they submit this assignment or attempt this quiz or
              exam. Passing is still required for certificate eligibility.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-blocking`}
            size="default"
            checked={values.blockProgressUntilPassed}
            disabled={isDisabled}
            onCheckedChange={(checked) => onChange({ blockProgressUntilPassed: checked })}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Passing score and max attempts can also be edited under the Settings tab.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-passing-score`}>Passing Score (%)</Label>
          <Input
            id={`${idPrefix}-passing-score`}
            type="number"
            min={0}
            max={100}
            value={values.passingScore}
            disabled={isDisabled}
            onChange={(event) =>
              onChange({ passingScore: Number(event.target.value) || 0 })
            }
            onBlur={(event) =>
              onChange({ passingScore: Number(event.currentTarget.value) || 0 })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-max-attempts`}>Maximum Attempts</Label>
          <Input
            id={`${idPrefix}-max-attempts`}
            type="number"
            min={1}
            value={values.maxAttempts}
            disabled={isDisabled}
            onChange={(event) => onChange({ maxAttempts: Number(event.target.value) || 1 })}
            onBlur={(event) =>
              onChange({ maxAttempts: Number(event.currentTarget.value) || 1 })
            }
          />
        </div>
      </div>
    </div>
  );
}

export function defaultAssessmentAcademicRules(
  overrides?: Partial<AssessmentAcademicRulesFormValues>,
): AssessmentAcademicRulesFormValues {
  return {
    required: true,
    countsTowardCertificate: true,
    blockProgressUntilPassed: false,
    passingScore: 70,
    maxAttempts: 3,
    ...overrides,
  };
}
