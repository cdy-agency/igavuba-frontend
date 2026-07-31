'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import { FontFamily, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';
import type { CertificateElement } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import { loadGoogleFont } from '@/lib/loadGoogleFont';
import { getDefaultPlaceholder } from '@/utils/certificate-template';

function getElementDisplayValue(element: CertificateElement) {
  if (element.value?.trim()) {
    return element.value;
  }

  return getDefaultPlaceholder(element.type as CertificateElementType);
}

interface TipTapTextEditorProps {
  element: CertificateElement;
  isEditing: boolean;
  onEditingComplete: (value: string) => void;
}

export function TipTapTextEditor({ element, isEditing, onEditingComplete }: TipTapTextEditorProps) {
  const currentFont = element.textStyle?.fontFamily || 'Montserrat';
  const currentSize = element.textStyle?.fontSize || 14;
  const currentColor = element.textStyle?.color || '#000000';
  const currentAlign = element.textStyle?.textAlign || 'center';
  const currentBold = element.textStyle?.fontWeight === 'bold';
  const currentItalic = element.textStyle?.fontStyle === 'italic';
  const isContentEditable = !element.locked && isEditing;

  useEffect(() => {
    if (currentFont) {
      loadGoogleFont(currentFont);
    }
  }, [currentFont]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false,
        paragraph: {
          HTMLAttributes: {
            class: 'outline-none',
          },
        },
      }),
      TextAlign.configure({ types: ['paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
    ],
    content: getElementDisplayValue(element),
    editable: isContentEditable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'outline-none h-full w-full focus:outline-none',
      },
    },
    onBlur: () => {
      if (isEditing) {
        onEditingComplete(editor?.getText() || '');
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (!isEditing && element.value !== editor.getText()) {
      editor.commands.setContent(getElementDisplayValue(element));
    }
  }, [editor, element, isEditing]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(isContentEditable);
  }, [editor, isContentEditable]);

  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom as HTMLElement;
    editorElement.style.fontFamily = `"${currentFont}", sans-serif`;
    editorElement.style.fontSize = `${currentSize}px`;
    editorElement.style.color = currentColor;
    editorElement.style.textAlign = currentAlign;
    editorElement.style.fontWeight = currentBold ? 'bold' : 'normal';
    editorElement.style.fontStyle = currentItalic ? 'italic' : 'normal';
    editorElement.style.cursor = isContentEditable ? 'text' : 'default';
  }, [
    currentAlign,
    currentBold,
    currentColor,
    currentFont,
    currentItalic,
    currentSize,
    editor,
    isContentEditable,
  ]);

  useEffect(() => {
    if (!editor || !isEditing) return;

    const timer = window.setTimeout(() => {
      editor.commands.focus('end');
    }, 10);

    return () => window.clearTimeout(timer);
  }, [editor, isEditing]);

  if (!editor) return null;

  return (
    <div
      className="relative h-full w-full"
      style={{
        userSelect: isContentEditable ? 'text' : 'none',
      }}
    >
      <EditorContent
        editor={editor}
        className={`h-full w-full [&_.ProseMirror]:h-full [&_.ProseMirror]:w-full [&_.ProseMirror]:outline-none ${isContentEditable ? '[&_.ProseMirror]:cursor-text' : '[&_.ProseMirror]:cursor-default'}`}
      />
    </div>
  );
}
