"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Search,
  FileText,
  Video,
  FileType,
  Loader,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ClipboardList,
  MessageCircle,
  Users,
  Link,
  BookOpen,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ContentType,
  type ContentRecord,
  type ModuleContentItem,
} from "@/types/content";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import {
  useContentLibrary,
  useAttachExistingContent,
} from "@/hooks/use-content-library";
import {
  useDetachContent,
  useModuleContents,
} from "@/hooks/use-module-contents";
import { getApiErrorMessage } from "@/lib/auth";

interface ContentSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (content: ContentRecord) => void;
  contentId: string;
}

type ContentTabType =
  | ContentType
  | "QUIZ"
  | "ASSIGNMENT"
  | "DISCUSSION"
  | "MEET"
  | "EMBED";

const CONTENT_TYPES: {
  value: ContentTabType;
  label: string;
  icon: typeof FileText;
}[] = [
  { value: ContentType.TEXT, label: "Text", icon: FileText },
  { value: ContentType.VIDEO, label: "Video", icon: Video },
  { value: ContentType.DOCUMENT, label: "Document", icon: FileType },
];

const TYPE_ICON_CLASSES: Record<string, string> = {
  [ContentType.TEXT]: "text-blue-600",
  [ContentType.VIDEO]: "text-purple-600",
  [ContentType.DOCUMENT]: "text-green-600",
  QUIZ: "text-orange-600",
  ASSIGNMENT: "text-yellow-600",
  DISCUSSION: "text-cyan-600",
  MEET: "text-red-600",
  EMBED: "text-indigo-600",
};

const TYPE_ICON_MAP: Record<string, typeof FileText> = {
  [ContentType.TEXT]: FileText,
  [ContentType.VIDEO]: Video,
  [ContentType.DOCUMENT]: FileType,
  QUIZ: BookOpen,
  ASSIGNMENT: ClipboardList,
  DISCUSSION: MessageCircle,
  MEET: Users,
  EMBED: Link,
};

export const ContentSearchModal: React.FC<ContentSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectContent,
  contentId: moduleId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTabType>(ContentType.TEXT);
  const [currentPage, setCurrentPage] = useState(1);
  const [contentToRemove, setContentToRemove] = useState<ContentRecord | null>(
    null,
  );
  const itemsPerPage = 10;

  const attachMutation = useAttachExistingContent(moduleId);
  const detachMutation = useDetachContent(moduleId);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    setSearchQuery("");
    setDebouncedSearch("");
    setActiveTab(ContentType.TEXT);
    setCurrentPage(1);
    setContentToRemove(null);
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const isSupportedTab =
    activeTab === ContentType.TEXT ||
    activeTab === ContentType.VIDEO ||
    activeTab === ContentType.DOCUMENT;

  const { data: allContent, isLoading } = useContentLibrary(
    {
      type: isSupportedTab ? activeTab : undefined,
      search: debouncedSearch || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sort: "newest",
    },
    isOpen && isSupportedTab,
  );

  const { data: moduleContent } = useModuleContents(moduleId, isOpen);
  const moduleItems: ModuleContentItem[] = moduleContent ?? [];

  const addedContentIds = useMemo(
    () => new Set(moduleItems.map((item) => item.contentId)),
    [moduleItems],
  );

  const filteredContent = useMemo(() => {
    if (!isSupportedTab) return [] as ContentRecord[];
    const items: ContentRecord[] = allContent?.data ?? [];
    return items.filter((content) => !addedContentIds.has(content.id));
  }, [allContent, addedContentIds, isSupportedTab]);

  const handleConfirmRemove = async () => {
    if (!contentToRemove) return;
    try {
      await detachMutation.mutateAsync(contentToRemove.id);
      setContentToRemove(null);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to remove content from module"),
      );
      setContentToRemove(null);
    }
  };

  const handleSelectContent = async (content: ContentRecord) => {
    if (addedContentIds.has(content.id)) {
      toast.error("Already added");
      return;
    }
    try {
      await attachMutation.mutateAsync(content.id);
      onSelectContent(content);
      onClose();
    } catch {
      /* hook handles toast */
    }
  };

  if (!isOpen) return null;

  const total = allContent?.pagination.total ?? 0;
  const totalPages = Math.max(allContent?.pagination.totalPages ?? 1, 1);

  const getIcon = (type: string) => {
    const Icon = TYPE_ICON_MAP[type] ?? FileText;
    const cls = TYPE_ICON_CLASSES[type] ?? "text-muted-foreground";
    return <Icon className={`h-3.5 w-3.5 ${cls}`} />;
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
        <div className="flex max-h-[82vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* ── Header ── */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div>
              <h2 className="text-[14px] font-semibold text-foreground leading-tight">
                Add Content from Institution
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Browse and attach existing content to this module
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Search ── */}
          <div className="border-b border-border px-5 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by title or description…"
                className="h-8 w-full rounded-md border border-border bg-muted/40 pl-8 pr-3 text-[12px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex overflow-x-auto border-b border-border scrollbar-hide">
            {CONTENT_TYPES.map(({ value, label, icon: Icon }) => {
              const active = activeTab === value;
              return (
                <button
                  key={value}
                  onClick={() => {
                    setActiveTab(value);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[11px] font-medium transition-colors ${
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* ── Content list ── */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {!isSupportedTab ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Search className="h-4 w-4" />
                </div>
                <p className="text-[13px] font-medium">Coming soon</p>
                <p className="mt-0.5 text-[11px]">
                  This content type is not available yet.
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-4 w-4" />
                </div>
                <p className="text-[13px] font-medium">No content found</p>
                <p className="mt-0.5 text-[11px]">
                  Try adjusting your search or check another tab
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {filteredContent.map((content) => (
                  <li
                    key={content.id}
                    onClick={() => void handleSelectContent(content)}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-all hover:border-primary/40 hover:bg-primary-subtle/30"
                  >
                    {/* Icon badge */}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      {getIcon(content.type)}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] font-medium text-foreground leading-tight group-hover:text-primary transition-colors">
                        {content.title}
                      </p>
                      {content.description && (
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {content.description}
                        </p>
                      )}
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                          {content.type}
                        </span>
                        <span
                          className={`rounded px-1.5 py-px text-[10px] font-medium ${content.isPublished ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                        >
                          {content.isPublished ? "Visible" : "Hidden"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                        <Plus className="h-3 w-3" /> Add
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContentToRemove(content);
                        }}
                        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Pagination ── */}
          {isSupportedTab && total > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <p className="text-[11px] text-muted-foreground">
                {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, total)} of {total}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    currentPage > 1 && setCurrentPage(currentPage - 1)
                  }
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[80px] text-center text-[11px] font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    currentPage < totalPages && setCurrentPage(currentPage + 1)
                  }
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm remove */}
      <ConfirmDialog
        isOpen={!!contentToRemove}
        onOpenChange={(open) => !open && setContentToRemove(null)}
        title="Remove Content from Module"
        description={`Are you sure you want to remove "${contentToRemove?.title}" from this module? This will not delete the content itself.`}
        confirmText="Yes, remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemove}
        variant="destructive"
      />
    </>
  );
};
