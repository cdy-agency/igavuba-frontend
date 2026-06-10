'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Video } from 'lucide-react';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
import {
  AllowDownloadToggle,
  ContentVisibilityToggle,
  DocumentUploadZone,
  LessonFormFooter,
  LessonSettingsGroup,
  VideoLessonFields,
  defaultUntitledTitle,
  minutesToSeconds,
  resolveLessonTitle,
  secondsToMinutes,
  type VideoPlatform,
} from '@/components/course-builder/lesson-form-ui';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { useCourseBuilder } from '@/components/course-builder/course-builder-context';
import {
  useCreateDocumentContent,
  useCreateTextContent,
  useCreateVideoContent,
  useDetachContent,
  useModuleContents,
  useUpdateDocumentContent,
  useUpdateTextContent,
  useUpdateVideoContent,
} from '@/hooks/use-module-contents';
import { uploadFile } from '@/api/upload';
import { ContentType, type ModuleContentItem } from '@/types/content';
import { getApiErrorMessage } from '@/lib/auth';
import { toast } from '@/lib/toast';
import { useAuthReady } from '@/hooks/use-auth-ready';

interface ContentPanelProps {
  moduleId: string | null;
  courseSlug?: string;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full min-h-[24rem] items-center justify-center p-8">
      <div className="max-w-md rounded-lg border border-dashed border-border/80 bg-white px-8 py-10 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function LessonIcon({ type }: { type: 'text' | 'video' | 'document' }) {
  if (type === 'video') {
    return <Video className="h-4.5 w-4.5 text-violet-600" strokeWidth={2} />;
  }

