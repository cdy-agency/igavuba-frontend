'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-text-style/font-family';
import { FontSize } from '@tiptap/extension-text-style/font-size';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListItem } from '@tiptap/extension-list';
import Heading from '@tiptap/extension-heading';
import { ResizableImage } from 'tiptap-extension-resizable-image';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MenuBar } from './MenuBar';
import { ImageBubbleMenu } from './ImageBubbleMenu';
import { Video } from './extensions/Video';
import { CustomBulletList, CustomOrderedList } from './CustomBulletList';

interface TiptapEditorProps {
  name: string;
  content?: string;
  onChange?: (content: string) => void;
  onBlur?: (content: string) => void;
  placeholder?: string;
  className?: string;
  uploadEndpoint?: string;
  onUploadError?: (error: string) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  showTitle?: boolean;
  isPreview?: boolean;
  autoPreview?: boolean;
  previewClassName?: string;
}

function stripFontFamilyFromInlineStyles(html: string): string {
  return html.replace(/style=(['"])(.*?)\1/gi, (_, quote: string, styleValue: string) => {
    const cleaned = styleValue
      .split(';')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .filter((rule) => !rule.toLowerCase().startsWith('font-family'))
      .join('; ');

    if (!cleaned) {
      return '';
    }

    return `style=${quote}${cleaned}${cleaned.endsWith(';') ? '' : ';'}${quote}`;
  });
}

// ─── Editor Styles ─────────────────────────────────────────────────────────
const EDITOR_STYLES = `
  .tiptap-editor-wrapper .ProseMirror {
    outline: none;
    color: hsl(var(--foreground));
    caret-color: hsl(var(--foreground));
  }

  .tiptap-editor-wrapper .ProseMirror.course-content-font {
    font-family: var(--font-sans), sans-serif;
  }

  /* Preview mode */
  .tiptap-editor-wrapper .preview-mode .ProseMirror { user-select: text; -webkit-user-select: text; -moz-user-select: text; -ms-user-select: text; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror[contenteditable="false"] { cursor: default; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror a { pointer-events: auto; cursor: pointer; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror input[type='checkbox'] { pointer-events: auto; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror img { pointer-events: auto; cursor: default; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror video { pointer-events: auto; cursor: default; }
  .tiptap-editor-wrapper .preview-mode .bubble-menu { display: none !important; }

  /* Placeholder */
  .tiptap-editor-wrapper .ProseMirror.is-editor-empty:before {
    content: attr(data-placeholder);
    float: left;
    color: hsl(var(--muted-foreground));
    pointer-events: none;
    height: 0;
  }

  /* Headings */
  .tiptap-editor-wrapper .ProseMirror h1,
  .tiptap-editor-wrapper .ProseMirror h2,
  .tiptap-editor-wrapper .ProseMirror h3,
  .tiptap-editor-wrapper .ProseMirror h4,
  .tiptap-editor-wrapper .ProseMirror h5,
  .tiptap-editor-wrapper .ProseMirror h6 { color: hsl(var(--foreground)) !important; display: block !important; }
  .tiptap-editor-wrapper .ProseMirror h1 { font-size: 2.25em !important; font-weight: 700 !important; line-height: 1.2 !important; margin: 1em 0 0.5em !important; }
  .tiptap-editor-wrapper .ProseMirror h2 { font-size: 1.875em !important; font-weight: 600 !important; line-height: 1.3 !important; margin: 1em 0 0.5em !important; }
  .tiptap-editor-wrapper .ProseMirror h3 { font-size: 1.5em !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0.75em 0 0.5em !important; }
  .tiptap-editor-wrapper .ProseMirror h4 { font-size: 1.25em !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0.75em 0 0.5em !important; }
  .tiptap-editor-wrapper .ProseMirror h5 { font-size: 1.125em !important; font-weight: 600 !important; line-height: 1.5 !important; margin: 0.75em 0 0.5em !important; }
  .tiptap-editor-wrapper .ProseMirror h6 { font-size: 1em !important; font-weight: 600 !important; line-height: 1.5 !important; margin: 0.75em 0 0.5em !important; }

  /* Paragraph */
  .tiptap-editor-wrapper .ProseMirror p { margin: 0.5em 0 !important; line-height: 1.75 !important; display: block !important; color: hsl(var(--foreground)) !important; }

  /* Lists */
  .tiptap-editor-wrapper .ProseMirror ul,
  .tiptap-editor-wrapper .ProseMirror ul.tiptap-bullet-list {
    list-style-type: disc;
    padding-left: 1.5rem !important;
    margin: 0.75em 0 !important;
    display: block !important;
    color: hsl(var(--foreground)) !important;
  }
  .tiptap-editor-wrapper .ProseMirror ol,
  .tiptap-editor-wrapper .ProseMirror ol.tiptap-ordered-list {
    list-style-type: decimal;
    padding-left: 1.5rem !important;
    margin: 0.75em 0 !important;
    display: block !important;
    color: hsl(var(--foreground)) !important;
  }
  .tiptap-editor-wrapper .ProseMirror li.tiptap-list-item,
  .tiptap-editor-wrapper .ProseMirror li { display: list-item !important; margin: 0.25em 0 !important; line-height: 1.6 !important; color: hsl(var(--foreground)) !important; }
  .tiptap-editor-wrapper .ProseMirror li p { margin: 0 !important; display: inline !important; color: inherit !important; }
  .tiptap-editor-wrapper .ProseMirror li > ul, .tiptap-editor-wrapper .ProseMirror li > ol { margin: 0.25em 0 !important; }
  .tiptap-editor-wrapper .ProseMirror ul::marker,
  .tiptap-editor-wrapper .ProseMirror ol::marker,
  .tiptap-editor-wrapper .ProseMirror li::marker { color: hsl(var(--foreground)) !important; }

  /* Inline marks */
  .tiptap-editor-wrapper .ProseMirror strong { font-weight: 700 !important; color: hsl(var(--foreground)) !important; }
  .tiptap-editor-wrapper .ProseMirror em { font-style: italic !important; color: hsl(var(--foreground)) !important; }
  .tiptap-editor-wrapper .ProseMirror u { text-decoration: underline !important; }
  .tiptap-editor-wrapper .ProseMirror s { text-decoration: line-through !important; }

  /* Code */
  .tiptap-editor-wrapper .ProseMirror code { background-color: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; padding: 0.15em 0.4em !important; border-radius: 4px !important; font-family: ui-monospace, monospace !important; font-size: 0.875em !important; }
  .tiptap-editor-wrapper .ProseMirror pre { background-color: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; padding: 1em 1.25em !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; overflow-x: auto !important; margin: 1em 0 !important; display: block !important; }
  .tiptap-editor-wrapper .ProseMirror pre code { background-color: transparent !important; color: inherit !important; padding: 0 !important; }

  /* Blockquote */
  .tiptap-editor-wrapper .ProseMirror blockquote { border-left: 4px solid hsl(var(--border)) !important; padding-left: 1em !important; margin: 1em 0 !important; color: hsl(var(--muted-foreground)) !important; font-style: italic !important; display: block !important; }

  /* HR */
  .tiptap-editor-wrapper .ProseMirror hr { border: none !important; border-top: 2px solid hsl(var(--border)) !important; margin: 2em 0 !important; }

  /* Links */
  .tiptap-editor-wrapper .ProseMirror a { color: hsl(var(--primary)) !important; text-decoration: underline !important; cursor: pointer !important; }
  .tiptap-editor-wrapper .ProseMirror a:hover { opacity: 0.8 !important; }

  /* Images */
  .tiptap-editor-wrapper .ProseMirror img { max-width: 100% !important; height: auto !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; margin: 1rem 0 !important; display: block !important; }

  /* Video */
  .tiptap-editor-wrapper .ProseMirror video { max-width: 100% !important; height: auto !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; margin: 1rem 0 !important; display: block !important; }
  .tiptap-editor-wrapper .ProseMirror .video-wrapper { position: relative !important; display: block !important; width: 100% !important; margin: 1rem 0 !important; }
  .tiptap-editor-wrapper .ProseMirror .video-node { position: relative !important; display: block !important; width: 100% !important; margin: 1rem 0 !important; }
  .tiptap-editor-wrapper .ProseMirror .video-wrapper iframe,
  .tiptap-editor-wrapper .ProseMirror .video-node iframe { width: 100% !important; aspect-ratio: 16/9 !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; display: block !important; }
  .tiptap-editor-wrapper .ProseMirror .video-node.selected video { border: 2px solid hsl(var(--primary)) !important; outline: 2px solid hsl(var(--primary)) !important; outline-offset: 2px !important; }

  /* Task list */
  .tiptap-editor-wrapper .ProseMirror ul.tiptap-task-list,
  .tiptap-editor-wrapper .ProseMirror ul[data-type="taskList"] { list-style: none !important; padding-left: 0 !important; margin: 0.75em 0 !important; }
  .tiptap-editor-wrapper .ProseMirror li.tiptap-task-item,
  .tiptap-editor-wrapper .ProseMirror li[data-type="taskItem"] { display: flex !important; align-items: flex-start !important; gap: 0.5rem !important; list-style: none !important; }
  .tiptap-editor-wrapper .ProseMirror .tiptap-task-item input[type='checkbox'],
  .tiptap-editor-wrapper .ProseMirror li[data-type="taskItem"] input[type='checkbox'] { cursor: pointer !important; width: 1rem !important; height: 1rem !important; margin-top: 0.25em !important; flex-shrink: 0 !important; accent-color: hsl(var(--primary)) !important; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror input[type='checkbox'] { cursor: default !important; }

  /* ═══════════════════════════════════════════════════════════════════════
     TABLE — complete rewrite
     Problems fixed:
       1. overflow:hidden on <table> clipped content and broke scroll
       2. border-radius on <table> with border-collapse:collapse is ignored
          by browsers and caused rendering glitches
       3. ".ProseMirror > table" selector never matched — Tiptap always
          wraps tables in <div class="tableWrapper">
       4. Missing colgroup display rule — Tiptap injects <colgroup> for
          resizable columns; without display:table-column-group it can
          break column widths
       5. CSS variable --background in dark mode resolved to a dark colour,
          making cell text invisible; replaced with explicit opaque values
  ═══════════════════════════════════════════════════════════════════════ */

  /* 1 ── Wrapper div Tiptap inserts around every table */
  .tiptap-editor-wrapper .ProseMirror .tableWrapper {
    overflow-x: auto !important;
    overflow-y: visible !important;
    margin: 1.25rem 0 !important;
    border-radius: 6px !important;
    border: 1px solid #cbd5e1 !important; /* slate-300 — visible in light */
  }
  .dark .tiptap-editor-wrapper .ProseMirror .tableWrapper {
    border-color: #334155 !important; /* slate-700 */
  }

  /* 2 ── The <table> itself */
  .tiptap-editor-wrapper .ProseMirror table {
    width: 100% !important;
    min-width: 100% !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    table-layout: auto !important;
    /* NEVER set overflow:hidden or border-radius here —
       they break border-collapse and clip resizable columns */
  }

  /* 3 ── Structural display fixes so no CSS reset can hide rows/cells */
  .tiptap-editor-wrapper .ProseMirror table colgroup { display: table-column-group !important; }
  .tiptap-editor-wrapper .ProseMirror table col     { display: table-column !important; }
  .tiptap-editor-wrapper .ProseMirror table thead   { display: table-header-group !important; }
  .tiptap-editor-wrapper .ProseMirror table tbody   { display: table-row-group !important; }
  .tiptap-editor-wrapper .ProseMirror table tfoot   { display: table-footer-group !important; }
  .tiptap-editor-wrapper .ProseMirror table tr      { display: table-row !important; }

  /* 4 ── Data cells — light mode */
  .tiptap-editor-wrapper .ProseMirror table td {
    display: table-cell !important;
    border: 1px solid #cbd5e1 !important;   /* slate-300 */
    padding: 0.55rem 0.85rem !important;
    text-align: left !important;
    vertical-align: top !important;
    position: relative !important;
    min-width: 4em !important;
    word-break: break-word !important;
    background-color: #ffffff !important;
    color: #0f172a !important;              /* slate-900 */
  }

  /* 5 ── Header cells — light mode */
  .tiptap-editor-wrapper .ProseMirror table th {
    display: table-cell !important;
    border: 1px solid #cbd5e1 !important;   /* slate-300 */
    padding: 0.55rem 0.85rem !important;
    text-align: left !important;
    vertical-align: top !important;
    position: relative !important;
    min-width: 4em !important;
    word-break: break-word !important;
    background-color: #f1f5f9 !important;   /* slate-100 */
    color: #0f172a !important;              /* slate-900 */
    font-weight: 600 !important;
  }

  /* 6 ── Dark mode — data cells */
  .dark .tiptap-editor-wrapper .ProseMirror table td {
    background-color: #1e293b !important;   /* slate-800 */
    color: #e2e8f0 !important;              /* slate-200 */
    border-color: #334155 !important;       /* slate-700 */
  }

  /* 7 ── Dark mode — header cells */
  .dark .tiptap-editor-wrapper .ProseMirror table th {
    background-color: #0f172a !important;   /* slate-900 */
    color: #f1f5f9 !important;              /* slate-100 */
    border-color: #334155 !important;       /* slate-700 */
  }

  /* 8 ── Alternating stripes (light) */
  .tiptap-editor-wrapper .ProseMirror table tbody tr:nth-child(even) td {
    background-color: #f8fafc !important;   /* slate-50 */
  }

  /* 9 ── Alternating stripes (dark) */
  .dark .tiptap-editor-wrapper .ProseMirror table tbody tr:nth-child(even) td {
    background-color: #182231 !important;
  }

  /* 10 ── Row hover (light) */
  .tiptap-editor-wrapper .ProseMirror table tbody tr:hover td {
    background-color: #f0f4f8 !important;
  }

  /* 11 ── Row hover (dark) */
  .dark .tiptap-editor-wrapper .ProseMirror table tbody tr:hover td {
    background-color: #243044 !important;
  }

  /* 12 ── Paragraph inside a cell — no extra margin, inherit colour */
  .tiptap-editor-wrapper .ProseMirror table td p,
  .tiptap-editor-wrapper .ProseMirror table th p {
    margin: 0 !important;
    line-height: 1.6 !important;
    color: inherit !important;
  }

  /* 13 ── Selected cell highlight (Tiptap adds .selectedCell) */
  .tiptap-editor-wrapper .ProseMirror .selectedCell::after {
    content: "" !important;
    position: absolute !important;
    inset: 0 !important;
    background: rgba(59,130,246,0.18) !important;
    pointer-events: none !important;
    z-index: 2 !important;
  }

  /* 14 ── Column resize handle */
  .tiptap-editor-wrapper .ProseMirror .column-resize-handle {
    background-color: hsl(var(--primary)) !important;
    position: absolute !important;
    right: -2px !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 3px !important;
    pointer-events: none !important;
    z-index: 20 !important;
  }
  .tiptap-editor-wrapper .ProseMirror.resize-cursor { cursor: col-resize !important; }

  /* ═══════════════════════════════════════════════════════════════════════ */

  /* Highlight / mark */
  .tiptap-editor-wrapper .ProseMirror mark { background-color: #fef08a !important; color: #713f12 !important; border-radius: 2px !important; padding: 0.05em 0.15em !important; }
  .dark .tiptap-editor-wrapper .ProseMirror mark { background-color: #854d0e !important; color: #fef9c3 !important; }

  /* Image resizer */
  .tiptap-editor-wrapper .ProseMirror .image-resizer { display: inline-block !important; position: relative !important; line-height: 0 !important; }
  .tiptap-editor-wrapper .ProseMirror .image-resizer img { max-width: 100% !important; height: auto !important; }
  .tiptap-editor-wrapper .ProseMirror .image-resizer .resize-trigger { position: absolute !important; right: -6px !important; bottom: -6px !important; width: 12px !important; height: 12px !important; border: 2px solid hsl(var(--primary)) !important; border-radius: 2px !important; background-color: hsl(var(--background)) !important; cursor: se-resize !important; z-index: 10 !important; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror .image-resizer .resize-trigger { display: none !important; }
  .tiptap-editor-wrapper .ProseMirror .image-resizer .resize-trigger:hover { background-color: hsl(var(--primary)) !important; }
  .tiptap-editor-wrapper .ProseMirror .image-resizer.selected img { outline: 2px solid hsl(var(--primary)) !important; outline-offset: 2px !important; }
  .tiptap-editor-wrapper .preview-mode .ProseMirror .image-resizer.selected img { outline: none !important; }
`;

if (typeof document !== 'undefined') {
  let styleEl = document.getElementById('tiptap-editor-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tiptap-editor-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = EDITOR_STYLES;
}

export default function TiptapEditor({
  content = '',
  onChange,
  onBlur,
  placeholder = 'Start writing...',
  className = '',
  onUploadError,
  title = '',
  onTitleChange,
  showTitle = false,
  isPreview = false,
  autoPreview = false,
  previewClassName = '',
}: TiptapEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const editorDomRef = useRef<HTMLElement | null>(null);

  const shouldShowPreview = autoPreview ? !isFocused : isPreview;

  const extensions = useMemo(
    () => [
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: { class: 'tiptap-heading' },
      }),
      ListItem.configure({
        HTMLAttributes: { class: 'tiptap-list-item' },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: { HTMLAttributes: { class: 'tiptap-list-item' } },
      }),
      CustomBulletList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: { class: 'tiptap-bullet-list' },
      }),
      CustomOrderedList.configure({
        keepMarks: true,
        keepAttributes: true,
        HTMLAttributes: { class: 'tiptap-ordered-list' },
      }),
      Underline,
      ResizableImage.configure({
        HTMLAttributes: { class: 'rounded-lg border border-border max-w-full h-auto' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({ placeholder, emptyEditorClass: 'is-editor-empty' }),
      TaskList.configure({ HTMLAttributes: { class: 'tiptap-task-list' } }),
      TaskItem.configure({ nested: true, HTMLAttributes: { class: 'tiptap-task-item' } }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Video.configure({ HTMLAttributes: { class: 'video-node' } }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    extensions,
    content: content,
    editable: !shouldShowPreview,
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate({ editor }) {
      if (!isMountedRef.current || shouldShowPreview || !editor.isEditable) return;

      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }

      contentUpdateTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current || !editor.isEditable) return;
        const html = editor.getHTML();
        onChange?.(html);
      }, 100);
    },
    onBlur({ editor }) {
      if (isMountedRef.current) setIsFocused(false);
      try {
        onBlur?.(editor.getHTML());
      } catch (err) {
        console.error('[TiptapEditor] onBlur handler error:', err);
      }
    },
    onCreate({ editor }) {
      editorDomRef.current = editor.view.dom;
      if (isMountedRef.current) {
        setIsReady(true);
      }
    },
    onDestroy() {
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
      editorDomRef.current = null;
    },
    editorProps: {
      transformPastedHTML: (html) => stripFontFamilyFromInlineStyles(html),
      attributes: {
        class: [
          'tiptap-content focus:outline-none',
          shouldShowPreview
            ? 'min-h-[auto] p-0 cursor-default select-text'
            : 'min-h-[400px] p-5 bg-card rounded-xl shadow-md cursor-text',
          'transition-all placeholder:text-muted-foreground text-foreground text-base leading-relaxed',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        spellCheck: shouldShowPreview ? 'false' : 'true',
        autoCorrect: shouldShowPreview ? 'off' : 'on',
        autoCapitalize: 'sentences',
        tabIndex: shouldShowPreview ? '-1' : '0',
        role: 'textbox',
        'aria-readonly': shouldShowPreview ? 'true' : 'false',
      },
    },
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (contentUpdateTimeoutRef.current) {
        clearTimeout(contentUpdateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!autoPreview) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      const el = target as HTMLElement;
      if (el && el.closest && el.closest('[data-editor-popover]')) return;
      if (isMountedRef.current) setIsFocused(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [autoPreview]);

  useEffect(() => {
    if (!autoPreview || !isFocused) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMountedRef.current) setIsFocused(false);
        editor?.commands.blur();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [autoPreview, isFocused, editor]);

  useEffect(() => {
    if (!editor || !isReady || !isMountedRef.current) return;

    const currentEditable = editor.isEditable;
    const targetEditable = !shouldShowPreview;

    if (currentEditable !== targetEditable) {
      try {
        const wasUpdating = contentUpdateTimeoutRef.current;
        if (wasUpdating) {
          clearTimeout(wasUpdating);
          contentUpdateTimeoutRef.current = null;
        }
        editor.setEditable(targetEditable);
      } catch (error) {
        console.error('[TiptapEditor] Error in setEditable:', error);
      }
    }
  }, [editor, shouldShowPreview, isReady]);

  const handlePreviewClick = useCallback(() => {
    if (autoPreview && !isFocused && isReady && isMountedRef.current) {
      setIsFocused(true);
      if (editor && !editor.isDestroyed && isMountedRef.current) {
        try {
          editor.commands.focus();
        } catch (error) {
          console.error('[TiptapEditor] Error in focus:', error);
        }
      }
    }
  }, [autoPreview, isFocused, editor, isReady]);

  if (!editor) {
    return (
      <div className="relative">
        <div className="animate-pulse bg-muted rounded-lg h-100" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`tiptap-editor-wrapper relative ${autoPreview && shouldShowPreview ? previewClassName : ''}`}
      onClick={handlePreviewClick}
    >
      {showTitle && (
        <div className="mb-4">
          <Label className="text-sm font-medium mb-2 block">Title</Label>
          <Input
            placeholder="Enter title..."
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="mb-4"
            readOnly={shouldShowPreview}
          />
        </div>
      )}

      <div
        className={`relative ${shouldShowPreview ? 'preview-mode' : 'edit-mode bg-card rounded-lg border border-border'}`}
      >
        {!shouldShowPreview && isReady && (
          <div className="sticky top-0 z-20 bg-card rounded-t-lg">
            <MenuBar editor={editor} onUploadError={onUploadError} />
          </div>
        )}
        <div className="relative">
          <EditorContent editor={editor} className="tiptap-editor-content" />
        </div>
      </div>

      {!shouldShowPreview && isReady && <ImageBubbleMenu editor={editor} />}
    </div>
  );
}
