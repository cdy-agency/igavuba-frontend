'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

type TextAlign = 'left' | 'center' | 'right';

const MIN_FONT_SIZE_PX = 10;

function parseFontSizePx(fontSize: CSSProperties['fontSize'], fallback = 14) {
  if (typeof fontSize === 'number') return fontSize;
  if (typeof fontSize === 'string') {
    const parsed = Number.parseFloat(fontSize);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

/**
 * Renders certificate text and shrinks font size until the content fits the
 * element box — long course titles no longer get clipped at the bottom.
 */
export function CertificateTextElement({
  value,
  baseStyle,
  textAlign = 'center',
}: {
  value: string;
  baseStyle: CSSProperties;
  textAlign?: TextAlign;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const requestedFontSize = parseFontSizePx(baseStyle.fontSize);
  const [fontSize, setFontSize] = useState(requestedFontSize);

  const alignItems = textAlign === 'center' ? 'center' : 'flex-start';
  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';

  useLayoutEffect(() => {
    setFontSize(requestedFontSize);
  }, [requestedFontSize, value]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const fit = () => {
      let size = requestedFontSize;
      content.style.fontSize = `${size}px`;

      // Shrink until content fits both width and height of the template box.
      while (
        size > MIN_FONT_SIZE_PX &&
        (content.scrollHeight > container.clientHeight + 1 ||
          content.scrollWidth > container.clientWidth + 1)
      ) {
        size -= 0.5;
        content.style.fontSize = `${size}px`;
      }

      setFontSize(size);
      content.dataset.certificateTextFitted = 'true';
    };

    content.dataset.certificateTextFitted = 'false';
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(container);
    return () => observer.disconnect();
  }, [requestedFontSize, value, textAlign]);

  return (
    <div
      ref={containerRef}
      data-certificate-text="true"
      style={{
        ...baseStyle,
        fontSize: `${fontSize}px`,
        boxSizing: 'border-box',
        display: 'flex',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: '2px 6px',
        overflow: 'hidden',
        alignItems,
        justifyContent,
        lineHeight: 1.2,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <span
        ref={contentRef}
        data-certificate-text-content="true"
        style={{
          display: 'block',
          width: '100%',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          textAlign,
          lineHeight: 1.2,
          margin: 0,
          fontSize: `${fontSize}px`,
        }}
      >
        {value}
      </span>
    </div>
  );
}

/** @deprecated Prefer CertificateTextElement — kept for non-React call sites */
export function renderCertificateTextElement(
  value: string,
  baseStyle: CSSProperties,
  textAlign: TextAlign = 'center',
) {
  return (
    <CertificateTextElement value={value} baseStyle={baseStyle} textAlign={textAlign} />
  );
}
