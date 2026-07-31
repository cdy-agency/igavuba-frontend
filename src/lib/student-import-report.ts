import type { StudentImportSummary } from '@/types/student.types';

export function buildStudentImportReportCsv(summary: StudentImportSummary): string {
  const lines = [
    'Section,Row,Email,Reason',
    `Summary,Total Records,${summary.totalRecords},`,
    `Summary,Successful Invitations,${summary.successfulInvitations},`,
    `Summary,Failed Invitations,${summary.failedInvitations},`,
    `Summary,Skipped,${summary.skipped},`,
  ];

  for (const email of summary.importedEmails) {
    lines.push(`Successful,,${email},Invitation sent`);
  }
  for (const row of summary.skippedRows) {
    lines.push(`Skipped,${row.rowNumber},${row.email},"${row.reason.replace(/"/g, '""')}"`);
  }
  for (const row of summary.failedRows) {
    lines.push(
      `Failed,${row.rowNumber},${row.email ?? ''},"${row.reason.replace(/"/g, '""')}"`,
    );
  }

  return lines.join('\n');
}

export function downloadStudentImportReport(summary: StudentImportSummary) {
  const csv = buildStudentImportReportCsv(summary);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `student-import-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
