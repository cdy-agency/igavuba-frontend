'use client';

import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CertificateTemplateThumbnail } from '@/components/certificate-builder/certificate-template-thumbnail';
import type { CertificateTemplate } from '@/types/certificate';

type AssignCourse = {
  id: string;
  title: string;
  certificateTemplateId: string | null;
};

interface AssignCertificateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: AssignCourse | null;
  templates: CertificateTemplate[];
  defaultTemplateId: string | null;
  onAssign: (courseId: string, templateId: string) => Promise<void>;
}

export function AssignCertificateDialog({
  isOpen,
  onClose,
  course,
  templates,
  defaultTemplateId,
  onAssign,
}: AssignCertificateDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!course) {
      setSelectedTemplateId('');
      return;
    }

    setSelectedTemplateId(
      course.certificateTemplateId ?? defaultTemplateId ?? templates[0]?.id ?? '',
    );
  }, [course, defaultTemplateId, templates]);

  const handleAssign = async () => {
    if (!course || !selectedTemplateId) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAssign(course.id, selectedTemplateId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="space-y-2 border-b border-border px-6 py-5 pr-12 text-left">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-xl font-semibold">Choose a template</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Select one of the options to continue for{' '}
            <span className="font-medium text-foreground">{course?.title ?? 'this course'}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(58vh,560px)] overflow-y-auto px-6 py-5">
          {templates.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 text-center">
              <p className="text-sm font-medium text-foreground">No certificate templates yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create a certificate design in the builder first, then come back to assign it to
                this course.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {templates.map((template) => (
                <CertificateTemplateThumbnail
                  key={template.id}
                  template={template}
                  selected={selectedTemplateId === template.id}
                  isDefault={template.id === defaultTemplateId}
                  onClick={() => setSelectedTemplateId(template.id)}
                  previewWidth={140}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedTemplateId || isSubmitting || templates.length === 0}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
