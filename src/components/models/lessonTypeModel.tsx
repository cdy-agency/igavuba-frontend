"use client";

import React from "react";
import {
  X,
  FileText,
  FileType,
  Video,
  CheckCircle2,
  FileEdit,
  ClipboardList,
} from "lucide-react";

export interface LessonType {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: "learning" | "assessment";
  disabled?: boolean;
  disabledReason?: string;
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

const ASSESSMENT_TYPES: LessonType[] = [
  {
    id: "quiz",
    label: "Quiz",
    icon: <CheckCircle2 className="h-4 w-4" />,
    category: "assessment",
  },
  {
    id: "assignment",
    label: "Assignment",
    icon: <FileEdit className="h-4 w-4" />,
    category: "assessment",
  },
  {
    id: "exam",
    label: "Exam",
    icon: <ClipboardList className="h-4 w-4" />,
    category: "assessment",
  },
];

const ICON_BG: Record<string, string> = {
  text: "bg-blue-100   text-blue-600   dark:bg-blue-900/30   dark:text-blue-400",
  pdf: "bg-green-100  text-green-600  dark:bg-green-900/30  dark:text-green-400",
  video:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  quiz: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  assignment:
    "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  exam: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
};

function TypeCard({
  type,
  onClick,
}: {
  type: LessonType;
  onClick: () => void;
}) {
  const isDisabled = Boolean(type.disabled);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={isDisabled ? type.disabledReason : undefined}
      className="group flex flex-col items-center gap-2.5 rounded-lg border border-border bg-background p-4 text-center transition-all hover:border-primary/50 hover:bg-primary-subtle/30 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-background disabled:hover:shadow-none"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105 ${ICON_BG[type.id]}`}
      >
        {type.icon}
      </div>
      <span className="text-[12px] font-medium leading-tight text-foreground group-hover:text-primary transition-colors">
        {type.label}
      </span>
      {isDisabled && type.disabledReason ? (
        <span className="text-[10px] text-muted-foreground">{type.disabledReason}</span>
      ) : null}
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
    const type = ASSESSMENT_TYPES.find((item) => item.id === typeId);
    if (type?.disabled) return;
    onSelectType(typeId);
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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

          <div className="px-5 py-4 space-y-5">
            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Learning Content
              </p>
              <div className="grid grid-cols-3 gap-2">
                {LESSON_TYPES.map((type) => (
                  <TypeCard
                    key={type.id}
                    type={type}
                    onClick={() => {
                      onSelectType(type.id);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            <div>
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Assessment
              </p>
              <div className="grid grid-cols-3 gap-2">
                {ASSESSMENT_TYPES.map((type) => (
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
