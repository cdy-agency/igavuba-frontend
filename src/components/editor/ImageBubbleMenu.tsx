'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Trash2, Link as LinkIcon } from 'lucide-react';
import type { Editor } from '@tiptap/core';

interface ImageBubbleMenuProps {
  editor: Editor;
}

export const ImageBubbleMenu = ({ editor }: ImageBubbleMenuProps) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const update = () => {
      const hasImage = editor.isActive('image');
      if (!hasImage) {
        setVisible(false);
        return;
      }

      const { from } = editor.state.selection;
      const coords = editor.view.coordsAtPos(from);
      setPosition({
        top: Math.max(coords.top - 48, 8),
        left: coords.left,
      });
      setVisible(true);
    };

    editor.on('transaction', update);
    editor.on('selectionUpdate', update);

    return () => {
      editor.off('transaction', update);
      editor.off('selectionUpdate', update);
    };
  }, [editor]);

  const getImageAttrs = () => editor.getAttributes('image');

  const setImageSize = (width: number, height: number) => {
    editor.chain().focus().updateAttributes('image', { width, height }).run();
  };

  const deleteImage = () => editor.chain().focus().deleteSelection().run();

  const openImageLink = () => {
    const { src } = getImageAttrs();
    if (src) {
      window.open(src, '_blank');
    }
  };

  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed z-50 flex items-center gap-1 rounded-lg border border-border bg-popover p-2 shadow-lg"
      style={{ top: position.top, left: position.left }}
      data-editor-popover
    >
      <div className="flex items-center gap-1 border-r border-border pr-2">
        <IconButton onClick={() => setImageSize(800, 600)} title="Large Size">
          <Maximize2 className="h-4 w-4" />
        </IconButton>
        <IconButton onClick={() => setImageSize(400, 300)} title="Medium Size">
          <Minimize2 className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="flex items-center gap-1 border-r border-border pr-2">
        <IconButton onClick={openImageLink} title="Open Image Link">
          <LinkIcon className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          onClick={deleteImage}
          title="Delete Image"
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </IconButton>
      </div>
    </div>,
    document.body,
  );
};

const IconButton = ({
  onClick,
  title,
  children,
  className = '',
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
