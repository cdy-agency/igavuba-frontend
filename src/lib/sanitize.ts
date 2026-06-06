/**
 * Lightweight HTML sanitizer for TipTap-rendered content.
 * Strips scripts and inline event handlers before dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  if (!html) {
    return '';
  }

  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}
