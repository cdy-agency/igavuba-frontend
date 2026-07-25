'use client';

import React from 'react';
import type { RulerProps } from '@/types/certificate';

const MAJOR = 100;
const MEDIUM = 50;
const MINOR = 10;

export function Ruler({ size, scale, orientation }: RulerProps) {
  const dimension = orientation === 'horizontal' ? size.width : size.height;
  const displayDimension = dimension * scale;
  const tickCount = Math.ceil(dimension / MINOR);

  if (orientation === 'horizontal') {
    return (
      <div
        className="absolute top-0 left-10 bg-white border-b border-gray-300 z-20"
        style={{ width: displayDimension, height: 32 }}
      >
        {Array.from({ length: tickCount + 1 }).map((_, i) => {
          const value = i * MINOR;
          const position = value * scale;

          let height = 4;
          let showLabel = false;

          if (value % MAJOR === 0) {
            height = 14;
            showLabel = true;
          } else if (value % MEDIUM === 0) {
            height = 8;
          }

          return (
            <div key={i} className="absolute bottom-0" style={{ left: position }}>
              <div className="w-px bg-gray-400" style={{ height }} />
              {showLabel && (
                <span className="absolute -top-1 left-1 text-[10px] text-gray-500">{value}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // VERTICAL
  return (
    <div
      className="absolute top-8 left-2 bg-white border-r border-gray-300 z-20"
      style={{ width: 32, height: displayDimension }}
    >
      {Array.from({ length: tickCount + 1 }).map((_, i) => {
        const value = i * MINOR;
        const position = value * scale;

        let width = 4;
        let showLabel = false;

        if (value % MAJOR === 0) {
          width = 10;
          showLabel = true;
        } else if (value % MEDIUM === 0) {
          width = 8;
        }

        return (
          <div key={i} className="absolute right-0" style={{ top: position }}>
            <div className="h-px bg-gray-400" style={{ width }} />
            {showLabel && (
              <span className="absolute -top-2 right-2 text-[10px] text-gray-500">{value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
