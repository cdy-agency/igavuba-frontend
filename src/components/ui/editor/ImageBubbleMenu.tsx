"use client";

import * as TipTapReact from "@tiptap/react";
const BubbleMenu: any = (TipTapReact as any).BubbleMenu ?? (() => null);
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Trash2, Link as LinkIcon } from "lucide-react";
import type { Editor } from "@tiptap/core";

interface ImageBubbleMenuProps {
  editor: Editor;
}

export const ImageBubbleMenu = ({ editor }: ImageBubbleMenuProps) => {
  if (!editor) return null;

  const getImageAttrs = () => editor.getAttributes("image");

  const setImageSize = (width: number, height: number) => {
    const { src, alt = "", title = "" } = getImageAttrs();
    if (src) {
      editor.chain().focus().setImage({ src, alt, title, width, height }).run();
    }
  };

  // Rotation feature removed: Tiptap image extension does not support 'rotation' property

  const deleteImage = () => editor.chain().focus().deleteSelection().run();

  const openImageLink = () => {
    const { src } = getImageAttrs();
    if (src) window.open(src, "_blank");
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      shouldShow={({ editor }: { editor: Editor }) => editor.isActive("image")}
    >
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
        {/* Size Controls */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <IconButton onClick={() => setImageSize(800, 600)} title="Large Size">
            <Maximize2 className="h-4 w-4" />
          </IconButton>
          <IconButton onClick={() => setImageSize(400, 300)} title="Medium Size">
            <Minimize2 className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <IconButton onClick={openImageLink} title="Open Image Link">
            <LinkIcon className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Delete */}
        <div className="flex items-center gap-1">
          <IconButton
            onClick={deleteImage}
            title="Delete Image"
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>
    </BubbleMenu>
  );
};

const IconButton = ({
  onClick,
  title,
  children,
  className = "",
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Button
   type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    className={`h-8 w-8 p-0 ${className}`}
    title={title}
  >
    {children}
  </Button>
);
