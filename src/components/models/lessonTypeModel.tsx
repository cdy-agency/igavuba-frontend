"use client";

import React from "react";
import {
  X,
  FileText,
  FileType,
  Video,
  CheckCircle2,
  FileEdit,
  MessageCircleMore,
  Users,
  Link,
} from "lucide-react";

export interface LessonType {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: "learning" | "exam";
}

export interface LessonTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (typeId: string) => void;
}

const LESSON_TYPES: LessonType[] = [
  {
    id: "text",
    label: "Text",
    icon: <FileText className="h-4 w-4" />,
    category: "learning",
  },
  {
    id: "pdf",
    label: "Document",
    icon: <FileType className="h-4 w-4" />,
    category: "learning",
  },
  {
    id: "video",
    label: "Video",
    icon: <Video className="h-4 w-4" />,
    category: "learning",
  },
];

const EXAM_TYPES: LessonType[] = [
  {
    id: "quiz",
    label: "Quiz",
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: "exam",
  },
  {
    id: "assignment",
    label: "Assignment",
    icon: <FileEdit className="h-4 w-4" />,
    category: "exam",
  },
];

const ICON_BG: Record<string, string> = {
  text: "bg-blue-100   text-blue-600   dark:bg-blue-900/30   dark:text-blue-400",
  pdf: "bg-green-100  text-green-600  dark:bg-green-900/30  dark:text-green-400",
  video:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  discussion:
    "bg-cyan-100   text-cyan-600   dark:bg-cyan-900/30   dark:text-cyan-400",
  meeting:
    "bg-red-100    text-red-600    dark:bg-red-900/30    dark:text-red-400",
  embed:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  quiz: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  assignment:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
};

function TypeCard({
  type,
  onClick,
}: {
  type: LessonType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 rounded-lg border border-border bg-background p-4 text-center transition-all hover:border-primary/50 hover:bg-primary-subtle/30 hover:shadow-sm"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${ICON_BG[type.id]}`}
      >
        {type.icon}
      </div>
      <span className="text-[12px] font-medium leading-tight text-foreground group-hover:text-primary transition-colors">
        {type.label}
      </span>
    </button>
  );
}

export const LessonTypeModal: React.FC<LessonTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  const handleTypeClick = (typeId: string) => {
    onSelectType(typeId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground leading-tight">
                Select lesson type
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Choose a content type to continue
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-5">
            {/* Learning */}
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Learning Content
              </p>
              <div className="grid grid-cols-3 gap-2">
                {LESSON_TYPES.map((type) => (
                  <TypeCard
                    key={type.id}
                    type={type}
                    onClick={() => handleTypeClick(type.id)}
                  />
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Exam */}
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Exam
              </p>
              <div className="grid grid-cols-3 gap-2">
                {EXAM_TYPES.map((type) => (
                  <TypeCard
                    key={type.id}
                    type={type}
                    onClick={() => handleTypeClick(type.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
