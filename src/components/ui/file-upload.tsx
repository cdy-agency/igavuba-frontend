
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileCheck } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  onUpload: (url: string) => void;
  className?: string;
}

export function FileUpload({ 
  accept = "*/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onUpload,
  className 
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSize) {
      toast({
        title: "Error",
        description: `File size must be less than ${formatFileSize(maxSize)}`,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // In a real application, you would upload to your server/cloud storage here
      const fakeUrl = `https://storage.example.com/${file.name}`;
      onUpload(fakeUrl);
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className={cn(
            "flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer",
            "hover:border-primary/50 transition-colors",
            "text-sm text-muted-foreground",
            uploading && "opacity-50 cursor-not-allowed"
          )}
        >
          <Upload className="h-4 w-4" />
          {file ? file.name : "Choose a file"}
        </label>
        {file && !uploading && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {file && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            {uploading ? (
              <span className="text-muted-foreground">{progress}%</span>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                className="flex items-center gap-2"
              >
                <FileCheck className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
          {uploading && <Progress value={progress} className="h-1" />}
        </div>
      )}
    </div>
  );
}