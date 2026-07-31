const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  /youtube\.com\/shorts\/([^&\n?#]+)/,
];

const VIMEO_PATTERNS = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];

export function isEmbeddableVideoUrl(url: string): boolean {
  return /youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(url.trim());
}

export function getVideoEmbedUrl(url: string, options?: { autoplay?: boolean }): string {
  const normalized = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const params = new URLSearchParams();
      if (options?.autoplay) {
        params.set('autoplay', '1');
        params.set('rel', '0');
      }
      const query = params.toString();
      return `https://www.youtube.com/embed/${match[1]}${query ? `?${query}` : ''}`;
    }
  }

  for (const pattern of VIMEO_PATTERNS) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      const params = new URLSearchParams();
      if (options?.autoplay) {
        params.set('autoplay', '1');
      }
      const query = params.toString();
      return `https://player.vimeo.com/video/${match[1]}${query ? `?${query}` : ''}`;
    }
  }

  return normalized;
}
