'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Film,
  Loader2,
  Plus,
  Search,
  Settings2,
  Trash2,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { SortableGrip } from '@/components/course-builder/sortable-grip';
import { ContentSearchModal } from '@/components/models/lessonsModel';
import { LessonTypeModal } from '@/components/models/lessonTypeModel';
import {
  useCourseBuilder,
  type LessonCreateType,
} from '@/components/course-builder/course-builder-context';
import {
  useCourseModules,
  useCreateModule,
  useDeleteModule,
  useReorderModules,
  useUpdateModule,
} from '@/hooks/use-course-modules';
import {
  useDetachContent,
  useModuleContents,
  useReorderModuleContents,
} from '@/hooks/use-module-contents';
import type { CourseModule } from '@/types/module';
import type { ContentRecord, ModuleContentItem } from '@/types/content';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { useAuthReady } from '@/hooks/use-auth-ready';

interface ModuleSidebarProps {
  courseId: string;
}

function mapLessonTypeId(typeId: string): LessonCreateType | null {
  switch (typeId) {
    case 'text':
      return 'text';
    case 'pdf':
      return 'document';
    case 'video':
      return 'video';
    default:
      return null;
  }
}

function lessonTypeMeta(type: ModuleContentItem['content']['type']) {
  switch (type) {
    case 'VIDEO':
      return {
        Icon: Video,
        iconClass: 'bg-violet-100 text-violet-600',
        label: 'VIDEO',
      };
    case 'DOCUMENT':
      return {
        Icon: Film,
        iconClass: 'bg-amber-100 text-amber-600',
        label: 'DOCUMENT',
      };
    default:
      return {
        Icon: FileText,
        iconClass: 'bg-emerald-100 text-emerald-600',
        label: 'TEXT',
      };
  }
}

