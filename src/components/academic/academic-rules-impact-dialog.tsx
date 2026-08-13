'use client';

import { ConfirmDialog } from '@/components/dialog/ConfirmDialog';

interface AcademicRulesImpactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  learnerCountHint?: string | null;
}

export function AcademicRulesImpactDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  learnerCountHint,
}: AcademicRulesImpactDialogProps) {
  return (
    <ConfirmDialog
      isOpen={open}
      onOpenChange={onOpenChange}
      title="These rules affect enrolled learners"
      description={
        learnerCountHint
          ? `${learnerCountHint} Changing passing score, attempts, required status, certificate counting, or progress blocking applies to students who are currently learning and those who already completed this assessment.`
          : 'This course is published. Changing passing score, attempts, required status, certificate counting, or progress blocking will affect students who are currently learning and those who already completed this assessment.'
      }
      confirmText="Save and apply"
      cancelText="Keep current rules"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
