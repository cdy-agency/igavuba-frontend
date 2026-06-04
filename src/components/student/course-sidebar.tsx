import { ChevronLast } from "lucide-react";
import React from "react";

const navItems = [
  { key: "home", label: "Home" },
  { key: "announcements", label: "Announcements" },
  { key: "assignments", label: "Assignments" },
  { key: "modules", label: "Modules" },
  { key: "pages", label: "Pages" },
  { key: "files", label: "Files " },
  { key: "chat", label: "Chat" },
  // { key: "groups", label: "Groups" },
  { key: "grades", label: "Grades" },
];

type CourseSidebarProps = {
  course: {
    title: string;
  };
  active: string;
  onNavChange: (key: string) => void;
  onBack: () => void;
};

export default function CourseSidebar({
  course,
  active,
  onNavChange,
  onBack,
}: CourseSidebarProps) {
  return (
    <div className="bg-background border-r border-border shadow-sm w-full sm:w-56 lg:w-64 flex flex-col h-full">
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border bg-background flex-shrink-0">
        <h2 className="text-xs sm:text-sm lg:text-base font-semibold text-foreground truncate pr-2">
          {course.title}
        </h2>
        <button
          onClick={onBack}
          className="p-1.5 sm:p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0 touch-manipulation"
          aria-label="Go back"
        >
          <ChevronLast className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 sm:space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavChange(item.key)}
            className={`w-full text-left px-2 sm:px-3 py-2 sm:py-2.5 rounded-md sm:rounded-lg transition-colors duration-200 touch-manipulation ${
              active === item.key
                ? "bg-primary-muted text-primary-active font-semibold border-l-2 sm:border-l-4 border-primary"
                : "hover:bg-surface text-foreground-muted hover:text-foreground"
            }`}
          >
            <span className="text-xs sm:text-sm lg:text-base">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
