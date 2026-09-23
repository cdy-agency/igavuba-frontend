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
  Archive,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ContentType,
  type ContentRecord,
  type ModuleContentItem,
  type StagedContentItem,
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
  usePermanentlyDeleteStagedContent,
  useReattachStagedContent,
  useStagedRevisionContents,
} from "@/hooks/use-module-contents";
import { getApiErrorMessage } from "@/lib/auth";

interface ContentSearchModalProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectContent: (content: ContentRecord) => void;
  contentId: string;
}

type ContentTabType =
  | ContentType
  | "QUIZ"
  | "ASSIGNMENT"
  | "DRAFT"
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
  { value: ContentType.QUIZ, label: "Quiz", icon: BookOpen },
  { value: ContentType.ASSIGNMENT, label: "Assignment", icon: ClipboardList },
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
  courseId,
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
  const [stagedToDelete, setStagedToDelete] = useState<StagedContentItem | null>(
    null,
  );
  const itemsPerPage = 10;

  const attachMutation = useAttachExistingContent(moduleId);
  const detachMutation = useDetachContent(moduleId, courseId);
  const reattachMutation = useReattachStagedContent(moduleId, courseId);
  const permanentDeleteMutation = usePermanentlyDeleteStagedContent(courseId);

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
    setStagedToDelete(null);
  }, [isOpen]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeTab]);

  const isSupportedTab =
    activeTab === ContentType.TEXT ||
    activeTab === ContentType.VIDEO ||
    activeTab === ContentType.DOCUMENT ||
    activeTab === ContentType.QUIZ ||
    activeTab === ContentType.ASSIGNMENT;

  const { data: allContent, isLoading } = useContentLibrary(
    {
      type: isSupportedTab ? (activeTab as ContentType) : undefined,
      search: debouncedSearch || undefined,
      page: currentPage,
      limit: itemsPerPage,
      sort: "newest",
    },
    isOpen && isSupportedTab,
  );

  const { data: moduleContent } = useModuleContents(moduleId, isOpen);
  const isDraftTab = activeTab === "DRAFT";
  const { data: stagedContent, isLoading: isStagedLoading } =
    useStagedRevisionContents(courseId, isOpen);

  const activeModuleContentKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const item of moduleContent ?? []) {
      if (item.deletedAt) continue;
      keys.add(item.contentId);
      if (item.content.clonedFromContentId) {
        keys.add(item.content.clonedFromContentId);
      }
    }
    return keys;
  }, [moduleContent]);

  const isContentAlreadyInModule = (contentId: string, clonedFromContentId?: string | null) =>
    activeModuleContentKeys.has(contentId) ||
    Boolean(clonedFromContentId && activeModuleContentKeys.has(clonedFromContentId));

  const filteredContent = useMemo(() => {
    if (!isSupportedTab) return [] as ContentRecord[];
    return allContent?.data ?? [];
  }, [allContent, isSupportedTab]);

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
    if (isContentAlreadyInModule(content.id, content.clonedFromContentId)) return;
    try {
      await attachMutation.mutateAsync(content.id);
      onSelectContent(content);
      onClose();
    } catch {
      /* hook handles toast */
    }
  };

  const handleReattachStaged = async (item: StagedContentItem) => {
    const isRestoreToSameModule = item.moduleId === moduleId;
    if (
      !isRestoreToSameModule &&
      isContentAlreadyInModule(item.contentId, item.content.clonedFromContentId)
    ) {
      toast.error("This content is already attached to this module.");
      return;
    }
    try {
      const response = await reattachMutation.mutateAsync({
        contentId: item.contentId,
        fromModuleId: item.moduleId,
      });
      onSelectContent(response.data.content);
      onClose();
    } catch {
      /* hook handles toast */
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!stagedToDelete) return;
    try {
      await permanentDeleteMutation.mutateAsync({
        moduleId: stagedToDelete.moduleId,
        contentId: stagedToDelete.contentId,
      });
      setStagedToDelete(null);
    } catch {
      setStagedToDelete(null);
    }
  };

  const filteredStagedContent = useMemo(() => {
    if (!stagedContent?.length) return [] as StagedContentItem[];
    const query = debouncedSearch.toLowerCase();
    if (!query) return stagedContent;
    return stagedContent.filter(
      (item) =>
        item.content.title.toLowerCase().includes(query) ||
        item.module.title.toLowerCase().includes(query),
    );
  }, [stagedContent, debouncedSearch]);

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
                Browse institution content or manage draft items removed from modules
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
            <button
              onClick={() => {
                setActiveTab("DRAFT");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-[11px] font-medium transition-colors ${
                isDraftTab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Archive className="h-3 w-3" />
              Draft
              {(stagedContent?.length ?? 0) > 0 ? (
                <span className="rounded-full bg-violet-100 px-1.5 py-px text-[10px] font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                  {stagedContent!.length}
                </span>
              ) : null}
            </button>
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
            {isDraftTab ? (
              isStagedLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredStagedContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Archive className="h-4 w-4" />
                  </div>
                  <p className="text-[13px] font-medium">No draft content</p>
                  <p className="mt-0.5 max-w-xs text-[11px]">
                    Lessons removed from modules during this revision appear here.
                    Re-attach them to this or another module, or delete permanently.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {filteredStagedContent.map((item) => {
                    const isRestoreToSameModule = item.moduleId === moduleId;
                    const alreadyInThisModule =
                      !isRestoreToSameModule &&
                      isContentAlreadyInModule(
                        item.contentId,
                        item.content.clonedFromContentId,
                      );

                    return (
                    <li
                      key={item.id}
                      className="group flex items-center gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        {getIcon(item.content.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-medium text-foreground">
                          {item.content.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          Removed from: {item.module.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                            {item.content.type}
                          </span>
                          <span className="rounded bg-violet-100 px-1.5 py-px text-[10px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                            Draft
                          </span>
                          {alreadyInThisModule ? (
                            <span className="rounded bg-blue-100 px-1.5 py-px text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              Already in this module
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        {!alreadyInThisModule ? (
                        <button
                          type="button"
                          onClick={() => void handleReattachStaged(item)}
                          disabled={reattachMutation.isPending}
                          className="rounded-md border border-primary/30 px-2 py-1 text-[11px] font-medium text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
                        >
                          {isRestoreToSameModule ? "Restore" : "Add here"}
                        </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => setStagedToDelete(item)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          aria-label="Delete permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                    );
                  })}
                </ul>
              )
            ) : !isSupportedTab ? (
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
                {filteredContent.map((content: ContentRecord) => {
                  const alreadyAdded = isContentAlreadyInModule(
                    content.id,
                    content.clonedFromContentId,
                  );
                  return (
                  <li
                    key={content.id}
                    onClick={() => !alreadyAdded && void handleSelectContent(content)}
                    className={`group flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 transition-all ${
                      alreadyAdded
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-primary/40 hover:bg-primary-subtle/30"
                    }`}
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
                        {alreadyAdded && (
                          <span className="rounded bg-blue-100 px-1.5 py-px text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            Already in this module
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                      {!alreadyAdded && (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                          <Plus className="h-3 w-3" /> Add
                        </span>
                      )}
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
                  );
                })}
              </ul>
            )}
          </div>

          {/* ── Pagination ── */}
          {!isDraftTab && isSupportedTab && total > itemsPerPage && (
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
        description={`Are you sure you want to remove "${contentToRemove?.title}" from this module? It will move to the Draft tab and can be re-attached later.`}
        confirmText="Yes, remove"
        cancelText="Cancel"
        onConfirm={handleConfirmRemove}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={!!stagedToDelete}
        onOpenChange={(open) => !open && setStagedToDelete(null)}
        title="Delete Draft Content Permanently"
        description={`Permanently delete "${stagedToDelete?.content.title}" from this draft revision? This cannot be undone.`}
        confirmText="Delete permanently"
        cancelText="Cancel"
        onConfirm={handleConfirmPermanentDelete}
        variant="destructive"
      />
    </>
  );
};
