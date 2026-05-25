"use client";

import { ChevronRight, Bell, AlertCircle, GraduationCap, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardAnnouncement } from "@/types/student/dashboard";
import { formatDistanceToNow, isPast } from "date-fns";

interface AnnouncementsProps {
  announcements: DashboardAnnouncement[];
}

const PREVIEW_LIMIT = 5;

const TYPE_CONFIG: Record<
  string,
  { icon: React.ReactNode; bg: string; iconBg: string; badge: string; label: string }
> = {
  grade:      { icon: <GraduationCap className="w-4 h-4 text-green-600" />,  bg: "bg-green-50",  iconBg: "bg-green-100",  badge: "bg-green-100 text-green-700",   label: "Grade"      },
  urgent:     { icon: <AlertCircle   className="w-4 h-4 text-red-600" />,    bg: "bg-red-50",    iconBg: "bg-red-100",    badge: "bg-red-100 text-red-700",       label: "Urgent"     },
  assignment: { icon: <Bell          className="w-4 h-4 text-orange-600" />, bg: "bg-orange-50", iconBg: "bg-orange-100", badge: "bg-orange-100 text-orange-700", label: "Assignment" },
  general:    { icon: <Info          className="w-4 h-4 text-blue-600" />,   bg: "bg-blue-50",   iconBg: "bg-blue-100",   badge: "bg-blue-100 text-blue-700",     label: "General"    },
};

function getConfig(type: string) {
  return TYPE_CONFIG[type] ?? TYPE_CONFIG.general;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function safeTimeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

function filterActive(items: DashboardAnnouncement[]): DashboardAnnouncement[] {
  return items.filter((item) => {
    if (!item.expired_at) return true;
    const expiry = new Date(item.expired_at);
    return isNaN(expiry.getTime()) || !isPast(expiry);
  });
}

export default function Announcements({ announcements }: AnnouncementsProps) {
  const router  = useRouter();
  const active  = filterActive(announcements);
  const preview = active.slice(0, PREVIEW_LIMIT);
  const hasMore = active.length > PREVIEW_LIMIT;

  if (!active.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Announcements</h2>
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-400">
          <Bell className="w-8 h-8 opacity-40" />
          <p className="text-sm font-medium">No announcements yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Announcements</h2>
        <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
          {active.length} active
        </span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {preview.map((item) => {
          const cfg        = getConfig(item.type);
          const previewTxt = stripHtml(item.content).slice(0, 65);
          const ago        = safeTimeAgo(item.published_at);

          return (
            <div
              key={item._id}
              onClick={() => router.push(`/student/announcements/${item._id}`)}
              className={`${cfg.bg} rounded-xl p-3.5 cursor-pointer hover:shadow-sm transition-all group border border-gray-100`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${cfg.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {cfg.icon}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Title + type badge */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{item.title}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                    {item.is_pinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500 uppercase tracking-wide flex-shrink-0">
                        Pinned
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 truncate mb-1">{previewTxt}…</p>

                  {/* Course title + time */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-400 truncate font-medium">
                      📚 {item.course_id?.title ?? "—"}
                    </span>
                    {ago && <span className="text-[11px] text-gray-400 flex-shrink-0">{ago}</span>}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          );
        })}
      </div>

      {/* View All — shown only when there are more than PREVIEW_LIMIT */}
      {hasMore && (
        <button
          onClick={() => router.push("/student/announcements")}
          className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          View all {active.length} announcements
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}