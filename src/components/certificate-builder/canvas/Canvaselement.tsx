'use client';

import { memo, useRef, useEffect, useState, useCallback } from 'react';
import type { CertificateElement } from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import { SelectionHandles } from './Selectionhandles';
import type { ResizeHandle } from '@/types/certificate';
import Image from 'next/image';
import { TipTapTextEditor } from '../Tiptaptexteditor';
import { FloatingToolbar } from './FloatingToolbar';
import { X } from 'lucide-react';
import {
  isTextBasedElement,
  getDefaultPlaceholder,
  isContentEditable,
} from '@/utils/certificate-template';

interface CanvasElementProps {
  element: CertificateElement;
  isSelected: boolean;
  isEditing: boolean;
  onRectChange: (rect: DOMRect, el: CertificateElement) => void;
  onDragStart: (e: React.MouseEvent, element: CertificateElement) => void;
  onResizeStart: (e: React.MouseEvent, element: CertificateElement, handle: ResizeHandle) => void;
  onSelect: (elementId: string) => void;
  onDoubleClick: (element: CertificateElement) => void;
  onUpdate: (updates: Partial<CertificateElement>) => void;
  onEditingComplete: (value: string) => void;
  onEditingTextChange?: (value: string) => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onCopy: () => void;
  onImageUpload?: () => void;
  totalLayers: number;
  scale: number;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

function CanvasElementComponent({
  element,
  isSelected,
  isEditing,
  onRectChange,
  onDragStart,
  onResizeStart,
  onSelect,
  onDoubleClick,
  onUpdate,
  onEditingComplete,
  onDelete,
  onBringForward,
  onSendBackward,
  onCopy,
  onImageUpload,
  totalLayers,
  scale,
  canvasRef,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const moveHandleRef = useRef<HTMLButtonElement>(null);
  const selectImageTextRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if ((isSelected || isEditing) && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();

      if (
        !elementRect ||
        rect.x !== elementRect.x ||
        rect.y !== elementRect.y ||
        rect.width !== elementRect.width ||
        rect.height !== elementRect.height
      ) {
        setElementRect(rect);
        onRectChange(rect, element);
      }
    }
  }, [
    isSelected,
    isEditing,
    element.position.x,
    element.position.y,
    element.size.width,
    element.size.height,
    scale,
    elementRect,
    element,
    onRectChange,
  ]);

  const handleOptimizedUpdate = useCallback(
    (updates: Partial<CertificateElement>) => {
      onUpdate(updates);
    },
    [onUpdate],
  );

