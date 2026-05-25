"use client";

import React, { useState, useMemo } from "react";
import { Paperclip, ChevronRight, X, Bell } from "lucide-react";
import { useCourseAnnouncements } from "@/lib/hooks/announcements/useCourseAnnouncements";

type AnnouncementType =
  | "general"
  | "assignment"
  | "grade"
  | "reminder"
  | "urgent";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  date: string;
  author: string;
  isRead: boolean;
  isPinned: boolean;
  hasAttachment: boolean;
}
const TYPE_CONFIG: Record<
  AnnouncementType,
  { label: string; className: string }
> = {
  urgent: {
    label: "Urgent",
    className: "text-red-600 bg-red-50 border-red-200",
  },
  assignment: {
    label: "Assignment",
    className: "text-blue-600 bg-blue-50 border-blue-200",
  },
  grade: {
    label: "Grade",
    className: "text-green-600 bg-green-50 border-green-200",
  },
  reminder: {
    label: "Reminder",
    className: "text-yellow-600 bg-yellow-50 border-yellow-200",
  },
  general: {
    label: "General",
    className: "text-gray-600 bg-gray-50 border-gray-200",
  },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type as AnnouncementType] ?? TYPE_CONFIG.general;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-100 animate-pulse rounded ${className}`} />;
}

// Component
export default function CourseAnnouncements({
  courseId,
}: {
  courseId: string;
}) {
  const { data: raw = [], isLoading } = useCourseAnnouncements(courseId);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "pinned">("all");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const announcements = useMemo<Announcement[]>(() => {
    return raw.map((a: any) => ({
      id: a._id || a.id,
      title: a.title ?? "",
      content: stripHtml(a.content ?? ""),
      type: (a.type ?? "general") as AnnouncementType,
      date: a.created_at || a.publish_at || new Date().toISOString(),
      author: a.author?.name ?? "Instructor",
      isRead: readIds.has(a._id || a.id),
      isPinned: !!a.is_pinned,
      hasAttachment: Array.isArray(a.attachments) && a.attachments.length > 0,
    }));
  }, [raw, readIds]);

  const filtered = announcements.filter((a) => {
    if (filter === "unread") return !a.isRead;
    if (filter === "pinned") return a.isPinned;
    return true;
  });

  const unreadCount = announcements.filter((a) => !a.isRead).length;
  const selected = announcements.find((a) => a.id === selectedId) ?? null;

  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(announcements.map((a) => a.id)));

  const handleSelect = (a: Announcement) => {
    setSelectedId(a.id);
    markRead(a.id);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* ── Header ── */}
        <div className="bg-white border border-gray-200 mb-4 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                Announcements
              </h1>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                    {unreadCount} unread
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-6 flex gap-6 border-b border-gray-200 bg-white">
            {(["all", "unread", "pinned"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-sm py-3 border-b-2 capitalize transition-colors ${
                  filter === tab
                    ? "border-blue-500 text-blue-600 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab === "all"
                  ? "All Announcements"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ── List */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 flex flex-col items-center gap-3 text-gray-400">
                <Bell className="w-10 h-10 opacity-30" />
                <p className="text-sm">No announcements match this filter</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-gray-200 divide-y divide-gray-100">
                {filtered.map((a) => {
                  const cfg = getConfig(a.type);
                  const isActive = selectedId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleSelect(a)}
                      className={`px-5 py-4 cursor-pointer transition-colors hover:bg-gray-50
                        ${!a.isRead ? "bg-blue-50 hover:bg-blue-50/80" : "bg-white"}
                        ${isActive ? "ring-2 ring-inset ring-blue-400" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {a.isPinned && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase">
                                Pinned
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${cfg.className}`}
                            >
                              {cfg.label}
                            </span>
                            {!a.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                          </div>

                          <h3
                            className={`text-sm font-semibold mb-1 truncate ${!a.isRead ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {a.title}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-1 mb-2">
                            {a.content}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-gray-400">
                            <span>By {a.author}</span>
                            <span>
                              {new Date(a.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                          {a.hasAttachment && (
                            <Paperclip className="w-3.5 h-3.5 text-gray-300" />
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Detail panel ── */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-6">
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getConfig(selected.type).className}`}
                    >
                      {getConfig(selected.type).label}
                    </span>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 leading-snug">
                    {selected.title}
                  </h2>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      From: {selected.author}
                    </span>
                    {selected.isPinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full uppercase">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(selected.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selected.content}
                  </p>

                  {selected.hasAttachment && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        View Attachment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-10 flex flex-col items-center gap-3 text-gray-400 sticky top-6">
                <Bell className="w-10 h-10 opacity-20" />
                <p className="text-xs text-center">
                  Select an announcement to read it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
