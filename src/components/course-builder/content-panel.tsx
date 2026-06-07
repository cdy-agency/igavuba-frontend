'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteDialog } from '@/components/dialog/delete-dialog';
import { BuilderLessonShell } from '@/components/course-builder/builder-lesson-shell';
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
  const [mediaUrl, setMediaUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const createText = useCreateTextContent(moduleId);
  const createVideo = useCreateVideoContent(moduleId);
  const createDocument = useCreateDocumentContent(moduleId);

  const isSubmitting =
    createText.isPending || createVideo.isPending || createDocument.isPending || isUploading;

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setMediaUrl(url);
      toast.success('File uploaded successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload file.'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error('Title is required.');
      return;
    }

    if (type === 'text') {
      const plainBody = body.replace(/<[^>]+>/g, '').trim();
      if (!plainBody) {
        toast.error('Lesson body is required.');
        return;
      }
      const response = await createText.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
        body,
      });
      onCreated(response.data.contentId);
      return;
    }

    if (!mediaUrl) {
      toast.error(type === 'video' ? 'Upload a video first.' : 'Upload a document first.');
      return;
    }

    if (type === 'video') {
      const response = await createVideo.mutateAsync({
        title: trimmedTitle,
        description: description.trim() || undefined,
        videoUrl: mediaUrl,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
      });
      onCreated(response.data.contentId);
      return;
    }

    const response = await createDocument.mutateAsync({
      title: trimmedTitle,
      description: description.trim() || undefined,
      fileUrl: mediaUrl,
    });
    onCreated(response.data.contentId);
  };

  const materials =
    type === 'text' ? null : (
      <div className="space-y-3">
        <Input
          type="file"
          accept={type === 'video' ? 'video/*' : undefined}
          disabled={isSubmitting}
          className="text-[12px]"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleUpload(file);
            event.target.value = '';
          }}
        />
        {isUploading ? (
          <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading...
          </div>
        ) : mediaUrl ? (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] font-medium text-primary hover:underline"
          >
            Browse Files
          </a>
        ) : (
          <button
            type="button"
            className="text-[12px] font-medium text-primary hover:underline"
            onClick={() => document.getElementById('create-lesson-file')?.click()}
          >
            Browse Files
          </button>
        )}
      </div>
    );

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      description={description}
      onDescriptionChange={setDescription}
      onDelete={onCancel}
      materials={materials}
    >
      {type === 'text' ? (
        <TiptapEditor
          name="lesson-body-create"
          content={body}
          onChange={setBody}
          placeholder="Write lesson content..."
          stickyToolbar={false}
        />
      ) : type === 'video' ? (
        <div className="space-y-3">
          {mediaUrl ? (
            <video src={mediaUrl} controls className="w-full rounded-md border" />
          ) : null}
          <Input
            type="number"
            min={1}
            value={durationSeconds}
            onChange={(event) => setDurationSeconds(event.target.value)}
            placeholder="Duration (seconds, optional)"
            className="h-9 max-w-xs text-[13px]"
          />
        </div>
      ) : null}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" size="sm" className="h-8 text-xs" onClick={() => void handleSubmit()} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
          Create lesson
        </Button>
      </div>
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
  const updateMutation = useUpdateTextContent(moduleId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setBody(item.content.textContent?.body ?? '<p></p>');
  }, [item]);

  const scheduleSave = (payload: { title?: string; description?: string; body?: string }) => {
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
        scheduleSave({ title: value.trim(), description, body });
      }}
      description={description}
      onDescriptionChange={(value) => {
        setDescription(value);
        scheduleSave({
          title,
          description: value.trim() || undefined,
          body,
        });
      }}
      onDelete={onDelete}
    >
      <TiptapEditor
        name={`lesson-body-${item.contentId}`}
        content={body}
        onChange={(value) => {
          setBody(value);
          scheduleSave({ title, description: description || undefined, body: value });
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
  const [durationSeconds, setDurationSeconds] = useState(
    item.content.videoContent?.durationSeconds?.toString() ?? '',
  );
  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateVideoContent(moduleId);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setVideoUrl(item.content.videoContent?.videoUrl ?? '');
    setDurationSeconds(item.content.videoContent?.durationSeconds?.toString() ?? '');
  }, [item]);

  const save = (payload: {
    title?: string;
    description?: string;
    videoUrl?: string;
    durationSeconds?: number;
  }) => updateMutation.mutate({ contentId: item.contentId, payload });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setVideoUrl(url);
      save({ title, description: description || undefined, videoUrl: url });
      toast.success('Video uploaded successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to upload video.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <BuilderLessonShell
      title={title}
      onTitleChange={setTitle}
      onTitleBlur={() =>
        save({ title: title.trim(), description: description || undefined, videoUrl })
      }
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={() =>
        save({
          title: title.trim(),
          description: description.trim() || undefined,
          videoUrl,
          durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
        })
      }
      onDelete={onDelete}
      materials={
        <div className="space-y-2">
          <Input
            type="file"
            accept="video/*"
            disabled={isUploading}
            className="text-[12px]"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = '';
            }}
          />
          {videoUrl ? (
            <a href={videoUrl} target="_blank" rel="noreferrer" className="text-[12px] font-medium text-primary hover:underline">
              View uploaded video
            </a>
          ) : (
            <p className="text-[12px] text-muted-foreground">No files exist</p>
          )}
        </div>
      }
    >
      {videoUrl ? <video src={videoUrl} controls className="w-full rounded-md border" /> : null}
      <Input
        type="number"
        min={1}
        value={durationSeconds}
        className="mt-4 h-9 max-w-xs text-[13px]"
        placeholder="Duration (seconds)"
        onBlur={() =>
          save({
            title: title.trim(),
            description: description || undefined,
            videoUrl,
            durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
          })
        }
        onChange={(event) => setDurationSeconds(event.target.value)}
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
  const [isUploading, setIsUploading] = useState(false);
  const updateMutation = useUpdateDocumentContent(moduleId);

  useEffect(() => {
    setTitle(item.content.title);
    setDescription(item.content.description ?? '');
    setFileUrl(item.content.documentContent?.fileUrl ?? '');
  }, [item]);

  const save = (payload: { title?: string; description?: string; fileUrl?: string }) =>
    updateMutation.mutate({ contentId: item.contentId, payload });

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFileUrl(url);
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
      onTitleChange={setTitle}
      onTitleBlur={() =>
        save({ title: title.trim(), description: description || undefined, fileUrl })
      }
      description={description}
      onDescriptionChange={setDescription}
      onDescriptionBlur={() =>
        save({ title: title.trim(), description: description.trim() || undefined, fileUrl })
      }
      onDelete={onDelete}
      materials={
        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-primary hover:underline">
            <Upload className="h-3.5 w-3.5" />
            Browse Files
            <input
              type="file"
              className="hidden"
              disabled={isUploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUpload(file);
                event.target.value = '';
              }}
            />
          </label>
          {fileUrl ? (
            <a href={fileUrl} target="_blank" rel="noreferrer" className="block truncate text-[12px] text-primary underline">
              {fileUrl}
            </a>
          ) : (
            <p className="text-[12px] text-muted-foreground">No files exist</p>
          )}
        </div>
      }
    >
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        Upload supporting documents for this lesson using the Lesson Material section below.
      </p>
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
