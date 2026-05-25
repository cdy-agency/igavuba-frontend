import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Loader2, RotateCcw } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import { VIDEO_SOURCE_TYPES } from "./constants";
import { uploadVideoToBackend, validateVideoFile, validateVideoUrl, getVideoEmbedUrl } from "./utils";

interface VideoUploadProps {
  onAddVideo: (url: string, title: string, sourceType?: string) => void;
  onUploadError?: (error: string) => void;
}

export const VideoUpload = ({ onAddVideo, onUploadError }: VideoUploadProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Video source type for URL validation
  const [videoSource, setVideoSource] = useState<string>("youtube");

  // Video file upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddVideo = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      
      if (!videoUrl) return;

      // Validate URL based on selected source (client-side only)
      const error = validateVideoUrl(videoUrl, videoSource);
      if (error) {
        setUploadError(error);
        onUploadError?.(error);
        return;
      }

      // Pass the source type so the editor knows how to handle it
      onAddVideo(videoUrl, videoTitle || "Video", videoSource);
      setVideoUrl("");
      setVideoTitle("");
      setUploadError("");
    },
    [videoUrl, videoTitle, videoSource, onAddVideo, onUploadError]
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
      setUploadError("");

      // Create preview and set default title from filename
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
        setVideoTitle(file.name.split(".")[0]);
        setShowUploadOptions(true);
      };
      reader.readAsDataURL(file);
    },
    [onUploadError]
  );

  const handleVideoUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");

    try {
      // Upload video file to backend
      const videoUrl = await uploadVideoToBackend(selectedFile);
      if (!videoUrl) throw new Error("No video URL returned");

      // For uploaded files, use "direct" as the source type
      onAddVideo(videoUrl, videoTitle || selectedFile.name.split(".")[0], "direct");

      // Reset states
      setSelectedFile(null);
      setVideoPreview("");
      setShowUploadOptions(false);
      setVideoTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      onUploadError?.(msg);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, videoTitle, onAddVideo, onUploadError]);

  const resetUploadOptions = useCallback(() => {
    setSelectedFile(null);
    setVideoPreview("");
    setShowUploadOptions(false);
    setVideoTitle("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add Video">
          <Video className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Video</Label>
            {showUploadOptions && (
              <Button variant="ghost" size="sm" onClick={resetUploadOptions} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!showUploadOptions ? (
            <>
              {/* Video Source Type Selector */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Video Source</Label>
                <Select value={videoSource} onValueChange={setVideoSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(VIDEO_SOURCE_TYPES).map(([key, source]) => (
                      <SelectItem key={key} value={key}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the video platform to validate the URL format
                </p>
              </div>

              {/* Video URL Input */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Video URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={VIDEO_SOURCE_TYPES[videoSource as keyof typeof VIDEO_SOURCE_TYPES]?.placeholder || "Enter video URL"}
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setUploadError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddVideo();
                      }
                    }}
                  />
                  <Button onClick={handleAddVideo} size="sm" disabled={!videoUrl}>
                    Add
                  </Button>
                </div>
                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              </div>

              {/* Video Title for URL videos */}
              {videoUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Video Title (Optional)</Label>
                  <Input
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Upload from your device</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, WebM, OGG (max 100MB)
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Video Preview */}
              {videoPreview && (
                <div className="relative">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-40 rounded border bg-black"
                  />
                </div>
              )}

              {/* Upload Options */}
              <div className="space-y-3">
                {/* Video Title */}
                <div>
                  <Label className="text-xs text-muted-foreground">Video Title</Label>
                  <Input
                    placeholder="Enter video title"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This title will be displayed in the editor
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleVideoUpload} disabled={isUploading} className="flex-1">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Video"
                    )}
                  </Button>
                </div>

                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};