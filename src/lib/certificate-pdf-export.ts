'use client';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { IssuedCertificatePreview } from '@/components/certificate/issued-certificate-preview';
import type { CertificateTemplate } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import type { IssuedCertificateContext } from '@/utils/certificate-template';
import { normalizeLayoutData } from '@/utils/certificate-template';
import { buildTransparentImageOverrides } from '@/lib/certificate-image-utils';
import { loadGoogleFont } from '@/lib/loadGoogleFont';

declare global {
  interface Window {
    html2canvas?: (
      element: HTMLElement,
      options?: Record<string, unknown>,
    ) => Promise<HTMLCanvasElement>;
    jspdf?: {
      jsPDF: new (options?: Record<string, unknown>) => {
        addImage: (
          imageData: string,
          format: string,
          x: number,
          y: number,
          width: number,
          height: number,
          alias?: string,
          compression?: string,
        ) => void;
        save: (fileName: string) => void;
      };
    };
  }
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

async function loadPdfLibraries() {
  await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
  await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');

  if (!window.html2canvas || !window.jspdf?.jsPDF) {
    throw new Error('PDF libraries failed to load');
  }

  return {
    html2canvas: window.html2canvas,
    jsPDF: window.jspdf.jsPDF,
  };
}

function collectTemplateImageUrls(template: CertificateTemplate) {
  const layoutData = normalizeLayoutData(template.layoutData);
  const urls = new Set<string>();

  if (layoutData.background?.type === 'image' && layoutData.background.value) {
    urls.add(layoutData.background.value);
  }
  if (layoutData.type === 'image' && layoutData.value) {
    urls.add(layoutData.value);
  }
  for (const element of layoutData.elements) {
    if (element.type === CertificateElementType.IMAGE && element.value) {
      urls.add(element.value);
    }
  }

  return Array.from(urls);
}

async function preloadTemplateAssets(template: CertificateTemplate) {
  const layoutData = normalizeLayoutData(template.layoutData);
  const fonts = new Set<string>();

  for (const element of layoutData.elements) {
    if (element.textStyle?.fontFamily) {
      fonts.add(element.textStyle.fontFamily);
    }
  }

  await Promise.all(Array.from(fonts).map((font) => loadGoogleFont(font)));

  if (typeof document !== 'undefined' && document.fonts?.load) {
    await Promise.all(
      Array.from(fonts).flatMap((font) => [
        document.fonts.load(`400 16px "${font}"`),
        document.fonts.load(`700 16px "${font}"`),
      ]),
    );
  }

  const imageUrls = collectTemplateImageUrls(template);
  await Promise.all(
    imageUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }
}

async function waitForImages(container: HTMLElement) {
  const images = Array.from(container.querySelectorAll('img'));

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => setTimeout(resolve, 250));
}

function fixCertificateCloneForCapture(root: HTMLElement) {
  root.querySelectorAll('[data-certificate-text-content]').forEach((node) => {
    const span = node as HTMLElement;
    span.style.display = 'block';
    span.style.transform = 'translateY(-2px)';
  });

  root.querySelectorAll('[data-certificate-text]').forEach((node) => {
    const container = node as HTMLElement;
    container.style.display = 'flex';
  });
}

async function captureElementToCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  try {
    const htmlToImageModule = await import(
      /* webpackIgnore: true */
      'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/+esm'
    );
    return await htmlToImageModule.toCanvas(element, {
      pixelRatio: 2,
      cacheBust: true,
      skipAutoScale: true,
      backgroundColor: '#ffffff',
    });
  } catch {
    const { html2canvas } = await loadPdfLibraries();
    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: -window.scrollY,
      letterRendering: true,
      onclone: (_doc, clonedNode) => {
        if (clonedNode instanceof HTMLElement) {
          fixCertificateCloneForCapture(clonedNode);
        }
      },
    });
  }
}

async function captureElementToPdf(
  element: HTMLElement,
  fileName: string,
  pageWidth: number,
  pageHeight: number,
) {
  const { jsPDF } = await loadPdfLibraries();
  const canvas = await captureElementToCanvas(element);

  const pdf = new jsPDF({
    orientation: pageWidth >= pageHeight ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pageWidth, pageHeight],
    compress: true,
  });

  pdf.addImage(
    canvas.toDataURL('image/png'),
    'PNG',
    0,
    0,
    pageWidth,
    pageHeight,
    undefined,
    'FAST',
  );
  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}

export async function exportCertificatePreviewToPdf({
  template,
  context,
  fileName,
}: {
  template: CertificateTemplate;
  context: IssuedCertificateContext;
  fileName: string;
}) {
  await preloadTemplateAssets(template);

  const layoutData = normalizeLayoutData(template.layoutData);
  const pageWidth = layoutData.size.width;
  const pageHeight = layoutData.size.height;
  const imageUrlOverrides = await buildTransparentImageOverrides(collectTemplateImageUrls(template));

  const mountNode = document.createElement('div');
  mountNode.style.position = 'fixed';
  mountNode.style.left = '0';
  mountNode.style.top = '0';
  mountNode.style.width = `${pageWidth}px`;
  mountNode.style.height = `${pageHeight}px`;
  mountNode.style.opacity = '0';
  mountNode.style.pointerEvents = 'none';
  mountNode.style.zIndex = '-1';
  mountNode.style.overflow = 'hidden';
  document.body.appendChild(mountNode);

  const root = createRoot(mountNode);

  try {
    root.render(
      createElement(IssuedCertificatePreview, {
        template,
        context,
        mode: 'export',
        imageUrlOverrides,
      }),
    );

    await waitForImages(mountNode);

    const exportElement = mountNode.querySelector('[data-certificate-export-root]');
    if (!exportElement || !(exportElement instanceof HTMLElement)) {
      throw new Error('Certificate export element not found');
    }

    await captureElementToPdf(exportElement, fileName, pageWidth, pageHeight);
  } finally {
    root.unmount();
    mountNode.remove();
  }
}

export async function exportCertificateElementToPdf(
  element: HTMLElement,
  fileName: string,
) {
  const pageWidth = element.offsetWidth;
  const pageHeight = element.offsetHeight;
  await waitForImages(element);
  await captureElementToPdf(element, fileName, pageWidth, pageHeight);
}
