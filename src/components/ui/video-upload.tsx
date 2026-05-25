"use client"

import type React from "react"

import { useState, useRef } from "react"
// import { Progress } from "@/components/ui/progress"
import { Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import axios from "@/lib/axios"

interface VideoUploadProps {
  onVideoUploaded: (url: string) => void
  onClose: () => void
}

export default function VideoUpload({ onVideoUploaded, onClose }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("video/")) {
      alert("Please select a video file")
      return
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      alert("File size must be less than 50MB")
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const blob = await axios.post('/file',{file})

      clearInterval(progressInterval)
      setProgress(100)

      setTimeout(() => {
        onVideoUploaded(blob.data.url)
        onClose()
      }, 500)
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Upload Video</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Upload a video file (MP4, WebM, MOV) up to 50MB</div>

        <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full" variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Uploading..." : "Choose Video File"}
        </Button>

        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <div className="text-sm text-center text-muted-foreground">{progress}% uploaded</div>
          </div>
        )}
      </div>
    </div>
  )
}
