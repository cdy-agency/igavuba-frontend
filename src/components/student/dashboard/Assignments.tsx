"use client";

import { ClipboardList, ChevronRight, Clock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardAssignment } from "@/types/student/dashboard";
import {
  formatDistanceToNow,
  isPast,
  isWithinInterval,
  addDays,
} from "date-fns";

interface AssignmentsProps {
  assignments: DashboardAssignment[];
}

const PREVIEW_LIMIT = 5;

function getDueBadge(dueDate: string) {
  const due = new Date(dueDate);
  const now = new Date();
  if (isPast(due)) return { label: "Overdue", cls: "bg-red-100 text-red-700" };
  if (isWithinInterval(due, { start: now, end: addDays(now, 3) }))
    return { label: "Due soon", cls: "bg-orange-100 text-orange-700" };
  return { label: "Upcoming", cls: "bg-blue-100 text-blue-700" };
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function safeDueLabel(dateStr?: string): string {
  if (!dateStr) return "No due date";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "No due date";
  return formatDistanceToNow(d, { addSuffix: true });
}

function filterActive(items: DashboardAssignment[]): DashboardAssignment[] {
  return items.filter((item) => {
    if (!item.dueDate) return true;
    const due = new Date(item.dueDate);
    return isNaN(due.getTime()) || !isPast(due);
  });
}

export default function Assignments({ assignments }: AssignmentsProps) {
  const router = useRouter();
  const active = filterActive(assignments);
  const preview = active.slice(0, PREVIEW_LIMIT);
  const hasMore = active.length > PREVIEW_LIMIT;

  if (!active.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Assignments</h2>
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <ClipboardList className="w-8 h-8 opacity-40" />
          <p className="text-sm font-medium">No pending assignments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
          {active.length} pending
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {preview.map((item) => {
          const badge = getDueBadge(item.dueDate);
          const timeLeft = safeDueLabel(item.dueDate);
          const preview = stripHtml(item.description).slice(0, 60);

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/student/assignments/${item._id}`)}
              className="flex items-start gap-3 p-3.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100 group"
            >
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <ClipboardList className="w-4 h-4 text-indigo-600" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Title + due badge */}
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {item.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-gray-500 truncate mb-1">
                  {preview}…
                </p>

                {/* Course title · due · points */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium truncate">
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    {item.course_id?.title ?? "—"}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {timeLeft}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 flex-shrink-0">
                    {item.points} pts
                  </span>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-1" />
            </div>
          );
        })}
      </div>

      {/* View All — shown only when there are more than PREVIEW_LIMIT */}
      {hasMore && (
        <button
          onClick={() => router.push("/student/assignments")}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          View all {active.length} assignments
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