  const renderElementContent = () => {
    if (isTextBasedElement(element.type)) {
      return (
        <TipTapTextEditor
          element={element}
          isEditing={isEditing}
          onEditingComplete={onEditingComplete}
        />
      );
    }

    // IMAGE ELEMENT
    if (element.type === CertificateElementType.IMAGE) {
      if (!element.value) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400 text-sm font-medium">
            <span
              ref={selectImageTextRef}
              className="cursor-pointer hover:text-gray-600 transition-colors px-4 py-2 rounded hover:bg-gray-200"
              onClick={(e) => {
                e.stopPropagation();
                if (onImageUpload) onImageUpload();
              }}
            >
              SELECT IMAGE
            </span>
          </div>
        );
      }
      return (
        <div className="relative w-full h-full group">
          <Image
            src={element.value}
            alt="Element"
            fill
            className="object-contain pointer-events-none select-none"
            draggable={false}
          />
          {(isSelected || isEditing) && (
            <div className="absolute inset-0 bg-black/60 bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-[5]">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (onImageUpload) onImageUpload();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="text-white text-sm font-medium"
              >
                UPDATE IMAGE
              </span>
            </div>
          )}
        </div>
      );
    }

    // SHAPE ELEMENT
    if (element.type === CertificateElementType.SHAPE) {
      const borderRadius = element.borderRadius || 0;
      return (
        <div
          className="w-full h-full pointer-events-none"
          style={{
            backgroundColor: element.fillColor || '#9ca3af',
            borderRadius: borderRadius >= 50 ? '50%' : `${borderRadius}px`,
          }}
        />
      );
    }

    // QR_CODE ELEMENT
    if (element.type === CertificateElementType.QR_CODE) {
      const qrData = element.value || `https://certificate.example.com/${element.id}`;
      const width = element.size?.width || 150;
      const height = element.size?.height || 150;
      // Use minimum dimension to match certificate output (QR codes are square)
      const qrSize = Math.min(width, height);

      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <Image
            src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}`}
            alt="QR Code"
            width={qrSize}
            height={qrSize}
            className="w-full h-full object-cover"
          />

          {isHovered && (
            <button
              className="absolute cursor-pointer top-2 right-2 p-1.5 bg-white shadow-md hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors z-10 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title="Delete"
            >
              <X className="w-4 h-4 text-red-600 hover:text-red-400" />
            </button>
          )}
        </div>
      );
    }

    // CODE and DATE ELEMENTS (read-only display)
    if (
      element.type === CertificateElementType.CODE ||
      element.type === CertificateElementType.DATE
    ) {
      return (
        <div
          className="w-full h-full flex items-center justify-center pointer-events-none select-none"
          style={{
            fontFamily: element.textStyle?.fontFamily || 'Montserrat',
            fontSize: `${element.textStyle?.fontSize || 14}px`,
            fontWeight: element.textStyle?.fontWeight || 'normal',
            fontStyle: element.textStyle?.fontStyle || 'normal',
            color: element.textStyle?.color || '#000000',
          }}
        >
          {element.value || getDefaultPlaceholder(element.type)}
        </div>
      );
    }

    return null;
  };

  const canEditContentWithDoubleClick = !element.locked && isContentEditable(element.type);

  return (
    <>
      <div
        ref={elementRef}
        id={`element-${element.id}`}
        className={`absolute transition-[box-shadow,transform,outline] duration-150 ${
          isEditing ? 'cursor-text' : 'cursor-move'
        } ${
          isSelected
            ? 'ring-2 ring-cyan-500 ring-offset-2 shadow-[0_0_0_4px_rgba(34,211,238,0.14)]'
            : 'hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]'
        }`}
        style={{
          left: element.position.x,
          top: element.position.y,
          width: element.size.width,
          height: element.size.height,
          zIndex: isSelected ? totalLayers + (element.zIndex || 1) : element.zIndex || 1,
          opacity: element.opacity !== undefined ? element.opacity : 1,
          transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        }}
        onMouseDown={(e) => {
          if (selectImageTextRef.current && selectImageTextRef.current.contains(e.target as Node)) {
            return;
          }

          if (moveHandleRef.current && moveHandleRef.current.contains(e.target as Node)) {
            return;
          }

          // Allow dragging even for locked elements (just not content editing)
          if (!isEditing) {
            onDragStart(e, element);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();

          if (selectImageTextRef.current && selectImageTextRef.current.contains(e.target as Node)) {
            return;
          }

          // Just select the element on click
          if (!isEditing) {
            onSelect(element.id);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (canEditContentWithDoubleClick) {
            onDoubleClick(element);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSelected && !isEditing && (
          <div className="absolute -bottom-7 left-0 z-20 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
            Selected
          </div>
        )}
        {isEditing && (
          <div className="absolute -bottom-7 left-0 z-20 rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
            Editing
          </div>
        )}
        {renderElementContent()}

        {/* Delete Icon */}
        {isHovered && isEditing && (
          <button
            className="absolute cursor-pointer top-2 right-2 p-1.5 bg-white shadow-md hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-colors z-10 rounded"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title="Delete"
          >
            <X className="w-4 h-4 text-red-600 hover:text-red-400" />
          </button>
        )}

        {/* Selection Handles - Show when selected and NOT editing content */}
        {isSelected && !isEditing && (
          <SelectionHandles
            element={element}
            onResizeStart={(e, handle) => onResizeStart(e, element, handle)}
          />
        )}
      </div>

      {/* Floating Toolbar - ALWAYS show when selected (even if locked), allows styling */}
      {isSelected && elementRect && canvasRef.current && (
        <FloatingToolbar
          element={element}
          elementRect={elementRect}
          canvasRect={canvasRef.current.getBoundingClientRect()}
          onUpdate={handleOptimizedUpdate}
          onDelete={onDelete}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          onCopy={onCopy}
          onUnlock={() => handleOptimizedUpdate({ locked: !element.locked })}
          totalLayers={totalLayers}
          isEditing={isEditing}
        />
      )}
    </>
  );
}

export const CanvasElement = memo(CanvasElementComponent);
