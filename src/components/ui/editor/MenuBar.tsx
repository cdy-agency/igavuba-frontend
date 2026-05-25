"use client";

import { Separator } from "@/components/ui/separator";
import type { Editor } from "@tiptap/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { ToolbarButton } from "./ToolbarButton";
import { TextColorPicker, BackgroundColorPicker } from "./ColorPicker";
import { LinkDialog } from "./LinkDialog";
import { ImageUpload } from "./ImageUpload";
import { VideoUpload } from "./videoUpload";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  TableIcon,
  Minus,
  CheckSquare,
  RemoveFormatting,
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
  onUploadError?: (error: string) => void;
}

export const MenuBar = ({ editor, onUploadError }: MenuBarProps) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const barInitialTop = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!barRef.current) return;

      // Record the bar's initial offset from the top once
      if (barInitialTop.current === null) {
        const rect = barRef.current.getBoundingClientRect();
        barInitialTop.current = rect.top + window.scrollY;
      }

      setBarHeight(barRef.current.offsetHeight);

      const shouldFix = window.scrollY >= (barInitialTop.current ?? 0);
      setIsFixed(shouldFix);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      barInitialTop.current = null;
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", () => {
        barInitialTop.current = null;
      });
    };
  }, []);

  const setTextColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run();
    },
    [editor],
  );

  const setBackgroundColor = useCallback(
    (color: string) => {
      editor?.chain().focus().toggleHighlight({ color }).run();
    },
    [editor],
  );

  const addLink = useCallback(
    (url: string) => {
      editor
        ?.chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
    [editor],
  );

  const addImage = useCallback(
    (url: string, title: string) => {
      editor?.chain().focus().setImage({ src: url, alt: title, title }).run();
    },
    [editor],
  );

  const addVideo = useCallback(
    (url: string, title: string, sourceType?: string) => {
      if (!editor) return;

      // Handle different video sources
      if (sourceType === "youtube") {
        // Extract YouTube video ID
        const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
        const match = url.match(youtubeRegex);
        const videoId = match ? match[1] : null;

        if (videoId) {
          // Use Tiptap's YouTube extension
          editor.chain().focus().setYoutubeVideo({
            src: `https://www.youtube.com/watch?v=${videoId}`,
            width: 640,
            height: 360,
          }).run();
        } else {
          onUploadError?.("Invalid YouTube URL");
        }
      } else if (sourceType === "vimeo") {
        // For Vimeo, we'll use an iframe
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const match = url.match(vimeoRegex);
        const videoId = match ? match[1] : null;

        if (videoId) {
          editor.chain().focus().insertContent(
            `<iframe src="https://player.vimeo.com/video/${videoId}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="rounded-lg border max-w-full my-4"></iframe>`
          ).run();
        } else {
          onUploadError?.("Invalid Vimeo URL");
        }
      } else if (sourceType === "dailymotion") {
        // For Dailymotion, extract video ID and embed
        const dailymotionRegex = /dailymotion\.com\/video\/([\w-]+)/;
        const match = url.match(dailymotionRegex);
        const videoId = match ? match[1] : null;

        if (videoId) {
          editor.chain().focus().insertContent(
            `<iframe frameborder="0" width="640" height="360" src="https://www.dailymotion.com/embed/video/${videoId}" allowfullscreen allow="autoplay" class="rounded-lg border max-w-full my-4"></iframe>`
          ).run();
        } else {
          onUploadError?.("Invalid Dailymotion URL");
        }
      } else if (sourceType === "twitch") {
        // For Twitch, extract video ID and embed
        const twitchRegex = /twitch\.tv\/videos\/(\d+)/;
        const match = url.match(twitchRegex);
        const videoId = match ? match[1] : null;

        if (videoId) {
          editor.chain().focus().insertContent(
            `<iframe src="https://player.twitch.tv/?video=${videoId}&parent=${window.location.hostname}" frameborder="0" allowfullscreen="true" scrolling="no" height="360" width="640" class="rounded-lg border max-w-full my-4"></iframe>`
          ).run();
        } else {
          onUploadError?.("Invalid Twitch URL");
        }
      } else {
        editor.chain().focus().setVideo({
          src: url,
          title: title || "Video",
        }).run();
      }
    },
    [editor, onUploadError],
  );

  const addTable = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      editor
        ?.chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
    [editor],
  );

  const toggleBulletList = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      editor?.chain().focus().toggleBulletList().run();
    },
    [editor],
  );

  const toggleOrderedList = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      editor?.chain().focus().toggleOrderedList().run();
    },
    [editor],
  );

  const toggleTaskList = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      editor?.chain().focus().toggleTaskList().run();
    },
    [editor],
  );

  if (!editor) return null;

  return (
    <>
      {/* Spacer for layout shift when fixed */}
      {isFixed && <div style={{ height: barHeight }} />}

      <div
        ref={barRef}
        className={`w-[100%] border-b border-border p-2 flex flex-wrap gap-1 transition-all duration-150
          ${
            isFixed
              ? "fixed top-0 z-[999] shadow-md bg-white/90 backdrop-blur"
              : "relative z-10 bg-background"
          }`}
      >
        {/* === Toolbar Groups === */}

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Bold}
            isActive={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          />
          <ToolbarButton
            icon={Italic}
            isActive={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          />
          <ToolbarButton
            icon={UnderlineIcon}
            isActive={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          />
          <ToolbarButton
            icon={Strikethrough}
            isActive={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          />
          <ToolbarButton
            icon={Code}
            isActive={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Code"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Heading1}
            isActive={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            title="Heading 1"
          />
          <ToolbarButton
            icon={Heading2}
            isActive={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            title="Heading 2"
          />
          <ToolbarButton
            icon={Heading3}
            isActive={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            title="Heading 3"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={List}
            isActive={editor.isActive("bulletList")}
            onClick={toggleBulletList}
            title="Bullet List"
          />
          <ToolbarButton
            icon={ListOrdered}
            isActive={editor.isActive("orderedList")}
            onClick={toggleOrderedList}
            title="Numbered List"
          />
          <ToolbarButton
            icon={CheckSquare}
            isActive={editor.isActive("taskList")}
            onClick={toggleTaskList}
            title="Task List"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={AlignLeft}
            isActive={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align Left"
          />
          <ToolbarButton
            icon={AlignCenter}
            isActive={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align Center"
          />
          <ToolbarButton
            icon={AlignRight}
            isActive={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align Right"
          />
          <ToolbarButton
            icon={AlignJustify}
            isActive={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            title="Justify"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Colors */}
        <div className="flex items-center gap-1">
          <TextColorPicker onColorSelect={setTextColor} />
          <BackgroundColorPicker onColorSelect={setBackgroundColor} />
          <ToolbarButton
            icon={Highlighter}
            isActive={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            title="Highlight"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <LinkDialog onAddLink={addLink} />
          <ImageUpload onAddImage={addImage} onUploadError={onUploadError} />
          <VideoUpload onAddVideo={addVideo} onUploadError={onUploadError} />
          <ToolbarButton
            icon={TableIcon}
            onClick={addTable}
            title="Add Table"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Other Actions */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Quote}
            isActive={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          />
          <ToolbarButton
            icon={Minus}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          />
          <ToolbarButton
            icon={RemoveFormatting}
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            title="Remove Formatting"
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Undo}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            title="Undo"
          />
          <ToolbarButton
            icon={Redo}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            title="Redo"
          />
        </div>
      </div>
    </>
  );
};