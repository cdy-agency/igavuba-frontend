import type { CSSProperties } from 'react';

type TextAlign = 'left' | 'center' | 'right';

export function renderCertificateTextElement(
  value: string,
  baseStyle: CSSProperties,
  textAlign: TextAlign = 'center',
) {
  const alignItems = textAlign === 'center' ? 'center' : 'flex-start';
  const justifyContent =
    textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start';

  return (
    <div
      data-certificate-text="true"
      style={{
        ...baseStyle,
        boxSizing: 'border-box',
        display: 'flex',
        width: '100%',
        height: '100%',
        margin: 0,
        padding: '2px 4px',
        overflow: 'hidden',
        alignItems,
        justifyContent,
        lineHeight: 1.15,
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <span
        data-certificate-text-content="true"
        style={{
          display: 'block',
          width: '100%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textAlign,
          lineHeight: 1.15,
          margin: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}
