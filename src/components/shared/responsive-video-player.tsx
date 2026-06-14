'use client';

import { getVideoEmbedUrl, isEmbeddableVideoUrl } from '@/lib/video-utils';
import { cn } from '@/lib/utils';

interface ResponsiveVideoPlayerProps {
  url: string;
  title?: string;
  poster?: string | null;
  autoplay?: boolean;
  className?: string;
  onTimeUpdate?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
}

export function ResponsiveVideoPlayer({
  url,
  title = 'Video',
  poster,
  autoplay = false,
  className,
  onTimeUpdate,
}: ResponsiveVideoPlayerProps) {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (isEmbeddableVideoUrl(trimmedUrl)) {
    return (
      <iframe
        src={getVideoEmbedUrl(trimmedUrl, { autoplay })}
        title={title}
        className={cn('h-full w-full border-0', className)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={trimmedUrl}
      controls
      autoPlay={autoplay}
      playsInline
      poster={poster ?? undefined}
      className={cn('h-full w-full bg-black', className)}
      onTimeUpdate={onTimeUpdate}
    />
  );
}
