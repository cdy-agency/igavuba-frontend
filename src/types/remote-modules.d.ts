declare module 'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm' {
  export function toCanvas(
    element: HTMLElement,
    options?: Record<string, unknown>,
  ): Promise<HTMLCanvasElement>;
}