function SortableLessonItem({
  item,
  isSelected,
  onSelect,
  onDelete,
}: {
  item: ModuleContentItem;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.contentId,
  });
  const { Icon, iconClass, label } = lessonTypeMeta(item.content.type);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'flex items-center gap-2 border-b border-slate-100 px-3 py-2.5 last:border-b-0',
        isSelected ? 'bg-[#e8f4fc]' : 'bg-white',
        isDragging && 'opacity-60',
      )}
    >
      <SortableGrip
        listeners={listeners}
        attributes={attributes}
        className="text-slate-300 hover:bg-slate-100 hover:text-slate-500"
      />
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
          iconClass,
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
      <button type="button" className="min-w-0 flex-1 text-left" onClick={onSelect}>
        <span className="block truncate text-[12px] font-medium leading-tight text-slate-800">
          {item.content.title}
        </span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </span>
      </button>
      <button
        type="button"
        className="shrink-0 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-destructive"
        onClick={onDelete}
        aria-label="Remove lesson"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function ModuleActionBar({
  onOpenLessonTypeModal,
  onSearchMaterials,
  onDeleteModule,
}: {
  onOpenLessonTypeModal: () => void;
  onSearchMaterials: () => void;
  onDeleteModule: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-1 border-t border-slate-100 bg-white px-3 py-2">
      <button
        type="button"
        onClick={onOpenLessonTypeModal}
        className="inline-flex items-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5"
      >
        <Plus className="h-3.5 w-3.5" />
        Lesson
      </button>

      <button
        type="button"
        onClick={onSearchMaterials}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
      >
        <Search className="h-3.5 w-3.5" />
        Search materials
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Module settings"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDeleteModule}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete module
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ModuleLessons({
  moduleId,
  selectedContentId,
  onSelectContent,
  onOpenLessonTypeModal,
  onSearchMaterials,
  onDeleteModule,
}: {
  moduleId: string;
  selectedContentId: string | null;
  onSelectContent: (contentId: string) => void;
  onOpenLessonTypeModal: () => void;
  onSearchMaterials: () => void;
  onDeleteModule: () => void;
}) {
  const { data: contentsData, isPending } = useModuleContents(moduleId);
  const reorderMutation = useReorderModuleContents(moduleId);
  const detachMutation = useDetachContent(moduleId);
  const [localContents, setLocalContents] = useState<ModuleContentItem[]>([]);
  const [lessonToDetach, setLessonToDetach] = useState<ModuleContentItem | null>(null);

  useEffect(() => {
    if (!contentsData) return;
    setLocalContents(contentsData);
  }, [contentsData]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localContents.findIndex((item) => item.contentId === active.id);
    const newIndex = localContents.findIndex((item) => item.contentId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localContents, oldIndex, newIndex);
    setLocalContents(reordered);
    reorderMutation.mutate({ contentIds: reordered.map((item) => item.contentId) });
  };

  return (
    <>
      <div className="overflow-hidden bg-white">
        {isPending && localContents.length === 0 ? (
          <div className="flex items-center gap-2 px-3 py-4 text-[11px] text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading lessons...
          </div>
        ) : localContents.length === 0 ? (
          <p className="px-3 py-3 text-[11px] text-slate-500">No lessons in this module.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={localContents.map((item) => item.contentId)}
              strategy={verticalListSortingStrategy}
            >
              {localContents.map((item) => (
                <SortableLessonItem
                  key={item.id}
                  item={item}
                  isSelected={selectedContentId === item.contentId}
                  onSelect={() => onSelectContent(item.contentId)}
                  onDelete={() => setLessonToDetach(item)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        <ModuleActionBar
          onOpenLessonTypeModal={onOpenLessonTypeModal}
          onSearchMaterials={onSearchMaterials}
          onDeleteModule={onDeleteModule}
        />
      </div>

      <DeleteDialog
        isOpen={Boolean(lessonToDetach)}
        onOpenChange={(open) => {
          if (!open) setLessonToDetach(null);
        }}
        title="Remove lesson"
        description={
          lessonToDetach
            ? `Remove "${lessonToDetach.content.title}" from this module?`
            : undefined
        }
        confirmText="Remove lesson"
        onConfirm={async () => {
          if (!lessonToDetach) return;
          await detachMutation.mutateAsync(lessonToDetach.contentId);
          setLessonToDetach(null);
        }}
      />
    </>
  );
}

function SortableModuleCard({
  module,
  isExpanded,
  isSelected,
  lessonCount,
  onToggle,
  onSelect,
  onDelete,
  onSaveTitle,
  isSaving,
  selectedContentId,
  onSelectContent,
  onOpenLessonTypeModal,
  onSearchMaterials,
}: {
  module: CourseModule;
  isExpanded: boolean;
  isSelected: boolean;
  lessonCount: number;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onSaveTitle: (title: string) => void;
  isSaving: boolean;
  selectedContentId: string | null;
  onSelectContent: (contentId: string) => void;
  onOpenLessonTypeModal: () => void;
  onSearchMaterials: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
  });
  const [title, setTitle] = useState(module.title);

  useEffect(() => {
    setTitle(module.title);
  }, [module.title]);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn('overflow-hidden', isDragging && 'opacity-70')}
    >
      <div
        className={cn(
          'flex items-center gap-1 px-3 py-2.5 transition-colors',
          isExpanded || isSelected ? 'bg-[#4a6580]' : 'bg-[#3d5166]',
        )}
      >
        <SortableGrip
          listeners={listeners}
          attributes={attributes}
          className="text-white/40 hover:bg-white/10 hover:text-white/80"
        />
        <input
          value={title}
          onFocus={onSelect}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            const trimmed = title.trim();
            if (trimmed && trimmed !== module.title) onSaveTitle(trimmed);
          }}
          disabled={isSaving}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-white outline-none placeholder:text-white/50"
        />
        <span
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            lessonCount > 0 ? 'bg-success' : 'bg-white/30',
          )}
          title={lessonCount > 0 ? `${lessonCount} lessons` : 'No lessons'}
        />
        <button
          type="button"
          className="shrink-0 rounded p-0.5 text-white/70 hover:text-white"
          onClick={onToggle}
          aria-label={isExpanded ? 'Collapse module' : 'Expand module'}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      {isExpanded ? (
        <ModuleLessons
          moduleId={module.id}
          selectedContentId={selectedContentId}
          onSelectContent={onSelectContent}
          onOpenLessonTypeModal={onOpenLessonTypeModal}
          onSearchMaterials={onSearchMaterials}
          onDeleteModule={onDelete}
        />
      ) : null}
    </div>
  );
}

function ModuleCardWithCount({
  module,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onDelete,
  onSaveTitle,
  isSaving,
  selectedContentId,
  onSelectContent,
  onOpenLessonTypeModal,
  onSearchMaterials,
}: {
  module: CourseModule;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onDelete: () => void;
  onSaveTitle: (title: string) => void;
  isSaving: boolean;
  selectedContentId: string | null;
  onSelectContent: (contentId: string) => void;
  onOpenLessonTypeModal: () => void;
  onSearchMaterials: () => void;
}) {
  const { data: contents } = useModuleContents(module.id, isExpanded);

  return (
    <SortableModuleCard
      module={module}
      isExpanded={isExpanded}
      isSelected={isSelected}
      lessonCount={contents?.length ?? 0}
      onToggle={onToggle}
      onSelect={onSelect}
      onDelete={onDelete}
      onSaveTitle={onSaveTitle}
      isSaving={isSaving}
      selectedContentId={selectedContentId}
      onSelectContent={onSelectContent}
      onOpenLessonTypeModal={onOpenLessonTypeModal}
      onSearchMaterials={onSearchMaterials}
    />
  );
}

export function ModuleSidebar({ courseId }: ModuleSidebarProps) {
  const {
    selectedModuleId,
    setSelectedModuleId,
    selectedContentId,
    setSelectedContentId,
    cancelCreatingLesson,
    startCreatingLesson,
  } = useCourseBuilder();

  const authReady = useAuthReady();
  const { data: modulesData, isPending } = useCourseModules(courseId, authReady);
  const createModuleMutation = useCreateModule(courseId);
  const updateModuleMutation = useUpdateModule(courseId);
  const deleteModuleMutation = useDeleteModule(courseId);
  const reorderModulesMutation = useReorderModules(courseId);

  const [localModules, setLocalModules] = useState<CourseModule[]>([]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [moduleToDelete, setModuleToDelete] = useState<CourseModule | null>(null);
  const [searchModalModuleId, setSearchModalModuleId] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [lessonTypeModalModuleId, setLessonTypeModalModuleId] = useState<string | null>(null);
  const [isLessonTypeModalOpen, setIsLessonTypeModalOpen] = useState(false);

  useEffect(() => {
    if (!modulesData) return;
    setLocalModules(modulesData);
  }, [modulesData]);

  useEffect(() => {
    if (!modulesData?.length || selectedModuleId) return;
    setSelectedModuleId(modulesData[0].id);
    setExpandedModuleId(modulesData[0].id);
  }, [modulesData, selectedModuleId, setSelectedModuleId]);

  useEffect(() => {
    if (!selectedModuleId) return;
    setExpandedModuleId(selectedModuleId);
  }, [selectedModuleId]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localModules.findIndex((module) => module.id === active.id);
    const newIndex = localModules.findIndex((module) => module.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localModules, oldIndex, newIndex);
    setLocalModules(reordered);
    reorderModulesMutation.mutate({ moduleIds: reordered.map((module) => module.id) });
  };

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    cancelCreatingLesson();
  };

  const handleToggleModule = (moduleId: string) => {
    setExpandedModuleId((current) => (current === moduleId ? null : moduleId));
    handleSelectModule(moduleId);
  };

  const handleSelectContent = (contentId: string) => {
    setSelectedContentId(contentId);
    cancelCreatingLesson();
  };

  const handleOpenLessonTypeModal = (moduleId: string) => {
    handleSelectModule(moduleId);
    setLessonTypeModalModuleId(moduleId);
    setIsLessonTypeModalOpen(true);
  };

  const handleOpenSearchMaterials = (moduleId: string) => {
    handleSelectModule(moduleId);
    setSearchModalModuleId(moduleId);
    setIsSearchModalOpen(true);
  };

  const handleLessonTypeSelect = (typeId: string) => {
    const lessonType = mapLessonTypeId(typeId);
    if (!lessonType) {
      toast.error('This lesson type is not available yet.');
      return;
    }
    if (lessonTypeModalModuleId) {
      handleSelectModule(lessonTypeModalModuleId);
      startCreatingLesson(lessonType);
    }
  };

  const isSaving =
    updateModuleMutation.isPending ||
    createModuleMutation.isPending ||
    deleteModuleMutation.isPending;

  const sortedModuleIds = useMemo(
    () => localModules.map((module) => module.id),
    [localModules],
  );

  return (
    <>
      <div className="course-builder-sidebar">
        <div className="course-builder-sidebar-scroll">
          {isPending && localModules.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-12 text-[12px] text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading modules...
            </div>
          ) : localModules.length === 0 ? (
            <div className="border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-[12px] text-slate-500">
              No modules yet.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleModuleDragEnd}
            >
              <SortableContext items={sortedModuleIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col">
                  {localModules.map((module) => (
                    <ModuleCardWithCount
                      key={module.id}
                      module={module}
                      isExpanded={expandedModuleId === module.id}
                      isSelected={selectedModuleId === module.id}
                      onToggle={() => handleToggleModule(module.id)}
                      onSelect={() => handleSelectModule(module.id)}
                      onDelete={() => setModuleToDelete(module)}
                      onSaveTitle={(title) =>
                        updateModuleMutation.mutate({ moduleId: module.id, payload: { title } })
                      }
                      isSaving={isSaving}
                      selectedContentId={selectedContentId}
                      onSelectContent={handleSelectContent}
                      onOpenLessonTypeModal={() => handleOpenLessonTypeModal(module.id)}
                      onSearchMaterials={() => handleOpenSearchMaterials(module.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        <div className="course-builder-sidebar-footer">
          {isAddingModule ? (
            <div className="space-y-2 border-b border-slate-200 bg-white p-2.5 shadow-sm">
              <Input
                value={newModuleTitle}
                onChange={(event) => setNewModuleTitle(event.target.value)}
                placeholder="Module title"
                autoFocus
                className="h-8 text-[12px]"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-7 flex-1 text-[11px]"
                  disabled={!newModuleTitle.trim() || createModuleMutation.isPending}
                  onClick={() => {
                    const title = newModuleTitle.trim();
                    if (!title) return;
                    createModuleMutation.mutate(
                      { title },
                      {
                        onSuccess: (response) => {
                          setNewModuleTitle('');
                          setIsAddingModule(false);
                          setSelectedModuleId(response.data.id);
                          setExpandedModuleId(response.data.id);
                        },
                      },
                    );
                  }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[11px]"
                  onClick={() => {
                    setIsAddingModule(false);
                    setNewModuleTitle('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="course-builder-new-module-btn"
              onClick={() => setIsAddingModule(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New module
            </button>
          )}
        </div>
      </div>

      {searchModalModuleId ? (
        <ContentSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          contentId={searchModalModuleId}
          onSelectContent={(content: ContentRecord) => {
            setSelectedModuleId(searchModalModuleId);
            setExpandedModuleId(searchModalModuleId);
            setSelectedContentId(content.id);
            cancelCreatingLesson();
          }}
        />
      ) : null}

      <LessonTypeModal
        isOpen={isLessonTypeModalOpen}
        onClose={() => setIsLessonTypeModalOpen(false)}
        onSelectType={handleLessonTypeSelect}
      />

      <DeleteDialog
        isOpen={Boolean(moduleToDelete)}
        onOpenChange={(open) => {
          if (!open) setModuleToDelete(null);
        }}
        title="Delete module"
        description={
          moduleToDelete
            ? `Delete "${moduleToDelete.title}" and detach its lessons from this module?`
            : undefined
        }
        confirmText="Delete module"
        onConfirm={async () => {
          if (!moduleToDelete) return;
          await deleteModuleMutation.mutateAsync(moduleToDelete.id);
          if (selectedModuleId === moduleToDelete.id) {
            setSelectedModuleId(null);
            setSelectedContentId(null);
          }
          setModuleToDelete(null);
        }}
      />
    </>
  );
}
