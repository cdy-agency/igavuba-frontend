"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock, BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useNewCourses } from "@/lib/hooks/landing/use-landing-data";

// Soft background colours cycled per card (no backend field needed)
const CARD_COLORS = [
  "bg-green-50",
  "bg-blue-50",
  "bg-yellow-50",
  "bg-purple-50",
  "bg-orange-50",
  "bg-pink-50",
];

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner:     "text-green-700 bg-green-100",
  intermediate: "text-yellow-700 bg-yellow-100",
  advanced:     "text-red-700 bg-red-100",
};

const CARDS_PER_PAGE = 3;

export default function RecommendedCourses() {
  const { newCourses, loading } = useNewCourses();
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(newCourses.length / CARDS_PER_PAGE);
  const visible    = newCourses.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const prev = () => setPage((p) => Math.max(0, p - 1));
  const next = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="bg-white rounded p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Recommended for you</h2>
          {!loading && newCourses.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{newCourses.length} new courses available</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={page === 0}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={next}
              disabled={page === totalPages - 1}
              className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>

      {/* Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse min-h-[260px]" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && newCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
          <BookOpen className="w-8 h-8 opacity-40" />
          <p className="text-sm font-medium">No new courses available right now</p>
        </div>
      )}

      {/* Cards */}
      {!loading && newCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visible.map((course, idx) => {
            const bg         = CARD_COLORS[(page * CARDS_PER_PAGE + idx) % CARD_COLORS.length];
            const difficulty = DIFFICULTY_COLORS[course.difficulty_level] ?? "text-gray-700 bg-gray-100";

            return (
              <div
                key={course._id}
                className={`${bg} rounded p-5 flex flex-col justify-between min-h-[260px] transition-all hover:shadow-md`}
              >
                {/* Top section */}
                <div className="flex-1">
                  {/* Thumbnail or gradient placeholder */}
                  <div className="relative w-full h-28 rounded overflow-hidden mb-4">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500" />
                    )}
                  </div>

                  {/* Category + difficulty */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide truncate">
                      {course.category?.name ?? "—"}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${difficulty}`}>
                      {course.difficulty_level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {course.duration_weeks && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration_weeks}w
                      </span>
                    )}
                    <span className="font-semibold text-gray-700 ml-auto">
                      {course.price === 0 ? "Free" : `${course.price.toLocaleString()} RWF`}
                    </span>
                  </div>
                </div>

                {/* Enroll button */}
                <Link href={`/course/${course._id}`} className="mt-4 block">
                  <button className="w-full text-primary  underline hover:text-primary/80 text-sm font-medium flex items-center justify-center gap-2">
                    View Course
                  </button>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === page ? "bg-indigo-600 w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}