'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { PlayCircle, VideoOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CoursePreviewMediaProps {
  previewVideo: string | null;
  thumbnail: string | null;
  courseTitle: string;
  scrollThreshold?: number;
}

export function CoursePreviewMedia({
  previewVideo,
  thumbnail,
  courseTitle,
  scrollThreshold = 120,
}: CoursePreviewMediaProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasVideo = Boolean(previewVideo?.trim());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  const openVideo = useCallback(() => {
    if (hasVideo) {
      setIsModalOpen(true);
    }
  }, [hasVideo]);

  if (!hasVideo) {
    if (isScrolled) {
      return null;
    }

    return (
      <div className="relative flex aspect-video flex-col items-center justify-center bg-[#0c1f42] px-4 text-center">
        {thumbnail ? (
          <>
            <Image
              src={thumbnail}
              alt={courseTitle}
              fill
              className="object-cover opacity-30"
              sizes="340px"
            />
            <div className="absolute inset-0 bg-[#0c1f42]/80" />
          </>
        ) : null}
        <div className="relative z-10 flex flex-col items-center gap-2">
          <VideoOff className="h-10 w-10 text-white/70" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-white">No video for this course</p>
          <p className="max-w-[220px] text-xs text-white/70">
            A preview video has not been added yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden bg-[#0c1f42] transition-all duration-300',
          isScrolled ? 'aspect-auto' : 'aspect-video',
        )}
      >
        {isScrolled ? (
          <div className="p-4">
            <Button
              type="button"
              variant="outline"
              onClick={openVideo}
              className="h-11 w-full rounded-none border-foreground bg-background text-sm font-bold"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Play video
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openVideo}
            className="group relative block h-full w-full"
            aria-label="Play course preview video"
          >
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={courseTitle}
                fill
                className="object-cover"
                sizes="340px"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-[#0c1f42]" />
            )}
            <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center bg-white/95 text-[#0c1f42] shadow-lg transition-transform group-hover:scale-105">
                <PlayCircle className="h-10 w-10 fill-current" strokeWidth={1.5} />
              </span>
            </div>
          </button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden rounded-none border-border p-0 sm:max-w-4xl">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Course preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black">
            {isModalOpen && previewVideo ? (
              <video
                src={previewVideo}
                controls
                autoPlay
                className="h-full w-full"
                poster={thumbnail ?? undefined}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
