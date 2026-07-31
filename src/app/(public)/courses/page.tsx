import CoursesPageClient from '@/components/Course/CoursesPageClient';
import { Suspense } from 'react';

function CoursesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-4 h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
        <div className="mb-10 h-4 w-96 animate-pulse rounded-md bg-gray-200" />

        <div className="mb-10 flex gap-4">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <div className="h-48 animate-pulse bg-gray-200" />
              <div className="space-y-4 p-6">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="mt-4 h-8 w-28 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<CoursesLoading />}>
      <CoursesPageClient />
    </Suspense>
  );
}
