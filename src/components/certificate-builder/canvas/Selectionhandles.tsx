'use client';

import React from 'react';
import { CertificateElementType } from '@/types/certificate';
import type { SelectionHandlesProps, ResizeHandle } from '@/types/certificate';

const HANDLE_POSITIONS: ResizeHandle[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];

const HANDLE_STYLES: Record<Exclude<ResizeHandle, null>, React.CSSProperties> = {
  nw: { top: '-4px', left: '-4px', cursor: 'nwse-resize' },
  ne: { top: '-4px', right: '-4px', cursor: 'nesw-resize' },
  sw: { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' },
  se: { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' },
  n: { top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
  e: { top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
  w: { top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'ew-resize' },
};

export function SelectionHandles({ element, onResizeStart }: SelectionHandlesProps) {
  const positions =
    element.type === CertificateElementType.IMAGE || element.type === CertificateElementType.QR_CODE
      ? (['nw', 'ne', 'sw', 'se'] as const)
      : HANDLE_POSITIONS;

  return (
    <>
      {positions.map((position) => {
        if (!position) return null;
        return (
          <div
            key={position}
            className={`absolute z-10 bg-blue-500 border border-white rounded-sm hover:scale-125 transition-transform pointer-events-auto ${
              element.type === CertificateElementType.IMAGE ||
              element.type === CertificateElementType.QR_CODE
                ? 'w-3 h-3'
                : 'w-2 h-2'
            }`}
            style={HANDLE_STYLES[position]}
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart(e, position);
            }}
          />
        );
      })}
    </>
  );
}