  return <FileText className="h-4.5 w-4.5 text-primary" strokeWidth={2} />;
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function LessonCreateForm({
  moduleId,
  type,
  onCreated,
  onCancel,
}: {
  moduleId: string;
  type: 'text' | 'video' | 'document';
  onCreated: (contentId: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('<p></p>');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPlatform, setVideoPlatform] = useState<VideoPlatform>('youtube');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [allowDownload, setAllowDownload] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const createText = useCreateTextContent(moduleId);
  const createVideo = useCreateVideoContent(moduleId);
  const createDocument = useCreateDocumentContent(moduleId);

  const isSubmitting =
    createText.isPending || createVideo.isPending || createDocument.isPending || isUploading;

  const handleDocumentUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFileUrl(url);
      setUploadedFileName(file.name);
      toast.success('Document uploaded successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload document.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const resolvedTitle = resolveLessonTitle(title, type);
    const sharedPayload = {
      title: resolvedTitle,
      description: description.trim() || undefined,
      isPublished: isVisible,
    };

    if (type === 'text') {
      const plainBody = body.replace(/<[^>]+>/g, '').trim();
      if (!plainBody) {
        toast.error('Lesson body is required.');
        return;
      }
      const response = await createText.mutateAsync({
        ...sharedPayload,
        body,
      });
      onCreated(response.data.contentId);
      return;
    }

    if (type === 'video') {
      const trimmedUrl = videoUrl.trim();
      if (!trimmedUrl) {
        toast.error('Video URL is required.');
        return;
      }
      if (!isValidUrl(trimmedUrl)) {
        toast.error('Enter a valid video URL.');
        return;
      }

      const response = await createVideo.mutateAsync({
        ...sharedPayload,
        videoUrl: trimmedUrl,
        durationSeconds: minutesToSeconds(durationMinutes),
        allowDownload,
      });
      onCreated(response.data.contentId);
      return;
    }

    if (!fileUrl) {
      toast.error('Upload a document first.');
      return;
    }

    const response = await createDocument.mutateAsync({
      ...sharedPayload,
      fileUrl,
      allowDownload,
    });
    onCreated(response.data.contentId);
  };

  const settings = (
    <LessonSettingsGroup>
      <ContentVisibilityToggle visible={isVisible} onChange={setIsVisible} disabled={isSubmitting} />
      {type !== 'text' ? (
        <AllowDownloadToggle
          enabled={allowDownload}
          onChange={setAllowDownload}
          disabled={isSubmitting}
        />
      ) : null}
    </LessonSettingsGroup>
  );

  const submitLabel =
    type === 'video' ? 'Create Video' : type === 'document' ? 'Create Document' : 'Create Lesson';

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      titlePlaceholder={defaultUntitledTitle(type)}
      description={description}
      onDescriptionChange={setDescription}
      onDelete={onCancel}
      icon={<LessonIcon type={type} />}
      settings={settings}
      footer={
        <LessonFormFooter
          onCancel={onCancel}
          onSubmit={() => void handleSubmit()}
          submitLabel={submitLabel}
          isSubmitting={isSubmitting}
        />
      }
    >
      {type === 'text' ? (
        <TiptapEditor
          name="lesson-body-create"
          content={body}
          onChange={setBody}
          placeholder="Write lesson content..."
          stickyToolbar={false}
        />
      ) : null}

      {type === 'video' ? (
        <VideoLessonFields
          platform={videoPlatform}
          onPlatformChange={setVideoPlatform}
          videoUrl={videoUrl}
          onVideoUrlChange={setVideoUrl}
          durationMinutes={durationMinutes}
          onDurationMinutesChange={setDurationMinutes}
          disabled={isSubmitting}
        />
      ) : null}

      {type === 'document' ? (
        <DocumentUploadZone
          onFileSelect={(file) => void handleDocumentUpload(file)}
          isUploading={isUploading}
          fileName={uploadedFileName}
          disabled={isSubmitting}
        />
      ) : null}
    </BuilderLessonShell>
  );
}

function TextLessonEditor({
  item,
  moduleId,
  onDelete,
}: {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [body, setBody] = useState(item.content.textContent?.body ?? '<p></p>');
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const updateMutation = useUpdateTextContent(moduleId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setBody(item.content.textContent?.body ?? '<p></p>');
    setIsVisible(item.content.isPublished);
  }, [item]);

  const scheduleSave = (payload: {
    title?: string;
    description?: string;
    body?: string;
    isPublished?: boolean;
  }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateMutation.mutate({ contentId: item.contentId, payload });
    }, 600);
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={(value) => {
        setTitle(value);
        scheduleSave({ title: value.trim(), description, body, isPublished: isVisible });
      }}
      description={description}
      onDescriptionChange={(value) => {
        setDescription(value);
        scheduleSave({
          title,
          description: value.trim() || undefined,
          body,
          isPublished: isVisible,
        });
      }}
      onDelete={onDelete}
      icon={<LessonIcon type="text" />}
      settings={
        <LessonSettingsGroup>
          <ContentVisibilityToggle
            visible={isVisible}
            onChange={(value) => {
              setIsVisible(value);
              scheduleSave({
                title,
                description: description || undefined,
                body,
                isPublished: value,
              });
            }}
          />
        </LessonSettingsGroup>
      }
    >
      <TiptapEditor
        name={`lesson-body-${item.contentId}`}
        content={body}
        onChange={(value) => {
          setBody(value);
          scheduleSave({
            title,
            description: description || undefined,
            body: value,
            isPublished: isVisible,
          });
        }}
        stickyToolbar={false}
      />
    </BuilderLessonShell>
  );
}

