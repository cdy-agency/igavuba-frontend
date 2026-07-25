'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Search, ShieldCheck, UserCircle2 } from 'lucide-react';
import { RoleGuard } from '@/guards/role-guard';
import { UserRole } from '@/types/enum';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAuditLogs } from '@/api/audit.api';
import type { AuditLogEntry } from '@/types/audit';

const PAGE_SIZE = 12;

const StatusFilters: Array<{ value: AuditLogEntry['status'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'SUCCESS', label: 'Success' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PENDING', label: 'Pending' },
];

const CategoryFilters: Array<{ value: AuditLogEntry['category'] | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All categories' },
  { value: 'AUTHENTICATION', label: 'Authentication' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'LECTURER', label: 'Lecturer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'COURSE', label: 'Course' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'SYSTEM', label: 'System' },
];

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}

function statusTone(status: AuditLogEntry['status']) {
  switch (status) {
    case 'FAILED':
      return 'border-red-200 bg-red-100 text-red-700';
    case 'PENDING':
      return 'border-amber-200 bg-amber-100 text-amber-700';
    default:
      return 'border-emerald-200 bg-emerald-100 text-emerald-700';
  }
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AuditLogEntry['status'] | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<AuditLogEntry['category'] | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useMemo(
    () => async () => {
      setIsLoading(true);
      try {
        const auditLogs = await getAuditLogs({
          page,
          limit: PAGE_SIZE,
          search: query || undefined,
          status: statusFilter === 'ALL' ? undefined : statusFilter,
          category: categoryFilter === 'ALL' ? undefined : categoryFilter,
        });

        setLogs(auditLogs.data);
        setTotalPages(auditLogs.pagination.totalPages || 1);
      } finally {
        setIsLoading(false);
      }
    },
    [page, query, statusFilter, categoryFilter],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <div className="space-y-6">
        <PageHeader
          title="Audit Logs"
          description="Review privileged business actions taken across the learning platform."
          badge="Super Admin"
        />

        <Card className="rounded-3xl border border-border/80 bg-card">
          <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Audit logs</CardTitle>
              <p className="text-sm text-muted-foreground">Search and filter audit events for quick review.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full min-w-[16rem] sm:w-[22rem]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search actor, action, institution..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => void loadData()}>
                Refresh
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/80 bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Status</p>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as AuditLogEntry['status'] | 'ALL');
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="mt-3 h-10 w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    {StatusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Category</p>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => {
                    setCategoryFilter(value as AuditLogEntry['category'] | 'ALL');
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="mt-3 h-10 w-full">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {CategoryFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card">
              <Table className="min-w-full text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18%]">Time</TableHead>
                    <TableHead className="w-[20%]">Actor</TableHead>
                    <TableHead className="w-[22%]">Action</TableHead>
                    <TableHead className="w-[20%]">Entity</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <TableRow key={index} className="animate-pulse">
                        <TableCell colSpan={5} className="h-14" />
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No audit logs match your current filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="whitespace-nowrap text-[13px] text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0">
                            <span className="font-medium text-sm text-foreground">{entry.actorName || 'System'}</span>
                            <span className="text-[11px] text-muted-foreground">{entry.actorRole || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{entry.action}</div>
                          <div className="text-[11px] text-muted-foreground">{entry.category}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{entry.entityName || entry.entityType || '—'}</div>
                          <div className="text-[11px] text-muted-foreground">{entry.institutionName || 'Global'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                            <span className={statusTone(entry.status)}>{entry.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
