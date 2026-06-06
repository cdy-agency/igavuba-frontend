'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Video, Loader2, RotateCcw } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { uploadVideoToBackend, validateVideoFile } from './utils';

interface VideoUploadProps {
  onAddVideo: (url: string, title: string) => void;
  onUploadError?: (error: string) => void;
}

export const VideoUpload = ({ onAddVideo, onUploadError }: VideoUploadProps) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [showUploadUI, setShowUploadUI] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideo = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (videoUrl) {
        onAddVideo(videoUrl, videoTitle || 'Video');
        setVideoUrl('');
        setVideoTitle('');
      }
    },
    [videoUrl, videoTitle, onAddVideo],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateVideoFile(file);
      if (error) {
        setUploadError(error);
        onUploadError?.(error);
        return;
      }

      setSelectedFile(file);
      setUploadError('');
      setVideoTitle(file.name.split('.')[0] ?? '');

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
      setShowUploadUI(true);
    },
    [onUploadError],
  );

  const handleVideoUpload = useCallback(
    async (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (!selectedFile) return;

      setIsUploading(true);
      setUploadError('');

      try {
        const uploadedUrl = await uploadVideoToBackend(selectedFile);
        if (!uploadedUrl) throw new Error('No video URL returned');

        onAddVideo(uploadedUrl, videoTitle ?? selectedFile.name.split('.')[0]);

        // Reset states
        setSelectedFile(null);
        setVideoPreview('');
        setShowUploadUI(false);
        setVideoTitle('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setUploadError(msg);
        onUploadError?.(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [selectedFile, videoTitle, onAddVideo, onUploadError],
  );

  const resetUpload = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setVideoPreview('');
    setShowUploadUI(false);
    setVideoTitle('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add Video">
          <Video className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 z-[1001]"
        data-editor-popover
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Video</Label>
            {showUploadUI && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  resetUpload(e);
                }}
                title="Reset"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!showUploadUI ? (
            <>
              {/* URL Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter video URL (mp4, webm, etc.)"
                    value={videoUrl}
                    onChange={(e) => {
                      e.stopPropagation();
                      setVideoUrl(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddVideo();
                      }
                    }}
                  />
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddVideo(e);
                    }}
                    size="sm"
                    disabled={!videoUrl}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Video Title for URL videos */}
              {videoUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Video Title</Label>
                  <Input
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => {
                      e.stopPropagation();
                      setVideoTitle(e.target.value);
                    }}
                  />
                </div>
              )}

              {/* Separator */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-popover px-2 text-muted-foreground">or upload</span>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="video-input" className="text-xs text-muted-foreground">
                  Upload Video File
                </Label>
                <Input
                  id="video-input"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    e.stopPropagation();
                    handleFileSelect(e);
                  }}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Max 500MB. Supported: MP4, WebM, Ogg
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Video Preview */}
              {videoPreview && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Preview</Label>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg border border-border bg-muted max-h-48"
                  />
                </div>
              )}

              {/* Video Title Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Video Title</Label>
                <Input
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => {
                    e.stopPropagation();
                    setVideoTitle(e.target.value);
                  }}
                />
              </div>

              {/* File Info */}
              {selectedFile && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>File:</strong> {selectedFile.name}
                  </p>
                  <p>
                    <strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              )}

              {/* Upload Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVideoUpload(e);
                }}
                disabled={isUploading}
                className="w-full"
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Video'
                )}
              </Button>
            </>
          )}

          {/* Error Message */}
          {uploadError && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{uploadError}</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
