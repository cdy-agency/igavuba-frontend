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
import { ImageIcon, Loader2, RotateCcw } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { IMAGE_SIZE_PRESETS } from "./constants";
import { resizeImage, uploadImageToBackend, validateImageFile } from "./utils";

interface ImageUploadProps {
  onAddImage: (url: string, title: string) => void;
  onUploadError?: (error: string) => void;
}

export const ImageUpload = ({ onAddImage, onUploadError }: ImageUploadProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Image resize states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [resizePreset, setResizePreset] = useState<string>("medium");
  const [customWidth, setCustomWidth] = useState<number>(600);
  const [customHeight, setCustomHeight] = useState<number>(400);
  const [showResizeOptions, setShowResizeOptions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (imageUrl) {
        onAddImage(imageUrl, imageTitle || "Image");
        setImageUrl("");
        setImageTitle("");
      }
    },
    [imageUrl, imageTitle, onAddImage]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateImageFile(file);
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
        setImagePreview(e.target?.result as string);
        setImageTitle(file.name.split(".")[0]);
        setShowResizeOptions(true);
      };
      reader.readAsDataURL(file);
    },
    [onUploadError]
  );

  const handleImageUpload = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError("");

    try {
      let processedFile = selectedFile;

      // Apply resizing if not original size
      if (resizePreset !== "original") {
        let targetWidth = customWidth;
        let targetHeight = customHeight;

        if (resizePreset in IMAGE_SIZE_PRESETS) {
          const preset = IMAGE_SIZE_PRESETS[resizePreset as keyof typeof IMAGE_SIZE_PRESETS];
          targetWidth = preset.width;
          targetHeight = preset.height;
        }

        if (targetWidth > 0 && targetHeight > 0) {
          const resizedDataUrl = await resizeImage(selectedFile, targetWidth, targetHeight, 0.8);

          // Convert data URL back to File
          const response = await fetch(resizedDataUrl);
          const blob = await response.blob();
          processedFile = new File([blob], selectedFile.name, { type: "image/jpeg" });
        }
      }

      const imageUrl = await uploadImageToBackend(processedFile);
      if (!imageUrl) throw new Error("No image URL returned");

      onAddImage(imageUrl, imageTitle || selectedFile.name.split(".")[0]);

      // Reset states
      setSelectedFile(null);
      setImagePreview("");
      setShowResizeOptions(false);
      setImageTitle("");
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
  }, [
    selectedFile,
    resizePreset,
    customWidth,
    customHeight,
    imageTitle,
    onAddImage,
    onUploadError,
  ]);

  const resetResizeOptions = useCallback(() => {
    setSelectedFile(null);
    setImagePreview("");
    setShowResizeOptions(false);
    setResizePreset("medium");
    setCustomWidth(600);
    setCustomHeight(400);
    setImageTitle("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Add Image">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Add Image</Label>
            {showResizeOptions && (
              <Button variant="ghost" size="sm" onClick={resetResizeOptions} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>

          {!showResizeOptions ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                  />
                  <Button onClick={handleAddImage} size="sm" disabled={!imageUrl}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Image Title for URL images */}
              {imageUrl && (
                <div>
                  <Label className="text-xs text-muted-foreground">Image Title</Label>
                  <Input
                    placeholder="Enter image title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Or upload from your device</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="w-full max-h-40 object-contain rounded border"
                  />
                </div>
              )}

              {/* Resize Options */}
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Size Preset</Label>
                  <Select value={resizePreset} onValueChange={setResizePreset}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IMAGE_SIZE_PRESETS).map(([key, preset]) => (
                        <SelectItem key={key} value={key}>
                          {preset.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {resizePreset === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Width</Label>
                      <Input
                        type="number"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        min="50"
                        max="2000"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height</Label>
                      <Input
                        type="number"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        min="50"
                        max="2000"
                      />
                    </div>
                  </div>
                )}

                {/* Image Title */}
                <div>
                  <Label className="text-xs text-muted-foreground">Image Title</Label>
                  <Input
                    placeholder="Enter image title"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This title will be displayed as alt text and shown on hover in the editor
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleImageUpload} disabled={isUploading} className="flex-1">
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Image"
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
