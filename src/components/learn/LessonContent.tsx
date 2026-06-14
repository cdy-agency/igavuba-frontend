'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TiptapContent } from '@/components/editor/TiptapContent';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  File as FileIcon,
  Loader,
  X,
  Maximize2,
  Download,
  ZoomIn,
  ZoomOut,
  Lock,
} from 'lucide-react';
import { ContentType } from '@/types/content';
import type { LearningLessonRaw, LearningRenderableContent } from '@/types/learning';
import { DocumentViewer, useDocumentViewer } from '@/components/content/DocumentViewer';
import { CourseCompletionPage } from './Coursecompletionpage';
import { Button } from '@/components/ui/button';

const formatDate = (d?: string | Date | null) => {
  if (!d) return '-';
  try {
    return (d instanceof Date ? d : new Date(d)).toLocaleString();
  } catch {
    return String(d);
  }
};

const EmptyState = () => (
  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
    <div className="text-center">
      <FileText size={48} className="mx-auto mb-4 opacity-50" />
      <p>Select a lesson to view content</p>
    </div>
  </div>
);

const LessonHeader = ({ content }: { content: LearningRenderableContent }) => (
  <>
    <h1 className="text-2xl sm:text-3xl font-bold mb-2 dark:text-white truncate">
      {content.title}
    </h1>
    {content.description ? (
      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
        {content.description}
      </p>
    ) : null}
    <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6">
      <div>Date: {formatDate(content.createdAt)}</div>
    </div>
  </>
);

const TextLesson = ({ content }: { content: LearningRenderableContent }) => (
  <div className="max-w-full">
    {content.textContent?.bodyHtml ? (
      <TiptapContent
        html={content.textContent.bodyHtml}
        className="text-foreground course-content-font"
      />
    ) : (
      <div className="text-gray-600 dark:text-gray-400">No text content available.</div>
    )}
  </div>
);

const getEmbedUrl = (url: string): string => {
  for (const pattern of [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  for (const pattern of [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]) {
    const match = url.match(pattern);
    if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
  }
  return url;
};

const VideoLesson = ({ content }: { content: LearningRenderableContent }) => {
  const externalUrl = content.videoContent?.externalUrl;
  const embedUrl = externalUrl ? getEmbedUrl(externalUrl) : null;

  return (
    <div className="mb-3">
      {embedUrl ? (
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full sm:rounded-md border border-gray-200 dark:border-gray-700"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : content.videoContent?.media?.url ? (
        <div className="aspect-video w-full">
          <video controls className="w-full h-full sm:rounded-md bg-black">
            <source src={content.videoContent.media.url} />
          </video>
        </div>
      ) : (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 text-gray-600 dark:text-gray-300">
          No video source available.
        </div>
      )}
    </div>
  );
};

const FullScreenDocumentViewer = ({
  documentUrl,
  fileName,
  onClose,
  allowDownload = false,
}: {
  documentUrl: string;
  fileName: string;
  onClose: () => void;
  allowDownload?: boolean;
}) => {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex flex-col">
      <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <h3 className="text-white font-semibold text-lg truncate">{fileName}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
            <button
              type="button"
              onClick={() => setZoom((value) => Math.max(value - 10, 50))}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4 text-gray-300" />
            </button>
            <span className="text-sm text-gray-300 min-w-12 text-center">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((value) => Math.min(value + 10, 200))}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4 text-gray-300" />
            </button>
          </div>
          {allowDownload ? (
            <a
              href={documentUrl}
              download={fileName}
              className="px-3 sm:px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-800 p-2 sm:p-4">
        <div
          className="mx-auto bg-white shadow-2xl rounded"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            minHeight: '100%',
            width: zoom > 100 ? `${100 * (100 / zoom)}%` : '100%',
          }}
        >
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
            className="w-full rounded"
            style={{ height: 'calc(100vh - 100px)', minHeight: '800px' }}
            title={fileName}
          />
        </div>
      </div>
    </div>
  );
};

const DocumentLesson = ({ content }: { content: LearningRenderableContent }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const documentUrl = content.documentContent?.media?.url;
  const fileName = content.documentContent?.media?.fileName || 'Document';
  const allowDownload = content.documentContent?.allowDownload ?? false;

  if (!documentUrl) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500">
        <div className="text-center">
          <FileIcon size={48} className="mx-auto mb-4 opacity-50" />
          <p>No document available</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isFullScreen ? (
        <FullScreenDocumentViewer
          documentUrl={documentUrl}
          fileName={fileName}
          onClose={() => setIsFullScreen(false)}
          allowDownload={allowDownload}
        />
      ) : null}
      <div className="space-y-3">
        <div className="p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded shrink-0">
              <FileText className="w-6 h-6 text-primary dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate">{fileName}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Click &quot;Full Screen&quot; for better reading experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsFullScreen(true)}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-colors font-medium"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Full Screen</span>
            </button>
            {allowDownload ? (
              <a
                href={documentUrl}
                download={fileName}
                className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
            className="w-full rounded"
            style={{ height: '600px', minHeight: '600px' }}
            title={fileName}
          />
        </div>
      </div>
    </>
  );
};

