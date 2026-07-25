'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LucideEdit3 } from 'lucide-react';
import type { CertificateTemplate, CourseListResponse, FilterType } from '@/types/certificate';
import type { Course } from '@/types/course';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CoursesTabProps {
  templates: CertificateTemplate[];
  defaultTemplateId: string | null;
  onAssignCertificate: (course: Course) => void;
  courseApi: {
    getCourses: (params?: {
      search?: string;
      limit?: number;
      page?: number;
    }) => Promise<CourseListResponse>;
  };
}

export function CoursesTab({
  templates,
  defaultTemplateId,
  onAssignCertificate,
  courseApi,
}: CoursesTabProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['courses-for-certificates', search, page],
    queryFn: () =>
      courseApi.getCourses({
        search: search || undefined,
        limit,
        page,
      }),
  });

  const total = data?.pagination?.total ?? 0;
  const totalPages = data?.pagination?.totalPages ?? 1;

  const getCertificateType = React.useCallback(
    (course: Course) => {
      if (!course.certificateTemplateId) return 'default';
      if (course.certificateTemplateId === defaultTemplateId) return 'default';
      return 'custom';
    },
    [defaultTemplateId],
  );

  const filteredCourses = useMemo(() => {
    const courses: Course[] = data?.data ?? [];

    if (filterType === 'all') return courses;
    if (filterType === 'assigned') {
      return courses.filter((course) => getCertificateType(course) === 'custom');
    }
    if (filterType === 'default') {
      return courses.filter((course) => getCertificateType(course) === 'default');
    }
    return courses;
  }, [data?.data, filterType, getCertificateType]);

  const tabs: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Courses' },
    { id: 'assigned', label: 'Custom Certificate' },
    { id: 'default', label: 'Using Default' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={filterType === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setFilterType(tab.id);
                setPage(1);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search courses..."
          className="max-w-sm"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Course</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Certificate</th>
              <th className="px-4 py-3 text-right text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Loading courses...
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={course.thumbnail || '/placeholder-course.png'}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {course.categories?.[0]?.category?.name ?? '-'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {course.certificateTemplate?.title ??
                      (course.certificateTemplateId === defaultTemplateId
                        ? 'Default template'
                        : 'Default')}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignCertificate(course)}
                    >
                      <LucideEdit3 className="mr-2 h-4 w-4" />
                      Assign Certificate
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} courses
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
