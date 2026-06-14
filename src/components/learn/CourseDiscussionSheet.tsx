'use client';

import { MessagesSquare } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface CourseDiscussionSheetProps {
  courseSlug: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
}

export function CourseDiscussionSheet({
  open,
  onOpenChange,
  courseTitle = 'Course',
}: CourseDiscussionSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{courseTitle} Discussion</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
          <MessagesSquare className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-sm text-muted-foreground">
            Course discussions will be available in a future update.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
