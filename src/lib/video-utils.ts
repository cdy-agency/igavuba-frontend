const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
]);

const VIMEO_HOSTS = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);

function safeUrl(raw: string): URL | null {
  try {
    return new URL(raw.trim());
  } catch {
    return null;
  }
}

function extractYouTubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id || null;
  }

  if (!YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  const fromQuery = url.searchParams.get('v');
  if (fromQuery) return fromQuery;

  const parts = url.pathname.split('/').filter(Boolean);
  const markerIndex = parts.findIndex((part) =>
    ['embed', 'shorts', 'live', 'v'].includes(part),
  );
  if (markerIndex >= 0 && parts[markerIndex + 1]) {
    return parts[markerIndex + 1];
  }

  return null;
}

function extractVimeoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!VIMEO_HOSTS.has(host)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[0] === 'video' && parts[1] && /^\d+$/.test(parts[1])) {
    return parts[1];
  }

  const numeric = parts.find((part) => /^\d+$/.test(part));
  return numeric ?? null;
}

export function isEmbeddableVideoUrl(url: string): boolean {
  const parsed = safeUrl(url);
  if (!parsed) {
    return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(url.trim());
  }

  const host = parsed.hostname.toLowerCase();
  return YOUTUBE_HOSTS.has(host) || VIMEO_HOSTS.has(host);
}

export function getVideoEmbedUrl(url: string, options?: { autoplay?: boolean }): string {
  const normalized = url.trim();
  const parsed = safeUrl(normalized);

  if (parsed) {
    const youtubeId = extractYouTubeId(parsed);
    if (youtubeId) {
      const params = new URLSearchParams();
      if (options?.autoplay) {
        params.set('autoplay', '1');
        params.set('rel', '0');
      }
      const query = params.toString();
      return `https://www.youtube.com/embed/${youtubeId}${query ? `?${query}` : ''}`;
    }

    const vimeoId = extractVimeoId(parsed);
    if (vimeoId) {
      const params = new URLSearchParams();
      if (options?.autoplay) {
        params.set('autoplay', '1');
      }
      const query = params.toString();
      return `https://player.vimeo.com/video/${vimeoId}${query ? `?${query}` : ''}`;
    }
  }

  // Fallback for malformed but recognizable share links
  for (const pattern of [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([^&\n?#/]+)/i,
    /(?:vimeo\.com\/(?:video\/)?)(\d+)/i,
    /player\.vimeo\.com\/video\/(\d+)/i,
  ]) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const isVimeo = /vimeo/i.test(pattern.source);
      if (isVimeo) {
        return `https://player.vimeo.com/video/${match[1]}${options?.autoplay ? '?autoplay=1' : ''}`;
      }
      return `https://www.youtube.com/embed/${match[1]}${options?.autoplay ? '?autoplay=1&rel=0' : ''}`;
    }
  }

  return normalized;
}

/** True when the URL looks like a direct media file the browser can play natively. */
export function isDirectVideoFileUrl(url: string): boolean {
  const parsed = safeUrl(url);
  if (!parsed) return false;
  return /\.(mp4|webm|ogg|ogv|m4v|mov)(\?|#|$)/i.test(parsed.pathname);
}
