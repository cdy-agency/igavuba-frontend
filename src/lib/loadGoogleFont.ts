const loadedFonts = new Set<string>();

export async function loadGoogleFont(fontFamily: string) {
  const normalized = fontFamily.trim();
  if (!normalized || loadedFonts.has(normalized)) {
    return;
  }

  if (typeof document === 'undefined') {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    normalized.replace(/\s+/g, '+'),
  )}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
  loadedFonts.add(normalized);
}