function VideoLessonEditor({
  item,
  moduleId,
  onDelete,
}: {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [videoUrl, setVideoUrl] = useState(item.content.videoContent?.videoUrl ?? '');
  const [videoPlatform, setVideoPlatform] = useState<VideoPlatform>('youtube');
  const [durationMinutes, setDurationMinutes] = useState(
    secondsToMinutes(item.content.videoContent?.durationSeconds),
  );
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [allowDownload, setAllowDownload] = useState(
    item.content.videoContent?.allowDownload ?? true,
  );
  const updateMutation = useUpdateVideoContent(moduleId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setVideoUrl(item.content.videoContent?.videoUrl ?? '');
    setDurationMinutes(secondsToMinutes(item.content.videoContent?.durationSeconds));
    setIsVisible(item.content.isPublished);
    setAllowDownload(item.content.videoContent?.allowDownload ?? true);
  }, [item]);

  const save = (payload: {
    title?: string;
    description?: string;
    videoUrl?: string;
    durationSeconds?: number;
    isPublished?: boolean;
    allowDownload?: boolean;
  }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateMutation.mutate({ contentId: item.contentId, payload });
    }, 600);
  };

  const buildPayload = (overrides?: {
    title?: string;
    description?: string;
    videoUrl?: string;
    durationMinutes?: string;
    isPublished?: boolean;
    allowDownload?: boolean;
  }) => ({
    title: (overrides?.title ?? title).trim(),
    description: (overrides?.description ?? description).trim() || undefined,
    videoUrl: overrides?.videoUrl ?? videoUrl,
    durationSeconds: minutesToSeconds(overrides?.durationMinutes ?? durationMinutes),
    isPublished: overrides?.isPublished ?? isVisible,
    allowDownload: overrides?.allowDownload ?? allowDownload,
  });

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={(value) => {
        setTitle(value);
        save(buildPayload({ title: value }));
      }}
      onTitleBlur={() => save(buildPayload())}
      description={description}
      onDescriptionChange={(value) => {
        setDescription(value);
        save(buildPayload({ description: value }));
      }}
      onDescriptionBlur={() => save(buildPayload())}
      onDelete={onDelete}
      icon={<LessonIcon type="video" />}
      settings={
        <LessonSettingsGroup>
          <ContentVisibilityToggle
            visible={isVisible}
            onChange={(value) => {
              setIsVisible(value);
              save(buildPayload({ isPublished: value }));
            }}
          />
          <AllowDownloadToggle
            enabled={allowDownload}
            onChange={(value) => {
              setAllowDownload(value);
              save(buildPayload({ allowDownload: value }));
            }}
          />
        </LessonSettingsGroup>
      }
    >
      <VideoLessonFields
        platform={videoPlatform}
        onPlatformChange={setVideoPlatform}
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onVideoUrlBlur={() => save(buildPayload())}
        durationMinutes={durationMinutes}
        onDurationMinutesChange={setDurationMinutes}
        onDurationMinutesBlur={() => save(buildPayload())}
      />
    </BuilderLessonShell>
  );
}

function DocumentLessonEditor({
  item,
  moduleId,
  onDelete,
}: {
  item: ModuleContentItem;
  moduleId: string;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(item.content.title);
  const [description, setDescription] = useState(item.content.description ?? '');
  const [fileUrl, setFileUrl] = useState(item.content.documentContent?.fileUrl ?? '');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(item.content.isPublished);
  const [allowDownload, setAllowDownload] = useState(
    item.content.documentContent?.allowDownload ?? true,
  );
  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateDocumentContent(moduleId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setFileUrl(item.content.documentContent?.fileUrl ?? '');
    setUploadedFileName(null);
    setIsVisible(item.content.isPublished);
    setAllowDownload(item.content.documentContent?.allowDownload ?? true);
  }, [item]);

  const save = (payload: {
    title?: string;
    description?: string;
    fileUrl?: string;
    isPublished?: boolean;
    allowDownload?: boolean;
  }) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateMutation.mutate({ contentId: item.contentId, payload });
    }, 600);
  };

  const handleDocumentUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFileUrl(url);
      setUploadedFileName(file.name);
      save({ title, description: description || undefined, fileUrl: url });
      toast.success('Document uploaded successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload document.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={(value) => {
        setTitle(value);
        save({ title: value.trim(), description: description || undefined, fileUrl });
      }}
      onTitleBlur={() =>
        save({ title: title.trim(), description: description || undefined, fileUrl })
      }
      description={description}
      onDescriptionChange={(value) => {
        setDescription(value);
        save({ title, description: value.trim() || undefined, fileUrl });
      }}
      onDescriptionBlur={() =>
        save({ title: title.trim(), description: description.trim() || undefined, fileUrl })
      }
      onDelete={onDelete}
      icon={<LessonIcon type="document" />}
      settings={
        <LessonSettingsGroup>
          <ContentVisibilityToggle
            visible={isVisible}
            onChange={(value) => {
              setIsVisible(value);
              save({
                title,
                description: description || undefined,
                fileUrl,
                isPublished: value,
              });
            }}
          />
          <AllowDownloadToggle
            enabled={allowDownload}
            onChange={(value) => {
              setAllowDownload(value);
              save({
                title,
                description: description || undefined,
                fileUrl,
                allowDownload: value,
              });
            }}
          />
        </LessonSettingsGroup>
      }
    >
      <DocumentUploadZone
        onFileSelect={(file) => void handleDocumentUpload(file)}
        isUploading={isUploading}
        fileName={uploadedFileName ?? (fileUrl ? fileUrl.split('/').pop() : null)}
      />
    </BuilderLessonShell>
  );
}

