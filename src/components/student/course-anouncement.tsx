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
    className: "text-destructive bg-destructive/10 border-destructive/30",
  },
  assignment: {
    label: "Assignment",
    className: "text-primary bg-primary-subtle border-primary-muted",
  },
  grade: {
    label: "Grade",
    className: "text-success bg-success/10 border-success/30",
  },
  reminder: {
    label: "Reminder",
    className: "text-accent bg-accent/10 border-accent/30",
  },
  general: {
    label: "General",
    className: "text-muted-foreground bg-surface border-border",
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
  return <div className={`bg-muted animate-pulse rounded ${className}`} />;
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
    <div className="bg-surface min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* ── Header ── */}
        <div className="bg-background border border-border mb-4 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-surface border-b border-border">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold text-foreground">
                Announcements
              </h1>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <span className="bg-primary-muted text-primary-hover text-xs px-2.5 py-1 rounded-full font-semibold">
                    {unreadCount} unread
                  </span>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="px-6 flex gap-6 border-b border-border bg-background">
            {(["all", "unread", "pinned"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-sm py-3 border-b-2 capitalize transition-colors ${
                  filter === tab
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
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
                    className="bg-background border border-border rounded-lg p-4 space-y-2"
                  >
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-background border border-border rounded-lg p-12 flex flex-col items-center gap-3 text-muted-foreground">
                <Bell className="w-10 h-10 opacity-30" />
                <p className="text-sm">No announcements match this filter</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-border divide-y divide-border">
                {filtered.map((a) => {
                  const cfg = getConfig(a.type);
                  const isActive = selectedId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleSelect(a)}
                      className={`px-5 py-4 cursor-pointer transition-colors hover:bg-surface
                        ${!a.isRead ? "bg-primary-subtle hover:bg-primary-subtle/80" : "bg-background"}
                        ${isActive ? "ring-2 ring-inset ring-primary-light" : ""}
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Badges row */}
                          <div className="flex items-center gap-2 mb-1.5">
                            {a.isPinned && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                                Pinned
                              </span>
                            )}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${cfg.className}`}
                            >
                              {cfg.label}
                            </span>
                            {!a.isRead && (
                              <div className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0" />
                            )}
                          </div>

                          <h3
                            className={`text-sm font-semibold mb-1 truncate ${!a.isRead ? "text-foreground" : "text-foreground-muted"}`}
                          >
                            {a.title}
                          </h3>

                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                            {a.content}
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
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
                            <Paperclip className="w-3.5 h-3.5 text-foreground-subtle" />
                          )}
                          <ChevronRight className="w-4 h-4 text-foreground-subtle" />
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
              <div className="bg-background border border-border rounded-lg overflow-hidden sticky top-6">
                <div className="px-5 py-4 bg-surface border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getConfig(selected.type).className}`}
                    >
                      {getConfig(selected.type).label}
                    </span>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-muted-foreground hover:text-muted-foreground transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-base font-semibold text-foreground leading-snug">
                    {selected.title}
                  </h2>
                </div>

                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground-muted">
                      From: {selected.author}
                    </span>
                    {selected.isPinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary-muted text-primary-hover rounded-full uppercase">
                        Pinned
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {new Date(selected.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>

                  <p className="text-sm text-foreground-muted leading-relaxed whitespace-pre-wrap">
                    {selected.content}
                  </p>

                  {selected.hasAttachment && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <button className="flex items-center gap-1.5 text-xs text-primary hover:text-primary-active transition-colors">
                        <Paperclip className="w-3.5 h-3.5" />
                        View Attachment
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-background border border-border rounded-lg p-10 flex flex-col items-center gap-3 text-muted-foreground sticky top-6">
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
