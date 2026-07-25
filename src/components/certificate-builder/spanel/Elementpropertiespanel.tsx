'use client';

import React from 'react';
import { AlignCenter, AlignLeft, AlignRight, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCertificateBuilder } from '@/components/certificate-builder/context/Certificatebuildercontext';
import { CertificateElement } from '@/types/certificate';
import { GOOGLE_FONT_OPTIONS } from '@/utils/google-fonts';

export function ElementPropertiesPanel() {
  const { selectedCertificate, selectedElementId, updateElement, flushElementUpdates } =
    useCertificateBuilder();

  const selectedElement = selectedCertificate?.layoutData.elements.find(
    (element: CertificateElement) => element.id === selectedElementId,
  );

  if (!selectedElement) {
    return null;
  }

  const handleUpdate = (updates: Partial<CertificateElement>) => {
    void updateElement(selectedElement.id, updates);
  };

  const handleFlush = () => {
    void flushElementUpdates(selectedElement.id);
  };

  const isMediaElement = selectedElement.type === 'IMAGE' || selectedElement.type === 'QR_CODE';

  const updateLinkedSize = (dimension: 'width' | 'height', rawValue: string) => {
    const nextValue = parseInt(rawValue, 10) || 0;
    const ratio = selectedElement.size.width / selectedElement.size.height || 1;

    if (dimension === 'width') {
      const width = Math.max(20, nextValue);
      const height = Math.max(20, Math.round(width / ratio));
      handleUpdate({
        size: { width, height },
      });
      return;
    }

    const height = Math.max(20, nextValue);
    const width = Math.max(20, Math.round(height * ratio));
    handleUpdate({
      size: { width, height },
    });
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">Element Properties</h3>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={selectedElement.position.x}
                onChange={(e) =>
                  handleUpdate({
                    position: { ...selectedElement.position, x: parseInt(e.target.value, 10) || 0 },
                  })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={selectedElement.position.y}
                onChange={(e) =>
                  handleUpdate({
                    position: { ...selectedElement.position, y: parseInt(e.target.value, 10) || 0 },
                  })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Width</label>
              <input
                type="number"
                value={selectedElement.size.width}
                onChange={(e) =>
                  isMediaElement
                    ? updateLinkedSize('width', e.target.value)
                    : handleUpdate({
                        size: {
                          ...selectedElement.size,
                          width: parseInt(e.target.value, 10) || 100,
                        },
                      })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Height</label>
              <input
                type="number"
                value={selectedElement.size.height}
                onChange={(e) =>
                  isMediaElement
                    ? updateLinkedSize('height', e.target.value)
                    : handleUpdate({
                        size: {
                          ...selectedElement.size,
                          height: parseInt(e.target.value, 10) || 100,
                        },
                      })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {isMediaElement && (
            <p className="mt-2 text-[11px] text-gray-500">
              Aspect ratio is locked for media elements.
            </p>
          )}
        </div>

        {(selectedElement.type === 'TEXT' ||
          selectedElement.type === 'CODE' ||
          selectedElement.type === 'DATE') && (
          <>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Text Content</label>
              <textarea
                value={selectedElement.value || ''}
                onChange={(e) => handleUpdate({ value: e.target.value })}
                onBlur={handleFlush}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Font Family</label>
              <select
                value={selectedElement.textStyle?.fontFamily || 'Montserrat'}
                onChange={(e) =>
                  handleUpdate({
                    textStyle: { ...selectedElement.textStyle, fontFamily: e.target.value },
                  })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {GOOGLE_FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Font Size</label>
              <input
                type="number"
                value={selectedElement.textStyle?.fontSize || 16}
                onChange={(e) =>
                  handleUpdate({
                    textStyle: {
                      ...selectedElement.textStyle,
                      fontSize: parseInt(e.target.value, 10) || 16,
                    },
                  })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Font Weight</label>
              <select
                value={selectedElement.textStyle?.fontWeight || 'normal'}
                onChange={(e) =>
                  handleUpdate({
                    textStyle: { ...selectedElement.textStyle, fontWeight: e.target.value },
                  })
                }
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="light">Light</option>
                <option value="600">Semi-Bold</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.textStyle?.color || '#000000'}
                  onChange={(e) =>
                    handleUpdate({
                      textStyle: { ...selectedElement.textStyle, color: e.target.value },
                    })
                  }
                  onBlur={handleFlush}
                  className="h-10 w-12 cursor-pointer rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={selectedElement.textStyle?.color || '#000000'}
                  onChange={(e) =>
                    handleUpdate({
                      textStyle: { ...selectedElement.textStyle, color: e.target.value },
                    })
                  }
                  onBlur={handleFlush}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Text Align</label>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    handleUpdate({
                      textStyle: { ...selectedElement.textStyle, textAlign: 'left' },
                    })
                  }
                  className={`flex-1 rounded-md border px-3 py-2 transition-colors ${
                    selectedElement.textStyle?.textAlign === 'left'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AlignLeft className="mx-auto h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleUpdate({
                      textStyle: { ...selectedElement.textStyle, textAlign: 'center' },
                    })
                  }
                  className={`flex-1 rounded-md border px-3 py-2 transition-colors ${
                    selectedElement.textStyle?.textAlign === 'center'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AlignCenter className="mx-auto h-4 w-4" />
                </button>
                <button
                  onClick={() =>
                    handleUpdate({
                      textStyle: { ...selectedElement.textStyle, textAlign: 'right' },
                    })
                  }
                  className={`flex-1 rounded-md border px-3 py-2 transition-colors ${
                    selectedElement.textStyle?.textAlign === 'right'
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <AlignRight className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {selectedElement.type === 'IMAGE' && (
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              value={selectedElement.value || ''}
              onChange={(e) => handleUpdate({ value: e.target.value })}
              onBlur={handleFlush}
              placeholder="Enter image URL"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" variant="outline" className="mt-2 w-full">
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Button>
          </div>
        )}

        {selectedElement.type === 'SHAPE' && (
          <>
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Fill Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.fillColor || '#000000'}
                  onChange={(e) => handleUpdate({ fillColor: e.target.value })}
                  onBlur={handleFlush}
                  className="h-10 w-12 cursor-pointer rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={selectedElement.fillColor || '#000000'}
                  onChange={(e) => handleUpdate({ fillColor: e.target.value })}
                  onBlur={handleFlush}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Border Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedElement.borderColor || '#000000'}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  onBlur={handleFlush}
                  className="h-10 w-12 cursor-pointer rounded-md border border-gray-300"
                />
                <input
                  type="text"
                  value={selectedElement.borderColor || '#000000'}
                  onChange={(e) => handleUpdate({ borderColor: e.target.value })}
                  onBlur={handleFlush}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Border Width</label>
              <input
                type="number"
                value={selectedElement.borderWidth || 0}
                onChange={(e) => handleUpdate({ borderWidth: parseInt(e.target.value, 10) || 0 })}
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">Border Radius</label>
              <input
                type="number"
                value={selectedElement.borderRadius || 0}
                onChange={(e) => handleUpdate({ borderRadius: parseInt(e.target.value, 10) || 0 })}
                onBlur={handleFlush}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedElement.opacity ?? 1}
            onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
            onMouseUp={handleFlush}
            className="w-full"
          />
          <div className="mt-1 text-xs text-gray-500">
            {Math.round((selectedElement.opacity ?? 1) * 100)}%
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">Rotation</label>
          <input
            type="range"
            min="-180"
            max="180"
            step="1"
            value={selectedElement.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: parseInt(e.target.value, 10) })}
            onMouseUp={handleFlush}
            className="w-full"
          />
          <div className="mt-1 text-xs text-gray-500">{selectedElement.rotation || 0}deg</div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-gray-700">
            Layer Order (Z-Index)
          </label>
          <input
            type="number"
            value={selectedElement.zIndex}
            onChange={(e) => handleUpdate({ zIndex: parseInt(e.target.value, 10) || 1 })}
            onBlur={handleFlush}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
