'use client';

import React from 'react';

interface ZoomControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

const ZOOM_PRESETS = [0.25, 0.5, 0.6, 0.75, 1, 1.25, 1.5, 2];

export function ZoomControls({
  scale,
  onScaleChange,
  minScale = 0.1,
  maxScale = 3,
}: ZoomControlsProps) {
  const handleZoomIn = () => {
    const nextScale = Math.min(scale + 0.1, maxScale);
    onScaleChange(Number(nextScale.toFixed(2)));
  };

  const handleZoomOut = () => {
    const nextScale = Math.max(scale - 0.1, minScale);
    onScaleChange(Number(nextScale.toFixed(2)));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleZoomOut}
        disabled={scale <= minScale}
        className="px-2 py-1 text-lg font-semibold border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom Out"
      >
        −
      </button>

      <select
        value={scale}
        onChange={(e) => onScaleChange(Number(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 min-w-[80px] text-center"
      >
        {ZOOM_PRESETS.map((preset) => (
          <option key={preset} value={preset}>
            {Math.round(preset * 100)}%
          </option>
        ))}
      </select>

      <button
        onClick={handleZoomIn}
        disabled={scale >= maxScale}
        className="px-2 py-1 text-lg font-semibold border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Zoom In"
      >
        +
      </button>
    </div>
  );
}
