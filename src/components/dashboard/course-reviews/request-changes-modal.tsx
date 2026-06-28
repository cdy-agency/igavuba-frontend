'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { ReviewCommentInput } from '@/types/course-review';

interface RequestChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (comments: ReviewCommentInput[]) => void;
}

const emptyComment = (): ReviewCommentInput => ({
  title: '',
  comment: '',
  location: '',
});

export function RequestChangesModal({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: RequestChangesModalProps) {
  const [comments, setComments] = useState<ReviewCommentInput[]>([emptyComment()]);

  const handleSubmit = () => {
    const valid = comments.filter(
      (entry) => entry.title.trim() && entry.comment.trim(),
    );
    if (valid.length === 0) return;
    onSubmit(
      valid.map((entry) => ({
        title: entry.title.trim(),
        comment: entry.comment.trim(),
        location: entry.location?.trim() || undefined,
      })),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Request changes</DialogTitle>
          <DialogDescription>
            Add one or more comments describing what the course owner should fix before resubmission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {comments.map((entry, index) => (
            <div key={index} className="space-y-3 rounded-lg border border-border/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Comment {index + 1}</p>
                {comments.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setComments((current) => current.filter((_, i) => i !== index))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`comment-title-${index}`}>Title</Label>
                <Input
                  id={`comment-title-${index}`}
                  value={entry.title}
                  onChange={(event) =>
                    setComments((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, title: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="e.g. Learning outcomes are missing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`comment-body-${index}`}>Comment</Label>
                <Textarea
                  id={`comment-body-${index}`}
                  value={entry.comment}
                  onChange={(event) =>
                    setComments((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, comment: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="Describe the required change..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`comment-location-${index}`}>Location (optional)</Label>
                <Input
                  id={`comment-location-${index}`}
                  value={entry.location ?? ''}
                  onChange={(event) =>
                    setComments((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, location: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="e.g. Module 3 — Quiz 2"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setComments((current) => [...current, emptyComment()])}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add another comment
          </Button>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Request changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function contentTypeLabel(type: string) {
  switch (type) {
    case 'QUIZ':
      return 'Quiz';
    case 'ASSIGNMENT':
      return 'Assignment';
    case 'VIDEO':
      return 'Video';
    case 'DOCUMENT':
      return 'Document';
    default:
      return 'Lesson';
  }
}
