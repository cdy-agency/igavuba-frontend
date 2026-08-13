'use client';

import { Check, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import type { AssessmentAcademicRulesFormValues } from '@/schema/academic.schema';
import { cn } from '@/lib/utils';

export type AcademicRulesSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AssessmentAcademicRulesProps {
  idPrefix: string;
  values: AssessmentAcademicRulesFormValues;
  readOnly?: boolean;
  disabled?: boolean;
  saveStatus?: AcademicRulesSaveStatus;
  onChange: (values: Partial<AssessmentAcademicRulesFormValues>) => void;
  onCommit?: (values: Partial<AssessmentAcademicRulesFormValues>) => void;
}

export function AssessmentAcademicRules({
  idPrefix,
  values,
  readOnly = false,
  disabled = false,
  saveStatus = 'idle',
  onChange,
  onCommit,
}: AssessmentAcademicRulesProps) {
  const isDisabled = readOnly || disabled;

  const commit = (patch: Partial<AssessmentAcademicRulesFormValues>) => {
    onChange(patch);
    onCommit?.(patch);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Academic Rules</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Control completion, certificate eligibility, and progress blocking for this assessment.
          </p>
        </div>
        {saveStatus !== 'idle' ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-medium',
              saveStatus === 'error'
                ? 'text-destructive'
                : saveStatus === 'saved'
                  ? 'text-emerald-600'
                  : 'text-muted-foreground',
            )}
          >
            {saveStatus === 'saving' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {saveStatus === 'saved' ? <Check className="h-3 w-3" /> : null}
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
                ? 'Saved'
                : 'Not saved'}
          </span>
        ) : null}
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
            size="sm"
            checked={values.required}
            disabled={isDisabled}
            onCheckedChange={(checked) => commit({ required: checked })}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-3">
          <div className="space-y-1 pr-4">
            <Label htmlFor={`${idPrefix}-certificate`}>Counts Toward Certificate</Label>
            <p className="text-xs text-muted-foreground">
              Include this assessment in the overall grade used for certificate eligibility.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-certificate`}
            size="sm"
            checked={values.countsTowardCertificate}
            disabled={isDisabled}
            onCheckedChange={(checked) => commit({ countsTowardCertificate: checked })}
          />
        </div>

        <div className="flex items-start justify-between gap-4 rounded-md border px-3 py-3">
          <div className="space-y-1 pr-4">
            <Label htmlFor={`${idPrefix}-blocking`}>Block Progress Until Submitted</Label>
            <p className="text-xs text-muted-foreground">
              Learner cannot continue until they submit this assignment or attempt this quiz or
              exam. Certificate eligibility uses overall grade; the final exam must still be
              passed when it counts toward the certificate.
            </p>
          </div>
          <Switch
            id={`${idPrefix}-blocking`}
            size="sm"
            checked={values.blockProgressUntilPassed}
            disabled={isDisabled}
            onCheckedChange={(checked) => commit({ blockProgressUntilPassed: checked })}
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
              commit({ passingScore: Number(event.currentTarget.value) || 0 })
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
              commit({ maxAttempts: Number(event.currentTarget.value) || 1 })
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
    countsTowardCertificate: false,
    blockProgressUntilPassed: false,
    passingScore: 70,
    maxAttempts: 3,
    ...overrides,
  };
}
