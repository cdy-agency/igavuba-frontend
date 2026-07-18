'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useGrantAssessmentAttempt } from '@/hooks/use-academic';

interface GrantAttemptDialogProps {
  assessmentId: string;
  learnerProfileId: string;
  learnerName?: string | null;
  assessmentTitle?: string;
  courseIdOrSlug?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GrantAttemptDialog({
  assessmentId,
  learnerProfileId,
  learnerName,
  assessmentTitle,
  courseIdOrSlug,
  open,
  onOpenChange,
}: GrantAttemptDialogProps) {
  const [reason, setReason] = useState('');
  const grantAttempt = useGrantAssessmentAttempt(assessmentId, courseIdOrSlug);

  const handleSubmit = async () => {
    await grantAttempt.mutateAsync({
      learnerProfileId,
      reason: reason.trim() || undefined,
      attemptsGranted: 1,
    });
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Additional Attempt</DialogTitle>
          <DialogDescription>
            Grant another attempt{learnerName ? ` for ${learnerName}` : ''}
            {assessmentTitle ? ` on "${assessmentTitle}"` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="grant-attempt-reason">Reason (optional)</Label>
          <Textarea
            id="grant-attempt-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Explain why an additional attempt is being granted..."
            rows={4}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={grantAttempt.isPending}>
            {grantAttempt.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Grant Attempt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface GrantAttemptButtonProps {
  assessmentId: string;
  learnerProfileId: string;
  learnerName?: string | null;
  assessmentTitle?: string;
  courseIdOrSlug?: string;
  visible?: boolean;
}

export function GrantAttemptButton({
  assessmentId,
  learnerProfileId,
  learnerName,
  assessmentTitle,
  courseIdOrSlug,
  visible = true,
}: GrantAttemptButtonProps) {
  const [open, setOpen] = useState(false);

  if (!visible) return null;

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Grant Additional Attempt
      </Button>
      <GrantAttemptDialog
        assessmentId={assessmentId}
        learnerProfileId={learnerProfileId}
        learnerName={learnerName}
        assessmentTitle={assessmentTitle}
        courseIdOrSlug={courseIdOrSlug}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