export function ContentPanel({ moduleId }: ContentPanelProps) {
  const {
    selectedContentId,
    setSelectedContentId,
    creatingLessonType,
    cancelCreatingLesson,
  } = useCourseBuilder();

  const authReady = useAuthReady();
  const { data: contentsData, isPending } = useModuleContents(
    moduleId ?? '',
    authReady && Boolean(moduleId),
  );
  const contents: ModuleContentItem[] = contentsData ?? [];
  const detachMutation = useDetachContent(moduleId ?? '');
  const [contentToDetach, setContentToDetach] = useState<ModuleContentItem | null>(null);

  const selectedItem = contents.find((item) => item.contentId === selectedContentId) ?? null;

  useEffect(() => {
    if (!moduleId || creatingLessonType || selectedContentId || contents.length === 0) return;
    setSelectedContentId(contents[0].contentId);
  }, [moduleId, creatingLessonType, selectedContentId, contents, setSelectedContentId]);

  if (!moduleId) {
    return (
      <EmptyState
        title="Select a module"
        description="Choose a module from the sidebar to view or create lessons."
      />
    );
  }

  if (creatingLessonType) {
    return (
      <LessonCreateForm
        moduleId={moduleId}
        type={creatingLessonType}
        onCreated={(contentId) => {
          cancelCreatingLesson();
          setSelectedContentId(contentId);
        }}
        onCancel={cancelCreatingLesson}
      />
    );
  }

  if (isPending && !selectedItem) {
    return (
      <div className="flex h-full min-h-[24rem] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!selectedItem) {
    return (
      <EmptyState
        title="Select a lesson"
        description="Pick a lesson from the module sidebar or add a new lesson using + Lesson."
      />
    );
  }

  const handleDetach = () => setContentToDetach(selectedItem);

  return (
    <>
      {selectedItem.content.type === ContentType.TEXT ? (
        <TextLessonEditor item={selectedItem} moduleId={moduleId} onDelete={handleDetach} />
      ) : null}
      {selectedItem.content.type === ContentType.VIDEO ? (
        <VideoLessonEditor item={selectedItem} moduleId={moduleId} onDelete={handleDetach} />
      ) : null}
      {selectedItem.content.type === ContentType.DOCUMENT ? (
        <DocumentLessonEditor item={selectedItem} moduleId={moduleId} onDelete={handleDetach} />
      ) : null}

      <DeleteDialog
        isOpen={Boolean(contentToDetach)}
        onOpenChange={(open) => {
          if (!open) setContentToDetach(null);
        }}
        title="Remove lesson"
        description={
          contentToDetach
            ? `Remove "${contentToDetach.content.title}" from this module? The content will remain in the library.`
            : undefined
        }
        confirmText="Remove lesson"
        onConfirm={async () => {
          if (!contentToDetach || !moduleId) return;
          await detachMutation.mutateAsync(contentToDetach.contentId);
          if (selectedContentId === contentToDetach.contentId) {
            setSelectedContentId(null);
          }
          setContentToDetach(null);
        }}
      />
    </>
  );
}
