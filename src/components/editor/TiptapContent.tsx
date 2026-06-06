'use client';

import { sanitizeHtml } from '@/lib/sanitize';

/**
 * Shared TipTap content styles for rendering HTML produced by the TipTap editor.
 * These styles mirror the editor's own EDITOR_STYLES so that previewed / rendered
 * content looks identical to what the author sees while editing.
 *
 * Scoped to `.tiptap-content` — wrap any raw TipTap HTML in that class.
 */
const TIPTAP_CONTENT_STYLES = `
  .tiptap-content.course-content-font {
    font-family: var(--font-sans), sans-serif;
  }

  /* ── Headings ─────────────────────────────────────────────────── */
  .tiptap-content h1 { font-size: 2.25em !important; font-weight: 700 !important; line-height: 1.2 !important; margin: 1em 0 0.5em !important; display: block !important; }
  .tiptap-content h2 { font-size: 1.875em !important; font-weight: 600 !important; line-height: 1.3 !important; margin: 1em 0 0.5em !important; display: block !important; }
  .tiptap-content h3 { font-size: 1.5em !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0.75em 0 0.5em !important; display: block !important; }
  .tiptap-content h4 { font-size: 1.25em !important; font-weight: 600 !important; line-height: 1.4 !important; margin: 0.75em 0 0.5em !important; display: block !important; }
  .tiptap-content h5 { font-size: 1.125em !important; font-weight: 600 !important; line-height: 1.5 !important; margin: 0.75em 0 0.5em !important; display: block !important; }
  .tiptap-content h6 { font-size: 1em !important; font-weight: 600 !important; line-height: 1.5 !important; margin: 0.75em 0 0.5em !important; display: block !important; }

  /* ── Paragraph ────────────────────────────────────────────────── */
  .tiptap-content p { margin: 0.5em 0 !important; line-height: 1.75 !important; display: block !important; }

  /* ── Lists ────────────────────────────────────────────────────── */
  .tiptap-content ul,
  .tiptap-content ul.tiptap-bullet-list { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.75em 0 !important; display: block !important; }
  .tiptap-content ol,
  .tiptap-content ol.tiptap-ordered-list { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.75em 0 !important; display: block !important; }
  .tiptap-content li.tiptap-list-item,
  .tiptap-content li { display: list-item !important; margin: 0.25em 0 !important; line-height: 1.6 !important; }
  .tiptap-content li p { margin: 0 !important; display: inline !important; }
  .tiptap-content li > ul,
  .tiptap-content li > ol { margin: 0.25em 0 !important; }
  .tiptap-content ul::marker,
  .tiptap-content ol::marker,
  .tiptap-content li::marker { color: inherit !important; }

  /* ── Inline marks ─────────────────────────────────────────────── */
  .tiptap-content strong { font-weight: 700 !important; }
  .tiptap-content em { font-style: italic !important; }
  .tiptap-content u { text-decoration: underline !important; }
  .tiptap-content s { text-decoration: line-through !important; }

  /* ── Code ──────────────────────────────────────────────────────── */
  .tiptap-content code { background-color: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; padding: 0.15em 0.4em !important; border-radius: 4px !important; font-family: ui-monospace, monospace !important; font-size: 0.875em !important; }
  .tiptap-content pre { background-color: hsl(var(--muted)) !important; color: hsl(var(--foreground)) !important; padding: 1em 1.25em !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; overflow-x: auto !important; margin: 1em 0 !important; display: block !important; }
  .tiptap-content pre code { background-color: transparent !important; color: inherit !important; padding: 0 !important; }

  /* ── Blockquote ────────────────────────────────────────────────── */
  .tiptap-content blockquote { border-left: 4px solid hsl(var(--border)) !important; padding-left: 1em !important; margin: 1em 0 !important; color: hsl(var(--muted-foreground)) !important; font-style: italic !important; display: block !important; }

  /* ── HR ────────────────────────────────────────────────────────── */
  .tiptap-content hr { border: none !important; border-top: 2px solid hsl(var(--border)) !important; margin: 2em 0 !important; }

  /* ── Links ─────────────────────────────────────────────────────── */
  .tiptap-content a { color: hsl(var(--primary)) !important; text-decoration: underline !important; cursor: pointer !important; }
  .tiptap-content a:hover { opacity: 0.8 !important; }

  /* ── Images ────────────────────────────────────────────────────── */
  .tiptap-content img { max-width: 100% !important; height: auto !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; margin: 1rem 0 !important; display: block !important; }

  /* ── Video ─────────────────────────────────────────────────────── */
  .tiptap-content video { max-width: 100% !important; height: auto !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; margin: 1rem 0 !important; display: block !important; }
  .tiptap-content .video-wrapper,
  .tiptap-content .video-node { position: relative !important; display: block !important; width: 100% !important; margin: 1rem 0 !important; }
  .tiptap-content .video-wrapper iframe,
  .tiptap-content .video-node iframe { width: 100% !important; aspect-ratio: 16/9 !important; border-radius: 8px !important; border: 1px solid hsl(var(--border)) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important; display: block !important; }

  /* ── Task list ─────────────────────────────────────────────────── */
  .tiptap-content ul[data-type="taskList"],
  .tiptap-content ul.tiptap-task-list { list-style: none !important; padding-left: 0 !important; margin: 0.75em 0 !important; }
  .tiptap-content li[data-type="taskItem"],
  .tiptap-content li.tiptap-task-item { display: flex !important; align-items: flex-start !important; gap: 0.5rem !important; list-style: none !important; }
  .tiptap-content li[data-type="taskItem"] input[type='checkbox'],
  .tiptap-content li.tiptap-task-item input[type='checkbox'] { cursor: default !important; width: 1rem !important; height: 1rem !important; margin-top: 0.25em !important; flex-shrink: 0 !important; accent-color: hsl(var(--primary)) !important; }

  /* ── Table ──────────────────────────────────────────────────────── */
  .tiptap-content .tableWrapper { overflow-x: auto !important; overflow-y: visible !important; margin: 1.25rem 0 !important; border-radius: 6px !important; border: 1px solid #cbd5e1 !important; -webkit-overflow-scrolling: touch !important; }
  .dark .tiptap-content .tableWrapper { border-color: #334155 !important; }
  .tiptap-content table { width: 100% !important; min-width: 100% !important; border-collapse: collapse !important; border-spacing: 0 !important; table-layout: auto !important; }
  .tiptap-content table colgroup { display: table-column-group !important; }
  .tiptap-content table col { display: table-column !important; }
  .tiptap-content table thead { display: table-header-group !important; }
  .tiptap-content table tbody { display: table-row-group !important; }
  .tiptap-content table tfoot { display: table-footer-group !important; }
  .tiptap-content table tr { display: table-row !important; }

  /* Table cells — light */
  .tiptap-content table td { display: table-cell !important; border: 1px solid #cbd5e1 !important; padding: 0.55rem 0.85rem !important; text-align: left !important; vertical-align: top !important; position: relative !important; min-width: 4em !important; word-break: break-word !important; background-color: #ffffff !important; color: #0f172a !important; }
  .tiptap-content table th { display: table-cell !important; border: 1px solid #cbd5e1 !important; padding: 0.55rem 0.85rem !important; text-align: left !important; vertical-align: top !important; position: relative !important; min-width: 4em !important; word-break: break-word !important; background-color: #f1f5f9 !important; color: #0f172a !important; font-weight: 600 !important; }

  /* Table cells — dark */
  .dark .tiptap-content table td { background-color: #1e293b !important; color: #e2e8f0 !important; border-color: #334155 !important; }
  .dark .tiptap-content table th { background-color: #0f172a !important; color: #f1f5f9 !important; border-color: #334155 !important; }

  /* Alternating stripes */
  .tiptap-content table tbody tr:nth-child(even) td { background-color: #f8fafc !important; }
  .dark .tiptap-content table tbody tr:nth-child(even) td { background-color: #182231 !important; }

  /* Row hover */
  .tiptap-content table tbody tr:hover td { background-color: #f0f4f8 !important; }
  .dark .tiptap-content table tbody tr:hover td { background-color: #243044 !important; }

  /* Paragraph inside a cell */
  .tiptap-content table td p,
  .tiptap-content table th p { margin: 0 !important; line-height: 1.6 !important; color: inherit !important; }

  /* Mobile responsiveness: prevent column collapse on small screens */
  @media (max-width: 767px) {
    .tiptap-content table td { min-width: 120px !important; }
    .tiptap-content table th { min-width: 120px !important; }
  }

  /* ── Highlight / mark ──────────────────────────────────────────── */
  .tiptap-content mark { background-color: #fef08a !important; color: #713f12 !important; border-radius: 2px !important; padding: 0.05em 0.15em !important; }
  .dark .tiptap-content mark { background-color: #854d0e !important; color: #fef9c3 !important; }

  /* ── Image resizer (rendered HTML may still contain the wrapper) ── */
  .tiptap-content .image-resizer { display: inline-block !important; position: relative !important; line-height: 0 !important; }
  .tiptap-content .image-resizer img { max-width: 100% !important; height: auto !important; }
  .tiptap-content .image-resizer .resize-trigger { display: none !important; }
`;

// Inject styles once globally (client-side only)
if (typeof document !== 'undefined') {
  let styleEl = document.getElementById('tiptap-content-styles') as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'tiptap-content-styles';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = TIPTAP_CONTENT_STYLES;
}

interface TiptapContentProps {
  html: string;
  className?: string;
}

/**
 * Renders sanitized TipTap HTML with styles that match the editor.
 * Drop-in replacement for `<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />`.
 */
export function TiptapContent({ html, className = '' }: TiptapContentProps) {
  return (
    <div
      className={`tiptap-content max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
