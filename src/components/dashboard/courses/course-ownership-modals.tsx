'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAssignCourseOwner,
  useEligibleCourseOwners,
  useTransferCourseOwnership,
} from '@/hooks/use-course-ownership';
import type { EligibleCourseOwner } from '@/types/course';
import { getRoleLabel } from '@/lib/role-utils';
import { UserRole } from '@/types/enum';

function formatOwnerLabel(name: string | null, email: string, role: string) {
  const displayName = name?.trim() || email;
  return `${displayName} (${getRoleLabel(role as UserRole)})`;
}

export function AssignCourseOwnerModal({
  courseIdOrSlug,
  open,
  onOpenChange,
}: {
  courseIdOrSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [ownerId, setOwnerId] = useState('');
  const { data: owners = [], isPending } = useEligibleCourseOwners(courseIdOrSlug, open);
  const assignOwner = useAssignCourseOwner(courseIdOrSlug);

  useEffect(() => {
    if (!open) {
      setOwnerId('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!ownerId) return;
    await assignOwner.mutateAsync({ ownerId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Course Owner</DialogTitle>
          <DialogDescription>
            Select a lecturer or institution admin to own this course.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>Owner</Label>
          {isPending ? (
            <div className="flex h-10 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <Select value={ownerId || undefined} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map((owner: EligibleCourseOwner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {formatOwnerLabel(owner.name, owner.email, owner.role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!ownerId || assignOwner.isPending}
          >
            {assignOwner.isPending ? 'Assigning...' : 'Assign Owner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TransferCourseOwnershipModal({
  courseIdOrSlug,
  currentOwnerId,
  open,
  onOpenChange,
}: {
  courseIdOrSlug: string;
  currentOwnerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [ownerId, setOwnerId] = useState('');
  const { data: owners = [], isPending } = useEligibleCourseOwners(courseIdOrSlug, open);
  const transferOwnership = useTransferCourseOwnership(courseIdOrSlug);

  const eligibleOwners = owners.filter(
    (owner: EligibleCourseOwner) => owner.id !== currentOwnerId,
  );

  useEffect(() => {
    if (!open) {
      setOwnerId('');
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!ownerId) return;
    await transferOwnership.mutateAsync({ ownerId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Ownership</DialogTitle>
          <DialogDescription>
            Transfer this course to another lecturer or institution admin. All content
            remains intact.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label>New owner</Label>
          {isPending ? (
            <div className="flex h-10 items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : (
            <Select value={ownerId || undefined} onValueChange={setOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select new owner" />
              </SelectTrigger>
              <SelectContent>
                {eligibleOwners.map((owner: EligibleCourseOwner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {formatOwnerLabel(owner.name, owner.email, owner.role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!ownerId || transferOwnership.isPending}
          >
            {transferOwnership.isPending ? 'Transferring...' : 'Transfer Ownership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
