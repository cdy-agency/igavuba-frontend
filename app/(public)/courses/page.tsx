import CoursesPageClient from "@/components/Course/CoursesPageClient";
import { Suspense } from "react";

function CoursesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-4" />
        <div className="h-4 w-96 bg-gray-200 rounded-md animate-pulse mb-10" />

        {/* Filter Bar Skeleton */}
        <div className="flex gap-4 mb-10">
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Course Grid Skeleton */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="h-48 bg-gray-200 animate-pulse" />
              <div className="p-6 space-y-4">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse mt-4" />
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