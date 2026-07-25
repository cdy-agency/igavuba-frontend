export async function stripNearWhiteBackground(url: string): Promise<string> {
  if (!url || typeof document === 'undefined') {
    return url;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r >= 235 && g >= 235 && b >= 235) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(url);
      }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

export async function buildTransparentImageOverrides(
  urls: string[],
): Promise<Record<string, string>> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean)));
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => [url, await stripNearWhiteBackground(url)] as const),
  );

  return Object.fromEntries(entries);
}