interface Props {
  lesson?: {
    id?: string;
    type?: string;
    title?: string;
    raw?: LearningLessonRaw;
    completed?: boolean;
  };
  onPrev?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  sidebarOpen?: boolean;
  onCloseSidebar?: () => void;
  courseId: string;
  userId: string;
  courseTitle: string;
  enrollmentId: string;
  userName: string;
  isBlocked?: boolean;
  onBlockedAttempt?: () => void;
}

const LessonContent = ({
  lesson,
  onPrev,
  onNext,
  onComplete,
  sidebarOpen = true,
  courseId,
  userId,
  courseTitle,
  enrollmentId,
  userName,
  isBlocked,
  onBlockedAttempt,
}: Props) => {
  const { viewerState, openViewer, closeViewer } = useDocumentViewer();
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const raw = lesson?.raw;
  const content = raw?.content ?? ({} as LearningRenderableContent);
  const type = String(content.type ?? lesson?.type ?? '').toUpperCase();
  const isCompleted = !!lesson?.completed;
  const requiresScrollToComplete = type === ContentType.TEXT;

  useEffect(() => {
    if (!requiresScrollToComplete) {
      setHasReachedBottom(true);
      return;
    }

    const container = scrollContainerRef.current;
    if (!container || !lesson || lesson.type === 'COURSE_COMPLETION') {
      setHasReachedBottom(false);
      return;
    }

    container.scrollTop = 0;

    const updateBottomReached = () => {
      const reached = container.scrollTop + container.clientHeight >= container.scrollHeight - 10;
      const notScrollable = container.scrollHeight <= container.clientHeight + 1;
      setHasReachedBottom(reached || notScrollable);
    };

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateBottomReached);
    };

    setHasReachedBottom(false);
    scheduleUpdate();

    const timeoutIds = [80, 220].map((delay) => window.setTimeout(scheduleUpdate, delay));
    container.addEventListener('scroll', updateBottomReached);
    window.addEventListener('resize', scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
    if (container.firstElementChild) {
      resizeObserver.observe(container.firstElementChild);
    }

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      timeoutIds.forEach((id) => window.clearTimeout(id));
      resizeObserver.disconnect();
      container.removeEventListener('scroll', updateBottomReached);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [lesson?.id, lesson?.type, content.id, requiresScrollToComplete]);

  if (!lesson) return <EmptyState />;

  if (lesson.type === 'COURSE_COMPLETION') {
    return (
      <CourseCompletionPage
        courseId={courseId}
        userId={userId}
        courseTitle={courseTitle}
        enrollmentId={enrollmentId}
        userName={userName}
      />
    );
  }

  const nextButtonDisabled =
    isBlocked || (requiresScrollToComplete && !hasReachedBottom);
  const waitingForBottom = requiresScrollToComplete && !hasReachedBottom && !isBlocked;
  const nextButtonLabel = isBlocked
    ? 'Module Locked'
    : isCompleted
      ? 'Next'
      : 'Complete & Next';

  const handleNextClick = () => {
    if (isBlocked) {
      onBlockedAttempt?.();
      return;
    }
    if (isCompleted) {
      onNext?.();
    } else {
      onComplete?.();
    }
  };

  return (
    <>
      <DocumentViewer
        {...viewerState}
        onClose={closeViewer}
        allowDownload={viewerState.allowDownload}
      />

      <div ref={scrollContainerRef} className="h-full overflow-y-auto pb-24 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <LessonHeader content={content} />
          <div className="space-y-6">
            {type === ContentType.TEXT && <TextLesson content={content} />}
            {type === ContentType.VIDEO && <VideoLesson content={content} />}
            {type === ContentType.DOCUMENT && <DocumentLesson content={content} />}
            {!Object.values(ContentType).includes(type as ContentType) ? (
              <div className="text-gray-600 dark:text-gray-400">
                This content type is not supported yet.
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={`fixed bottom-0 right-0 left-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ${sidebarOpen ? 'md:left-96' : ''}`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex justify-between w-full sm:hidden">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Previous Lesson"
              >
                <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </button>
              <Button
                type="button"
                onClick={handleNextClick}
                disabled={nextButtonDisabled}
                title={nextButtonLabel}
                className={`flex items-center justify-center w-10 h-10 rounded-full text-white transition-colors ${
                  isBlocked
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : waitingForBottom
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {isBlocked ? <Lock size={18} /> : <ChevronRight size={20} />}
              </Button>
            </div>

            <div className="hidden sm:flex items-center justify-between w-full gap-4">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
                <span>Previous</span>
              </button>
              <Button
                type="button"
                onClick={handleNextClick}
                disabled={nextButtonDisabled}
                className={`flex items-center gap-2 px-6 py-2 font-medium rounded shadow-sm transition-colors ${
                  isBlocked
                    ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                    : waitingForBottom
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                {isBlocked ? <Lock size={16} /> : null}
                <span>{nextButtonLabel}</span>
                {!isBlocked && !nextButtonDisabled ? <ChevronRight size={18} /> : null}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonContent;
