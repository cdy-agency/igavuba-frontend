'use client';

import type { Editor } from '@tiptap/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextColorPicker, BackgroundColorPicker } from './ColorPicker';
import { LinkDialog } from './LinkDialog';
import { ImageUpload } from './ImageUpload';
import { VideoUpload } from './VideoUpload';
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
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
  ChevronDown,
  Indent,
  Outdent,
  Trash2,
  Rows3,
  Columns3,
  Grid2x2,
  Merge,
  Split,
  ToggleLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MenuBarProps {
  editor: Editor | null;
  onUploadError?: (error: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADING_LABELS: Record<number, string> = {
  0: 'Normal text',
  1: 'Heading 1',
  2: 'Heading 2',
  3: 'Heading 3',
  4: 'Heading 4',
  5: 'Heading 5',
  6: 'Heading 6',
};

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72, 96];

const FONT_FAMILIES = [
  { label: 'Albert Sans', value: 'Albert Sans' },
  { label: 'Quicksand', value: 'Quicksand' },
  { label: 'Andale Mono', value: 'Andale Mono' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Arial Black', value: 'Arial Black' },
  { label: 'Book Antiqua', value: 'Book Antiqua' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Palatino', value: 'Palatino Linotype' },
  { label: 'Symbol', value: 'Symbol' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Terminal', value: 'Terminal' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Webdings', value: 'Webdings' },
  { label: 'Wingdings', value: 'Wingdings' },
];

// Bullet list style options
const BULLET_STYLES: { label: string; symbol: string; value: string }[] = [
  { label: 'Disc', symbol: '●', value: 'disc' },
  { label: 'Circle', symbol: '○', value: 'circle' },
  { label: 'Square', symbol: '■', value: 'square' },
];

// Ordered list style options
const ORDERED_STYLES: { label: string; symbol: string; value: string }[] = [
  { label: 'Decimal', symbol: '1.', value: 'decimal' },
  { label: 'Lower alpha', symbol: 'a.', value: 'lower-alpha' },
  { label: 'Upper alpha', symbol: 'A.', value: 'upper-alpha' },
  { label: 'Lower roman', symbol: 'i.', value: 'lower-roman' },
  { label: 'Upper roman', symbol: 'I.', value: 'upper-roman' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyFontSize(editor: Editor, size: number) {
  if (size < 6 || size > 400) return;
  const px = `${size}px`;
  if ('setFontSize' in editor.commands && typeof editor.commands.setFontSize === 'function') {
    (editor.commands as { setFontSize: (size: string) => void }).setFontSize(px);
  } else {
    editor.chain().focus().setMark('textStyle', { fontSize: px }).run();
  }
}

function applyFontFamily(editor: Editor, family: string) {
  if ('setFontFamily' in editor.commands && typeof editor.commands.setFontFamily === 'function') {
    editor.chain().focus().run();
    (editor.commands as { setFontFamily: (family: string) => void }).setFontFamily(family);
  } else {
    editor.chain().focus().setMark('textStyle', { fontFamily: family }).run();
  }
}

function getCurrentFontSize(editor: Editor): number {
  const raw = editor.getAttributes('textStyle')?.fontSize as string | undefined;
  return raw ? parseInt(raw, 10) || 11 : 11;
}

function getCurrentFontFamily(editor: Editor): string {
  return editor.getAttributes('textStyle')?.fontFamily ?? 'Quicksand';
}

/**
 * Apply a list-style-type to the nearest bulletList or orderedList ancestor.
 *
 * Requires CustomBulletList / CustomOrderedList extensions (ListStyleExtensions.ts)
 * which declare `style` as an allowed attribute in the ProseMirror schema.
 * Without that schema declaration, setNodeMarkup silently drops the attribute.
 */
function applyListStyle(
  editor: Editor,
  listType: 'bulletList' | 'orderedList',
  styleValue: string,
) {
  const { state, view } = editor;
  const { schema, selection } = state;
  const nodeType = schema.nodes[listType];
  if (!nodeType) return;

  // Walk up the ancestor chain to find the list node position
  const { $from } = selection;
  let listPos: number | null = null;
  for (let depth = $from.depth; depth >= 0; depth--) {
    if ($from.node(depth).type === nodeType) {
      listPos = $from.before(depth);
      break;
    }
  }

  const dispatchStyle = (s: typeof state, v: typeof view) => {
    const { $from: f } = s.selection;
    let pos: number | null = listPos;
    // Re-resolve if we just toggled the list (listPos may be stale)
    if (pos === null) {
      for (let d = f.depth; d >= 0; d--) {
        if (f.node(d).type === nodeType) {
          pos = f.before(d);
          break;
        }
      }
    }
    if (pos === null) return;
    const node = s.doc.nodeAt(pos);
    if (!node) return;
    const newAttrs = { ...node.attrs, style: `list-style-type: ${styleValue};` };
    v.dispatch(s.tr.setNodeMarkup(pos, undefined, newAttrs));
    editor.commands.focus();
  };

  if (listPos !== null) {
    // List is already active — update style directly
    dispatchStyle(state, view);
  } else {
    // Toggle list on first, then set style after Tiptap re-renders
    if (listType === 'bulletList') editor.chain().focus().toggleBulletList().run();
    else editor.chain().focus().toggleOrderedList().run();
    setTimeout(() => dispatchStyle(editor.state, editor.view), 0);
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const PICKER_CLS = [
  'inline-flex items-center gap-1 h-7 px-2 rounded text-xs flex-shrink-0',
  'hover:bg-accent dark:hover:bg-accent/60 border border-input bg-transparent',
  'text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring',
].join(' ');

const DROPDOWN_TRIGGER_CLS = [
  'inline-flex items-center justify-center gap-0.5 h-7 px-1 rounded',
  'text-sm transition-colors duration-100 flex-shrink-0 select-none',
  'hover:bg-accent dark:hover:bg-accent/60',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  'text-foreground dark:text-foreground',
].join(' ');

// ─── Divider ──────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <span className="inline-block w-px h-5 bg-border dark:bg-border/60 mx-0.5 shrink-0 self-center" />
  );
}

// ─── TBtn ─────────────────────────────────────────────────────────────────────

interface TBtnProps {
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}

function TBtn({ onClick, active, disabled, title, children }: TBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={[
        'inline-flex items-center justify-center h-7 min-w-7 px-1 rounded',
        'text-sm transition-colors duration-100 shrink-0 select-none',
        'hover:bg-accent dark:hover:bg-accent/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        active
          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
          : 'text-foreground dark:text-foreground',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// ─── HeadingPicker ───────────────────────────────────────────────────────────

function HeadingPicker({ editor }: { editor: Editor }) {
  const currentLevel =
    ([1, 2, 3, 4, 5, 6] as const).find((l) => editor.isActive('heading', { level: l })) ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title="Text style" className={`${PICKER_CLS} w-27`}>
          <span className="truncate flex-1 text-left">{HEADING_LABELS[currentLevel]}</span>
          <ChevronDown className="w-3 h-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-44 p-1 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem
          className={`text-sm cursor-pointer rounded text-popover-foreground dark:text-popover-foreground ${currentLevel === 0 ? 'bg-primary/10 text-primary font-medium' : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().setParagraph().run();
          }}
        >
          Normal text
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border dark:bg-border" />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <DropdownMenuItem
            key={level}
            className={`cursor-pointer rounded text-popover-foreground dark:text-popover-foreground ${currentLevel === level ? 'bg-primary/10 text-primary font-medium' : ''}`}
            style={{ fontSize: `${Math.max(0.75, 1.35 - (level - 1) * 0.1)}rem`, fontWeight: 600 }}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setHeading({ level }).run();
            }}
          >
            {HEADING_LABELS[level]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── FontFamilyPicker ─────────────────────────────────────────────────────────

function FontFamilyPicker({ editor }: { editor: Editor }) {
  const currentValue = getCurrentFontFamily(editor);
  const currentLabel = FONT_FAMILIES.find((f) => f.value === currentValue)?.label ?? currentValue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" title="Font family" className={`${PICKER_CLS} w-22`}>
          <span className="truncate flex-1 text-left" style={{ fontFamily: currentValue }}>
            {currentLabel}
          </span>
          <ChevronDown className="w-3 h-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52 p-1 max-h-72 overflow-y-auto bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {FONT_FAMILIES.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            className={`cursor-pointer text-sm rounded py-1.5 text-popover-foreground dark:text-popover-foreground ${currentValue === value ? 'bg-primary/10 text-primary font-medium' : ''}`}
            style={{ fontFamily: value }}
            onMouseDown={(e) => {
              e.preventDefault();
              applyFontFamily(editor, value);
            }}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── FontSizeControl ──────────────────────────────────────────────────────────

function FontSizeControl({ editor }: { editor: Editor }) {
  const currentSize = getCurrentFontSize(editor);

  return (
    <div className="inline-flex items-center shrink-0 gap-0.5">
      <TBtn title="Decrease font size" onClick={() => applyFontSize(editor, currentSize - 1)}>
        <Minus className="w-3 h-3" />
      </TBtn>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Font size"
            onMouseDown={(e) => e.preventDefault()}
            className={[
              'h-7 w-9 text-center text-xs rounded border border-input bg-transparent',
              'hover:bg-accent dark:hover:bg-accent/60',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              'text-foreground dark:text-foreground shrink-0',
            ].join(' ')}
          >
            {currentSize}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="max-h-60 overflow-y-auto w-20 min-w-0 p-1 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {FONT_SIZES.map((size) => (
            <DropdownMenuItem
              key={size}
              className={`justify-center text-sm cursor-pointer rounded text-popover-foreground dark:text-popover-foreground ${currentSize === size ? 'bg-primary/10 text-primary font-medium' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                applyFontSize(editor, size);
              }}
            >
              {size}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <TBtn title="Increase font size" onClick={() => applyFontSize(editor, currentSize + 1)}>
        <span className="text-sm font-bold leading-none">+</span>
      </TBtn>
    </div>
  );
}

// ─── AlignmentPicker ─────────────────────────────────────────────────────────

function AlignmentPicker({ editor }: { editor: Editor }) {
  type Align = 'left' | 'center' | 'right' | 'justify';
  const alignments: { key: Align; icon: React.ReactNode; label: string }[] = [
    { key: 'left', icon: <AlignLeft className="w-3.5 h-3.5" />, label: 'Left' },
    { key: 'center', icon: <AlignCenter className="w-3.5 h-3.5" />, label: 'Center' },
    { key: 'right', icon: <AlignRight className="w-3.5 h-3.5" />, label: 'Right' },
    { key: 'justify', icon: <AlignJustify className="w-3.5 h-3.5" />, label: 'Justify' },
  ];
  const current = alignments.find((a) => editor.isActive({ textAlign: a.key })) ?? alignments[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Text alignment"
          onMouseDown={(e) => e.preventDefault()}
          className={DROPDOWN_TRIGGER_CLS}
        >
          {current?.icon}
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-1 w-32 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {alignments.map(({ key, icon, label }) => (
          <DropdownMenuItem
            key={key}
            className={`flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground dark:text-popover-foreground ${editor.isActive({ textAlign: key }) ? 'bg-primary/10 text-primary' : ''}`}
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign(key).run();
            }}
          >
            {icon}
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── LineSpacingButton ───────────────────────────────────────────────────────

const LINE_SPACINGS = [
  { label: 'Single', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: 'Double', value: '2' },
];

function LineSpacingButton({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Line spacing"
          onMouseDown={(e) => e.preventDefault()}
          className={DROPDOWN_TRIGGER_CLS}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
            <polyline points="8 3 5 6 2 3" />
            <polyline points="8 21 5 18 2 21" />
          </svg>
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-1 w-48 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {LINE_SPACINGS.map(({ label, value }) => (
          <DropdownMenuItem
            key={value}
            className="cursor-pointer text-sm rounded text-popover-foreground dark:text-popover-foreground"
            onMouseDown={(e) => {
              e.preventDefault();
              editor
                .chain()
                .focus()
                .updateAttributes('paragraph', { style: `line-height: ${value};` })
                .run();
            }}
          >
            {label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border dark:bg-border" />
        <DropdownMenuItem
          className="cursor-pointer text-sm rounded text-popover-foreground dark:text-popover-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { style: 'margin-top: 1em;' })
              .run();
          }}
        >
          Add space before paragraph
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-sm rounded text-popover-foreground dark:text-popover-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            editor
              .chain()
              .focus()
              .updateAttributes('paragraph', { style: 'margin-bottom: 1em;' })
              .run();
          }}
        >
          Add space after paragraph
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── ListBtn ─────────────────────────────────────────────────────────────────

const LIST_BTN_CLS = (active: boolean) =>
  [
    'inline-flex items-center justify-center h-7 text-sm transition-colors',
    'duration-100 flex-shrink-0 select-none',
    'hover:bg-accent dark:hover:bg-accent/60',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    active
      ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
      : 'text-foreground dark:text-foreground',
  ].join(' ');

function BulletListBtn({ editor }: { editor: Editor }) {
  const isActive = editor.isActive('bulletList');
  const currentStyle = isActive ? (editor.getAttributes('bulletList')?.style ?? '') : '';
  const currentType = BULLET_STYLES.find((s) => currentStyle.includes(s.value))?.value ?? 'disc';

  return (
    <div className="inline-flex items-center shrink-0">
      <button
        type="button"
        title="Bullet list"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBulletList().run();
        }}
        className={`${LIST_BTN_CLS(isActive)} px-1.5 rounded-l`}
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Bullet list style"
            onMouseDown={(e) => e.preventDefault()}
            className={`${LIST_BTN_CLS(isActive)} w-4 rounded-r border-l border-border/40`}
          >
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-1 w-40 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {BULLET_STYLES.map(({ label, symbol, value }) => (
            <button
              key={value}
              type="button"
              className={[
                'flex items-center gap-2.5 w-full cursor-pointer text-sm rounded py-1.5 px-2',
                'text-popover-foreground dark:text-popover-foreground',
                'hover:bg-accent dark:hover:bg-accent/60',
                currentType === value && isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-medium'
                  : '',
              ].join(' ')}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                applyListStyle(editor, 'bulletList', value);
              }}
            >
              <span
                className="w-5 text-center select-none text-base leading-none"
                aria-hidden="true"
              >
                {symbol}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function OrderedListBtn({ editor }: { editor: Editor }) {
  const isActive = editor.isActive('orderedList');
  const currentStyle = isActive ? (editor.getAttributes('orderedList')?.style ?? '') : '';
  const currentType =
    ORDERED_STYLES.find((s) => currentStyle.includes(s.value))?.value ?? 'decimal';

  return (
    <div className="inline-flex items-center shrink-0">
      <button
        type="button"
        title="Numbered list"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleOrderedList().run();
        }}
        className={`${LIST_BTN_CLS(isActive)} px-1.5 rounded-l`}
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Numbered list style"
            onMouseDown={(e) => e.preventDefault()}
            className={`${LIST_BTN_CLS(isActive)} w-4 rounded-r border-l border-border/40`}
          >
            <ChevronDown className="w-2.5 h-2.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="p-1 w-44 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {ORDERED_STYLES.map(({ label, symbol, value }) => (
            <button
              key={value}
              type="button"
              className={[
                'flex items-center gap-2.5 w-full cursor-pointer text-sm rounded py-1.5 px-2',
                'text-popover-foreground dark:text-popover-foreground',
                'hover:bg-accent dark:hover:bg-accent/60',
                currentType === value && isActive
                  ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary font-medium'
                  : '',
              ].join(' ')}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                applyListStyle(editor, 'orderedList', value);
              }}
            >
              <span className="w-5 text-center font-mono text-xs select-none" aria-hidden="true">
                {symbol}
              </span>
              <span>{label}</span>
            </button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function TaskListBtn({ editor }: { editor: Editor }) {
  const isActive = editor.isActive('taskList');
  return (
    <button
      type="button"
      title="Checklist"
      onMouseDown={(e) => {
        e.preventDefault();
        editor.chain().focus().toggleTaskList().run();
      }}
      className={`${LIST_BTN_CLS(isActive)} px-1.5 rounded`}
    >
      <CheckSquare className="w-3.5 h-3.5" />
    </button>
  );
}

// ─── TableMenu ───────────────────────────────────────────────────────────────

function TableMenu({ editor }: { editor: Editor }) {
  const inTable = editor.isActive('table');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Table"
          onMouseDown={(e) => e.preventDefault()}
          className={DROPDOWN_TRIGGER_CLS}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="p-1 w-52 bg-popover dark:bg-popover border border-border dark:border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {/* Insert table */}
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
        >
          <Grid2x2 className="w-4 h-4" />
          Insert table
        </DropdownMenuItem>

        {inTable && (
          <>
            <DropdownMenuSeparator className="bg-border dark:bg-border" />

            {/* Column operations */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addColumnBefore().run();
              }}
            >
              <Columns3 className="w-4 h-4" />
              Insert column before
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addColumnAfter().run();
              }}
            >
              <Columns3 className="w-4 h-4" />
              Insert column after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground text-red-600 dark:text-red-400"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteColumn().run();
              }}
            >
              <Columns3 className="w-4 h-4" />
              Delete column
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border dark:bg-border" />

            {/* Row operations */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addRowBefore().run();
              }}
            >
              <Rows3 className="w-4 h-4" />
              Insert row before
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().addRowAfter().run();
              }}
            >
              <Rows3 className="w-4 h-4" />
              Insert row after
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground text-red-600 dark:text-red-400"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteRow().run();
              }}
            >
              <Rows3 className="w-4 h-4" />
              Delete row
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border dark:bg-border" />

            {/* Cell operations */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              disabled={!editor.can().mergeCells()}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().mergeCells().run();
              }}
            >
              <Merge className="w-4 h-4" />
              Merge cells
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              disabled={!editor.can().splitCell()}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().splitCell().run();
              }}
            >
              <Split className="w-4 h-4" />
              Split cell
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border dark:bg-border" />

            {/* Header toggles */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeaderRow().run();
              }}
            >
              <ToggleLeft className="w-4 h-4" />
              Toggle header row
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeaderColumn().run();
              }}
            >
              <ToggleLeft className="w-4 h-4" />
              Toggle header column
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-popover-foreground"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeaderCell().run();
              }}
            >
              <ToggleLeft className="w-4 h-4" />
              Toggle header cell
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-border dark:bg-border" />

            {/* Delete table */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer text-sm rounded text-red-600 dark:text-red-400"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().deleteTable().run();
              }}
            >
              <Trash2 className="w-4 h-4" />
              Delete table
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── MenuBar ─────────────────────────────────────────────────────────────────
// KEY FIX: toolbar is now a single scrollable row using overflow-x-auto.
// We no longer use flex-wrap so items never spill to a second line.

