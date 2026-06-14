import React, { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Image from 'next/image';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName: string;
  fileType: string;
  allowDownload?: boolean;
}

export function DocumentViewer({
  isOpen,
  onClose,
  fileUrl,
  fileName,
  fileType,
  allowDownload = false,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Check if URL is a YouTube link
  const youtubeVideoId = getYouTubeVideoId(fileUrl);
  const isYouTubeVideo = !!youtubeVideoId;

  const isImage = fileType?.includes('image') || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(fileName);

  const isPDF = fileType?.includes('pdf') || /\.pdf$/i.test(fileName);

  const isWordDoc =
    fileType?.includes('word') ||
    fileType?.includes('msword') ||
    fileType?.includes('wordprocessingml') ||
    /\.(doc|docx)$/i.test(fileName);

  const isPowerPoint =
    fileType?.includes('presentation') ||
    fileType?.includes('powerpoint') ||
    /\.(ppt|pptx)$/i.test(fileName);

  const isExcel =
    fileType?.includes('spreadsheet') ||
    fileType?.includes('excel') ||
    /\.(xls|xlsx)$/i.test(fileName);

  // Google Workspace files
  const isGoogleDoc = fileType?.startsWith('application/vnd.google-apps.');

  // Combine all office documents
  const isOfficeDoc = isWordDoc || isPowerPoint || isExcel;
  const isDocument = isPDF || isOfficeDoc || isGoogleDoc;

  const isVideo =
    !isYouTubeVideo && (fileType?.includes('video') || /\.(mp4|mov|avi|webm)$/i.test(fileName));
  const isAudio = fileType?.includes('audio') || /\.(mp3|wav|ogg)$/i.test(fileName);
  const isText = fileType?.includes('text') || /\.(txt|md|json|xml|csv)$/i.test(fileName);

  // Determine the viewer URL
  let viewerUrl = fileUrl;

  if (isPDF) {
    // For PDFs, use direct URL with embed
    viewerUrl = fileUrl;
  } else if (isOfficeDoc) {
    // For Office documents, use Google Docs Viewer
    viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  } else if (isYouTubeVideo && youtubeVideoId) {
    // For YouTube videos, use embed URL
    viewerUrl = `https://www.youtube.com/embed/${youtubeVideoId}`;
  }

  const handleDownload = () => {
    // Don't allow downloading YouTube videos
    if (isYouTubeVideo) {
      window.open(fileUrl, '_blank');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    link.click();
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full h-full max-w-7xl max-h-[95vh] m-4 bg-white rounded-lg shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1 border-b bg-gray-50 rounded-t-lg">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{fileName}</h3>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isImage && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3 text-gray-700" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[4rem] text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3 text-gray-700" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2" />
              </>
            )}

            {allowDownload && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                title={isYouTubeVideo ? 'Open in YouTube' : 'Download'}
              >
                <Download className="w-5 h-5 text-gray-700" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-red-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-100 p-2">
          <div className="flex items-center justify-center min-h-full">
            {/* YouTube Video */}
            {isYouTubeVideo && (
              <div className="w-full max-w-5xl aspect-video bg-black rounded shadow-lg">
                <iframe
                  src={viewerUrl}
                  className="w-full h-full rounded"
                  title={fileName}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF and Office Documents */}
            {isDocument && !isYouTubeVideo && (
              <iframe
                src={viewerUrl}
                className="w-full h-full min-h-[600px] bg-white rounded shadow-lg"
                title={fileName}
              />
            )}

            {/* Images */}
            {isImage && (
              <Image
                src={fileUrl}
                alt={fileName}
                width={1000}
                height={800}
                className="max-w-full h-auto rounded shadow-lg"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            )}

            {/* Regular Videos (not YouTube) */}
            {isVideo && (
              <video src={fileUrl} controls className="max-w-full h-auto rounded shadow-lg">
                Your browser does not support video playback.
              </video>
            )}

            {/* Audio Files */}
            {isAudio && (
              <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <svg
                      className="w-12 h-12 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                </div>
                <audio src={fileUrl} controls className="w-full">
                  Your browser does not support audio playback.
                </audio>
              </div>
            )}

            {/* Text Files */}
            {isText && (
              <iframe
                src={fileUrl}
                className="w-full h-full min-h-[600px] bg-white rounded shadow-lg p-4"
                title={fileName}
              />
            )}

            {/* Unsupported File Type */}
            {!isDocument && !isImage && !isVideo && !isAudio && !isText && !isYouTubeVideo && (
              <div className="text-center p-12 bg-white rounded-lg shadow-lg">
                <Maximize2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Preview not available</p>
                <p className="text-gray-500 mb-6">
                  This file type cannot be previewed in the browser
                </p>
                {allowDownload && (
                  <button
                    onClick={handleDownload}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Download File
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for managing document viewer state
export function useDocumentViewer() {
  const [viewerState, setViewerState] = useState({
    isOpen: false,
    fileUrl: '',
    fileName: '',
    fileType: '',
    allowDownload: false,
  });

  const openViewer = (
    fileUrl: string,
    fileName: string,
    fileType: string,
    allowDownload: boolean = false,
  ) => {
    setViewerState({
      isOpen: true,
      fileUrl,
      fileName,
      fileType,
      allowDownload,
    });
  };

  const closeViewer = () => {
    setViewerState({
      isOpen: false,
      fileUrl: '',
      fileName: '',
      fileType: '',
      allowDownload: false,
    });
  };

  return { viewerState, openViewer, closeViewer };
}
