"use client";

import { useRouter } from "next/navigation";
import { IEnrollment } from "@/types/education";
import { Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseProgressProps {
  enrollments: IEnrollment[];
}

export default function CourseProgress({ enrollments }: CourseProgressProps) {
  const router = useRouter();

  const handleCourseClick = (courseId: string | undefined) => {
    if (courseId) {
      router.push(`/student/courses/${courseId}`);
    }
  };

  return (
    <div className="bg-white p-2">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Course You&apos;re Taking
      </h2>

      {/* Table Header */}
      {enrollments.length > 0 && (
        <div className="grid grid-cols-12 gap-4 pb-3 mb-4 border-b border-gray-100 text-sm text-gray-500 font-medium">
          <div className="col-span-4">Course Title</div>
          <div className="col-span-3">Lessons Completed</div>
          <div className="col-span-3">Duration</div>
          <div className="col-span-2">Instructor</div>
        </div>
      )}

      {/* Course List */}
      <div className="space-y-3 ">
        {enrollments.length > 0 ? (
          enrollments.map((enrollment) => {
            const completionPercentage =
              enrollment.totalLessons > 0
                ? Math.round(
                    (enrollment.completedLessons / enrollment.totalLessons) *
                      100,
                  )
                : 0;

            return (
              <div
                key={enrollment._id}
                onClick={() => handleCourseClick(enrollment.course_id?._id)}
                className="grid grid-cols-12 gap-4 items-center p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors border border-gray-100"
              >
                {/* Course Title with Icon */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className="relative w-7 h-7 rounded overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
                    <Image
                      src={
                        enrollment?.course_id?.thumbnail ||
                        "/course-placeholder.png"
                      }
                      alt={enrollment?.course_id?.title ?? "Course thumbnail"}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  </div>

                  <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                    {enrollment.course_id?.title || "Course Title"}
                  </span>
                </div>

                {/* Lessons Progress */}
                <div className="col-span-3">
                  <span className="text-gray-700 font-medium text-sm">
                    {completionPercentage}%
                  </span>
                </div>

                {/* Duration */}
                <div className="col-span-3">
                  <span className="text-gray-600">
                    {calculateDuration(
                      enrollment.enrolled_at,
                      enrollment.lastAccessed,
                    )}
                  </span>
                </div>

                {/* Instructor */}
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {getInitials(enrollment.course_id?.instructor_id)}
                    </span>
                  </div>
                  <span className="text-gray-700 text-sm truncate">
                    {enrollment.course_id?.instructor_id || "Instructor"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <div className="flex items-center justify-center mx-auto mb-2">
              <Image
                src="/empty.png"
                alt={"Empty State"}
                width={150}
                height={150}
                className="object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No courses yet
            </h3>
            <Link
              href="/course"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function calculateDuration(enrolledAt: string, lastAccessed: string): string {
  const start = new Date(enrolledAt);
  const end = new Date(lastAccessed);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffDays * 24) % 24);
  const minutes = Math.floor((diffTime / (1000 * 60)) % 60);

  if (diffDays > 0) {
    return `${diffDays}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

function getInitials(name: any): string {
  if (!name) return "IN";
  if (typeof name === "string") {
    const parts = name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }
  return "IN";
}