export const MenuBar = ({ editor, onUploadError }: MenuBarProps) => {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [barHeight, setBarHeight] = useState(0);
  const barInitialTop = useRef<number | null>(null);

  useEffect(() => {
    const resetTop = () => {
      barInitialTop.current = null;
    };
    const handleScroll = () => {
      if (!barRef.current) return;
      if (barInitialTop.current === null) {
        barInitialTop.current = barRef.current.getBoundingClientRect().top + window.scrollY;
      }
      setBarHeight(barRef.current.offsetHeight);
      setIsFixed(window.scrollY >= (barInitialTop.current ?? 0));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resetTop);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resetTop);
    };
  }, []);

  const setTextColor = useCallback(
    (color: string) => editor?.chain().focus().setColor(color).run(),
    [editor],
  );

  const setBackgroundColor = useCallback(
    (color: string) => editor?.chain().focus().toggleHighlight({ color }).run(),
    [editor],
  );

  const addLink = useCallback(
    (url: string) => editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run(),
    [editor],
  );

  const addImage = useCallback(
    (url: string, title: string) =>
      editor
        ?.chain()
        .focus()
        .insertContent({ type: 'image', attrs: { src: url, alt: title, title } })
        .run(),
    [editor],
  );

  const addVideo = useCallback(
    (url: string, title: string) =>
      editor
        ?.chain()
        .focus()
        .insertContent({ type: 'video', attrs: { src: url, title } })
        .run(),
    [editor],
  );

  if (!editor) return null;

  return (
    <>
      {isFixed && <div style={{ height: barHeight }} aria-hidden />}

      <div
        ref={barRef}
        role="toolbar"
        aria-label="Text editor toolbar"
        className={[
          // Two explicit rows stacked vertically
          'w-full flex flex-col gap-0 px-2 py-1',
          'border-b border-border',
          'bg-background dark:bg-background',
          'text-foreground dark:text-foreground select-none transition-shadow duration-150',
          isFixed
            ? 'fixed top-0 left-0 right-0 z-999 shadow-md bg-background/95 dark:bg-background/95 backdrop-blur'
            : 'relative z-10',
        ].join(' ')}
      >
        {/* ════════════ ROW 1 ════════════ */}
        <div className="flex items-center gap-0.5 w-full flex-wrap">
          {/* ── History ── */}
          <TBtn
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Redo (Ctrl+Y)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Clear formatting"
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </TBtn>

          <Divider />

          {/* ── Text style ── */}
          <HeadingPicker editor={editor} />

          <Divider />

          {/* ── Font family ── */}
          <FontFamilyPicker editor={editor} />

          <Divider />

          {/* ── Font size ── */}
          <FontSizeControl editor={editor} />

          <Divider />

          {/* ── Inline marks ── */}
          <TBtn
            title="Bold (Ctrl+B)"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Italic (Ctrl+I)"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Underline (Ctrl+U)"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Strikethrough"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Inline code"
            active={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="w-3.5 h-3.5" />
          </TBtn>

          {/* Colors */}
          <TextColorPicker onColorSelect={setTextColor} />
          <BackgroundColorPicker onColorSelect={setBackgroundColor} />
          <TBtn
            title="Highlight"
            active={editor.isActive('highlight')}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </TBtn>

          <Divider />

          {/* ── Insert ── */}
          <LinkDialog onAddLink={addLink} />
          <ImageUpload onAddImage={addImage} onUploadError={onUploadError} />
          <VideoUpload onAddVideo={addVideo} onUploadError={onUploadError} />
          <TableMenu editor={editor} />
        </div>

        {/* ════════════ ROW 2 ════════════ */}
        <div className="flex items-center gap-0.5 w-full border-t border-border/40 pt-0.5">
          {/* ── Alignment ── */}
          <AlignmentPicker editor={editor} />

          {/* ── Line spacing ── */}
          <LineSpacingButton editor={editor} />

          <Divider />

          {/* ── Lists ── */}
          <TaskListBtn editor={editor} />
          <BulletListBtn editor={editor} />
          <OrderedListBtn editor={editor} />

          <Divider />

          {/* ── Indent ── */}
          <TBtn
            title="Decrease indent"
            onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          >
            <Outdent className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Increase indent"
            onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          >
            <Indent className="w-3.5 h-3.5" />
          </TBtn>

          <Divider />

          {/* ── Block ── */}
          <TBtn
            title="Blockquote"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote className="w-3.5 h-3.5" />
          </TBtn>
          <TBtn
            title="Horizontal rule"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <Minus className="w-3.5 h-3.5" />
          </TBtn>
        </div>
      </div>
    </>
  );
};

export const TOOLBAR_PICKER_CLS = PICKER_CLS;
