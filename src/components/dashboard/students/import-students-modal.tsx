'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Download, Loader2, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { downloadStudentImportTemplate } from '@/api/student.api';
import {
  useConfirmStudentImport,
  usePreviewStudentImport,
} from '@/hooks/use-students';
import { downloadStudentImportReport } from '@/lib/student-import-report';
import { toast } from '@/lib/toast';
import type { StudentImportPreview, StudentImportSummary } from '@/types/student.types';

type Step = 'upload' | 'preview' | 'summary';

export function ImportStudentsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const previewImport = usePreviewStudentImport();
  const confirmImport = useConfirmStudentImport();

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<StudentImportPreview | null>(null);
  const [summary, setSummary] = useState<StudentImportSummary | null>(null);

  const resetState = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreview(null);
    setSummary(null);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const handleDownloadTemplate = async () => {
    const csv = await downloadStudentImportTemplate();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student-import-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleValidateFile = async () => {
    if (!selectedFile) return;

    const response = await previewImport.mutateAsync(selectedFile);
    setPreview(response.data);
    setStep('preview');
    toast.success(response.message || 'Import file validated successfully.');
  };

  const handleConfirmInvitations = async () => {
    if (!preview?.previewToken) return;

    const response = await confirmImport.mutateAsync({ previewToken: preview.previewToken });
    setSummary(response.data);
    setStep('summary');

    if (
      response.data.failedInvitations === 0 &&
      response.data.skipped === 0
    ) {
      toast.success('Import completed successfully.');
    }
  };

  const isBusy = previewImport.isPending || confirmImport.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Student Invitation</DialogTitle>
          <DialogDescription>
            {step === 'upload'
              ? 'Upload a CSV or Excel (.xlsx) file. Each valid student receives the same invitation email as a single invite.'
              : step === 'preview'
                ? 'Review validated students before sending invitation emails.'
                : 'Bulk invitation complete. Download the report for full details.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' ? (
          <div className="space-y-4">
            <Button type="button" variant="outline" onClick={() => void handleDownloadTemplate()}>
              <Download className="mr-2 h-4 w-4" />
              Download template
            </Button>

            <Input
              type="file"
              accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={(event) => {
                setPreview(null);
                setSummary(null);
                setSelectedFile(event.target.files?.[0] ?? null);
              }}
            />
          </div>
        ) : null}

        {step === 'preview' && preview ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Total rows</p>
                <p className="text-lg font-semibold">{preview.totalRows}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Valid rows</p>
                <p className="text-lg font-semibold text-emerald-600">{preview.validCount}</p>
              </div>
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="text-muted-foreground">Invalid rows</p>
                <p className="text-lg font-semibold text-destructive">{preview.invalidCount}</p>
              </div>
            </div>

            {preview.validStudents.length > 0 ? (
              <div className="rounded-md border">
                <div className="border-b bg-muted/30 px-4 py-2 text-sm font-medium">
                  Students to invite
                </div>
                <ul className="max-h-48 divide-y overflow-y-auto px-4 py-2 text-sm">
                  {preview.validStudents.map((student) => (
                    <li key={`${student.rowNumber}-${student.email}`} className="py-2">
                      {student.firstName} {student.lastName}
                      <span className="ml-2 text-muted-foreground">{student.email}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {preview.invalidRows.length > 0 ? (
              <div className="rounded-md border border-destructive/30">
                <div className="border-b bg-destructive/5 px-4 py-2 text-sm font-medium text-destructive">
                  Validation errors
                </div>
                <ul className="max-h-40 divide-y overflow-y-auto px-4 py-2 text-sm">
                  {preview.invalidRows.map((row) => (
                    <li key={`${row.rowNumber}-${row.reason}`} className="py-2">
                      <span className="font-medium">Row {row.rowNumber}</span>
                      {row.email ? (
                        <span className="ml-2 text-muted-foreground">{row.email}</span>
                      ) : null}
                      <p className="text-muted-foreground">{row.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 'summary' && summary ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Total records:</strong> {summary.totalRecords}
                </p>
                <p>
                  <strong>Successful invitations:</strong> {summary.successfulInvitations}
                </p>
                <p>
                  <strong>Failed invitations:</strong> {summary.failedInvitations}
                </p>
                <p>
                  <strong>Skipped:</strong> {summary.skipped}
                </p>
              </div>
            </div>

            {(summary.failedRows.length > 0 || summary.skippedRows.length > 0) && (
              <div className="rounded-md border p-4 text-sm">
                <p className="mb-2 font-medium">Issues</p>
                <ul className="max-h-40 list-disc space-y-1 overflow-y-auto pl-5 text-muted-foreground">
                  {[...summary.skippedRows, ...summary.failedRows].slice(0, 10).map((row) => (
                    <li key={`${row.rowNumber}-${row.reason}`}>
                      Row {row.rowNumber}: {row.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => downloadStudentImportReport(summary)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download import report
            </Button>
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-between">
          {step === 'preview' ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isBusy}
              onClick={() => setStep('upload')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              {step === 'summary' ? 'Close' : 'Cancel'}
            </Button>

            {step === 'upload' ? (
              <Button
                type="button"
                disabled={!selectedFile || isBusy}
                onClick={() => void handleValidateFile()}
              >
                {previewImport.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Validate file
              </Button>
            ) : null}

            {step === 'preview' ? (
              <Button
                type="button"
                disabled={!preview?.validCount || isBusy}
                onClick={() => void handleConfirmInvitations()}
              >
                {confirmImport.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirm invitations
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
