"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Color from "@tiptap/extension-color";
import { Table } from "@tiptap/extension-table";
import { TextStyle } from "@tiptap/extension-text-style";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";
import { Image } from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect } from "react";
import { MenuBar } from "./MenuBar";
import { ImageBubbleMenu } from "./ImageBubbleMenu";
import { Video } from "./Videoextension";

interface TiptapEditorProps {
  name: string;
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  uploadEndpoint?: string;
  onUploadError?: (error: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  showTitle?: boolean;
}

export default function TiptapEditor({
  content = "",
  onChange,
  placeholder = "Start writing...",
  className = "",
  onUploadError,
  title = "",
  onTitleChange,
  showTitle = false,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),

      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: { class: "tiptap-heading" },
      }),

      Underline,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),

      Youtube.configure({
        controls: true,
        nocookie: false,
        HTMLAttributes: {
          class: "rounded-lg border max-w-full my-4",
        },
      }),

      // Custom Video extension for uploaded videos and direct URLs
      Video.configure({
        HTMLAttributes: {
          class: "rounded-lg border max-w-full my-4",
        },
      }),

      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border border-border max-w-full h-auto",
        },
      }),

      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),

      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({ placeholder }),

      TaskList,
      TaskItem.configure({ nested: true }),

      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,

      TextStyle,
      Color,
    ],
    content,
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // Keep form value in sync when reset/defaultValue changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="relative">
      {showTitle && (
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Title</Label>
          <Input
            placeholder="Enter title..."
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="mb-4"
          />
        </div>
      )}

      {/* Editor container with proper positioning context */}
      <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
        <MenuBar editor={editor} onUploadError={onUploadError} />

        <div className="relative p-4 min-h-[400px]">
          <EditorContent
            editor={editor}
            className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl mx-auto prose-neutral focus:outline-none"
            style={{ listStyle: "inherit" }}
          />
        </div>
      </div>

      {editor && <ImageBubbleMenu editor={editor} />}

      {/* Enhanced CSS for better image and video display */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          padding: 1rem;
          min-height: 300px;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* Video styling */
        .ProseMirror video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          display: block;
        }

        /* YouTube iframe styling */
        .ProseMirror iframe {
          max-width: 100%;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          display: block;
          aspect-ratio: 16 / 9;
          width: 100%;
          height: auto;
        }

        /* Image container with caption styling */
        .ProseMirror .image-container {
          margin: 1rem 0;
          display: block;
          text-align: center;
        }

        .ProseMirror .image-container img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: block;
          margin: 0 auto;
        }

        .ProseMirror .image-caption {
          margin-top: 0.5rem;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
          font-style: italic;
          text-align: center;
          background-color: #f9fafb;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          display: inline-block;
          max-width: 100%;
        }

        /* Fallback for regular images without captions */
        .ProseMirror img:not(.image-container img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
          display: block;
        }

        .ProseMirror .tiptap-heading {
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
        }

        .ProseMirror .tiptap-bullet-list,
        .ProseMirror .tiptap-ordered-list {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror .tiptap-list-item {
          margin: 0.25rem 0;
          line-height: 1.6;
        }

        .ProseMirror .tiptap-list-item p {
          margin: 0;
          display: inline;
        }

        .ProseMirror .tiptap-task-list {
          list-style: none;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror .tiptap-task-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ProseMirror .tiptap-task-item input[type="checkbox"] {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
          accent-color: #3b82f6;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          list-style-position: inside;
        }
        .ProseMirror .tiptap-bullet-list,
        .ProseMirror .tiptap-ordered-list {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          list-style-position: inside;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          list-style-position: inside;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem !important;
        }
        .ProseMirror .tiptap-task-item input[type="checkbox"] {
          cursor: pointer;
          width: 1rem;
          height: 1rem;
        }
        .ProseMirror .tiptap-task-item input[type="checkbox"] {
          margin-right: 0.5rem;
          vertical-align: middle;
        }
        .ProseMirror table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #ccc;
          padding: 0.5rem;
          text-align: left;
        }
        .ProseMirror th {
          background-color: #f9fafb;
          font-weight: 600;
        }
        .ProseMirror .tiptap-bullet-list,
        .ProseMirror .tiptap-ordered-list {
          margin: 0.5rem 0 0.5rem 1.25rem;
          padding-left: 1rem;
        }
        .ProseMirror.prose ul {
          list-style-type: disc !important;
        }
        .ProseMirror.prose ol {
          list-style-type: decimal !important;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0;
        }
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0.75rem 0;
        }
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }

        /* Image resize handles styling */
        .ProseMirror .image-resizer {
          display: inline-block;
          line-height: 0;
          position: relative;
        }

        .ProseMirror .image-resizer img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .ProseMirror .image-resizer .resize-trigger {
          position: absolute;
          right: -6px;
          bottom: -6px;
          width: 12px;
          height: 12px;
          border: 2px solid #3b82f6;
          border-radius: 2px;
          background-color: white;
          cursor: se-resize;
          z-index: 10;
        }

        .ProseMirror .image-resizer .resize-trigger:hover {
          background-color: #3b82f6;
        }

        .ProseMirror .image-resizer.selected .resize-trigger {
          background-color: #3b82f6;
        }

        /* Image selection styling */
        .ProseMirror .image-resizer.selected img {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Image rotation support */
        .ProseMirror img[style*="transform"] {
          transition: transform 0.3s ease;
        }

        /* Bubble menu styling */
        .ProseMirror .bubble-menu {
          z-index: 50;
        }
      `}</style>
    </div>
  );
}