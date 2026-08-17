'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Loader2,
  Mail,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadStudentImportTemplate } from '@/api/student.api';
import {
  useConfirmStudentImport,
  usePreviewStudentImport,
} from '@/hooks/use-students';
import { downloadStudentImportReport } from '@/lib/student-import-report';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import type { StudentImportPreview, StudentImportSummary } from '@/types/student.types';

type Step = 'upload' | 'preview' | 'summary';

const ACCEPTED_TYPES = [
  '.csv',
  '.xlsx',
  '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
].join(',');

const TEMPLATE_COLUMNS = [
  'Student ID',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Department',
  'Program',
  'Year of Study',
  'Semester',
];

const STEPS: { id: Step; label: string }[] = [
  { id: 'upload', label: 'Upload' },
  { id: 'preview', label: 'Review' },
  { id: 'summary', label: 'Complete' },
];

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = step.id === current;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 ? (
              <div
                className={cn(
                  'hidden h-px w-6 sm:block',
                  isComplete || isCurrent ? 'bg-primary/40' : 'bg-border',
                )}
              />
            ) : null}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold',
                  isComplete && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/15 text-primary ring-2 ring-primary/30',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
                )}
              >
                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'neutral' | 'success' | 'danger';
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        tone === 'success' && 'border-emerald-200/80 bg-emerald-50/50',
        tone === 'danger' && 'border-destructive/25 bg-destructive/5',
        tone === 'neutral' && 'border-border/60 bg-muted/20',
      )}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          'mt-1 text-2xl font-semibold tabular-nums tracking-tight',
          tone === 'success' && 'text-emerald-700',
          tone === 'danger' && 'text-destructive',
          tone === 'neutral' && 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function ImportStudentsModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const previewImport = usePreviewStudentImport();
  const confirmImport = useConfirmStudentImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<StudentImportPreview | null>(null);
  const [summary, setSummary] = useState<StudentImportSummary | null>(null);

  const resetState = () => {
    setStep('upload');
    setSelectedFile(null);
    setIsDragging(false);
    setPreview(null);
    setSummary(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState();
    }
    onOpenChange(nextOpen);
  };

  const applyFile = useCallback((file: File | null) => {
    setPreview(null);
    setSummary(null);
    setSelectedFile(file);
  }, []);

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

    if (response.data.failedInvitations === 0 && response.data.skipped === 0) {
      toast.success('Import completed successfully.');
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0] ?? null;
    if (file) applyFile(file);
  };

  const isBusy = previewImport.isPending || confirmImport.isPending;

  const stepDescription =
    step === 'upload'
      ? 'Upload a CSV or Excel file to invite multiple internal students at once.'
      : step === 'preview'
        ? 'Review validated rows before sending invitation emails.'
        : 'Bulk invitation finished. Download the report for full details.';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:rounded-xl">
        <DialogHeader className="shrink-0 space-y-4 border-b border-border/60 bg-muted/30 px-6 py-5 pr-12">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1 space-y-1 pt-0.5">
              <DialogTitle className="text-lg">Bulk Student Invitation</DialogTitle>
              <DialogDescription className="text-[13px] leading-relaxed">
                {stepDescription}
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <StepIndicator current={step} />
            {step === 'upload' ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-xs text-amber-900">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Invitation links expire after 24 hours.</span>
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {step === 'upload' ? (
            <div className="space-y-5">
              <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold text-foreground">Start with the template</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Download the CSV template, fill in your roster, then upload it below. Required
                      columns: Student ID, First Name, Last Name, and Email.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {TEMPLATE_COLUMNS.map((column) => (
                        <span
                          key={column}
                          className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => void handleDownloadTemplate()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download template
                  </Button>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Upload roster file</h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES}
                  className="sr-only"
                  onChange={(event) => applyFile(event.target.files?.[0] ?? null)}
                />

                {!selectedFile ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        fileInputRef.current?.click();
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border/80 bg-muted/10 hover:border-primary/40 hover:bg-muted/20',
                    )}
                  >
                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Upload className="h-5 w-5" />
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop your file here
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      or click to browse — CSV or Excel (.xlsx)
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                      <FileSpreadsheet className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(selectedFile.size)} · Ready to validate
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => applyFile(null)}
                      disabled={isBusy}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                )}
              </section>
            </div>
          ) : null}

          {step === 'preview' && preview ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Total rows" value={preview.totalRows} />
                <StatCard label="Valid rows" value={preview.validCount} tone="success" />
                <StatCard label="Invalid rows" value={preview.invalidCount} tone="danger" />
              </div>

              {preview.validStudents.length > 0 ? (
                <section className="overflow-hidden rounded-xl border border-border/60">
                  <div className="flex items-center gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Students to invite ({preview.validStudents.length})
                    </h3>
                  </div>
                  <ul className="max-h-52 divide-y divide-border/60 overflow-y-auto">
                    {preview.validStudents.map((student) => (
                      <li
                        key={`${student.rowNumber}-${student.email}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {student.firstName.charAt(0)}
                          {student.lastName.charAt(0)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                        </div>
                        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                          Row {student.rowNumber}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {preview.invalidRows.length > 0 ? (
                <section className="overflow-hidden rounded-xl border border-destructive/25">
                  <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/5 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-semibold text-destructive">
                      Validation errors ({preview.invalidRows.length})
                    </h3>
                  </div>
                  <ul className="max-h-44 divide-y divide-destructive/10 overflow-y-auto">
                    {preview.invalidRows.map((row) => (
                      <li key={`${row.rowNumber}-${row.reason}`} className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-medium text-foreground">Row {row.rowNumber}</span>
                          {row.email ? (
                            <span className="text-muted-foreground">{row.email}</span>
                          ) : null}
                        </div>
                        <p className="mt-0.5 text-xs text-destructive/90">{row.reason}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}

          {step === 'summary' && summary ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-emerald-900">Bulk invitation complete</p>
                    <p className="text-xs leading-relaxed text-emerald-800/80">
                      {summary.successfulInvitations} invitation
                      {summary.successfulInvitations === 1 ? '' : 's'} sent successfully.
                      {summary.failedInvitations > 0 || summary.skipped > 0
                        ? ' Review the report for rows that failed or were skipped.'
                        : ' All valid rows were processed.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <StatCard label="Total records" value={summary.totalRecords} />
                <StatCard
                  label="Successful invitations"
                  value={summary.successfulInvitations}
                  tone="success"
                />
                <StatCard
                  label="Failed invitations"
                  value={summary.failedInvitations}
                  tone={summary.failedInvitations > 0 ? 'danger' : 'neutral'}
                />
                <StatCard label="Skipped" value={summary.skipped} />
              </div>

              {(summary.failedRows.length > 0 || summary.skippedRows.length > 0) && (
                <section className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <p className="mb-2 text-sm font-semibold text-foreground">Issues</p>
                  <ul className="max-h-40 space-y-2 overflow-y-auto text-sm text-muted-foreground">
                    {[...summary.skippedRows, ...summary.failedRows].slice(0, 10).map((row) => (
                      <li key={`${row.rowNumber}-${row.reason}`} className="flex gap-2">
                        <span className="shrink-0 font-medium text-foreground">
                          Row {row.rowNumber}:
                        </span>
                        <span>{row.reason}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => downloadStudentImportReport(summary)}
              >
                <Download className="mr-2 h-4 w-4" />
                Download import report
              </Button>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/60 bg-background px-6 py-4 sm:justify-between">
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
            <span className="hidden sm:inline" />
          )}

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isBusy}
            >
              {step === 'summary' ? 'Close' : 'Cancel'}
            </Button>

            {step === 'upload' ? (
              <Button
                type="button"
                disabled={!selectedFile || isBusy}
                className="min-w-[140px]"
                onClick={() => void handleValidateFile()}
              >
                {previewImport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Validate file
                  </>
                )}
              </Button>
            ) : null}

            {step === 'preview' ? (
              <Button
                type="button"
                disabled={!preview?.validCount || isBusy}
                className="min-w-[180px]"
                onClick={() => void handleConfirmInvitations()}
              >
                {confirmImport.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send {preview?.validCount ?? 0} invitation
                    {(preview?.validCount ?? 0) === 1 ? '' : 's'}
                  </>
                )}
              </Button>
            ) : null}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
