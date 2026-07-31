'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CertificateElement, MutationError, ResizeHandle } from '@/types/certificate';
import { CertificateElementType, DocumentOrientation } from '@/types/certificate';
import { useCertificateBuilder } from '@/components/certificate-builder/context/Certificatebuildercontext';
import { Ruler } from '@/components/certificate-builder/canvas/Ruler';
import { CanvasElement } from '@/components/certificate-builder/canvas/Canvaselement';
import { ZoomControls } from '@/components/certificate-builder/canvas/Zoomcontrols';
import { useDragAndResize } from '@/components/certificate-builder/canvas/Usedragandresize';
import { getDisplayDimensions } from '@/utils/certificate-template';
import { certificateElementApi } from '@/api/certificate-template-element.api';
import { apiClient } from '@/api/api-client';
import { toast } from '@/lib/toast';

const isEditableOnDoubleClick = (type: CertificateElementType | string) =>
  [CertificateElementType.TEXT].includes(type as CertificateElementType);

export default function CertificateBuilderPage() {
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUploadTargetRef = useRef<string | null>(null);

  const {
    selectedCertificate,
    selectedElementId,
    selectElement,
    updateElement,
    updateElementLocal,
    flushElementUpdates,
    deleteElement,
  } = useCertificateBuilder();

  const [scale, setScale] = useState(1);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [isGeneratingMock, setIsGeneratingMock] = useState(false);
  const [guides, setGuides] = useState<{ vertical: number[]; horizontal: number[] }>({
    vertical: [],
    horizontal: [],
  });

  const elements = useMemo(
    () => selectedCertificate?.layoutData?.elements || [],
    [selectedCertificate?.layoutData?.elements],
  );
  const selectedElement = elements.find((element) => element.id === selectedElementId);
  const size = selectedCertificate?.layoutData?.size || { width: 1600, height: 1050 };
  const background = selectedCertificate?.layoutData;
  const orientation = selectedCertificate?.orientation;
  const { width: displayWidth, height: displayHeight } = getDisplayDimensions(size, scale);

  const bringElementToFront = useCallback(
    (elementId: string) => {
      const target = elements.find((element) => element.id === elementId);
      if (!target) return;

      const maxOtherZIndex = Math.max(
        ...elements
          .filter((element) => element.id !== elementId)
          .map((element) => element.zIndex || 1),
        0,
      );

      if ((target.zIndex || 1) <= maxOtherZIndex) {
        void updateElement(elementId, { zIndex: maxOtherZIndex + 1 });
      }
    },
    [elements, updateElement],
  );

  const handleElementSelect = useCallback(
    (elementId: string) => {
      if (selectedElementId && selectedElementId !== elementId) {
        void flushElementUpdates(selectedElementId);
      }

      selectElement(elementId);
      bringElementToFront(elementId);

      if (editingElementId && editingElementId !== elementId) {
        void flushElementUpdates(editingElementId);
        setEditingElementId(null);
      }
    },
    [bringElementToFront, editingElementId, flushElementUpdates, selectElement, selectedElementId],
  );

  const handleElementDoubleClick = useCallback((element: CertificateElement) => {
    if (!element.locked && isEditableOnDoubleClick(element.type)) {
      setEditingElementId(element.id);
    }
  }, []);

  const handleEditingComplete = useCallback(
    async (finalText: string) => {
      if (editingElementId) {
        await updateElement(editingElementId, { value: finalText });
        await flushElementUpdates(editingElementId);
      }
      setEditingElementId(null);
    },
    [editingElementId, flushElementUpdates, updateElement],
  );

  const handleBringForward = useCallback(() => {
    if (!selectedElement) return;

    const maxZIndex = Math.max(...elements.map((element) => element.zIndex || 1));
    void updateElement(selectedElement.id, {
      zIndex: Math.min((selectedElement.zIndex || 1) + 1, maxZIndex + 1),
    });
  }, [elements, selectedElement, updateElement]);

  const handleSendBackward = useCallback(() => {
    if (!selectedElement) return;

    void updateElement(selectedElement.id, {
      zIndex: Math.max((selectedElement.zIndex || 1) - 1, 1),
    });
  }, [selectedElement, updateElement]);

  const handleCopyElement = useCallback(async () => {
    if (!selectedElement || !selectedCertificate) return;

    try {
      const { id: _id, ...elementWithoutId } = selectedElement;
      await certificateElementApi.addElement(selectedCertificate.id, {
        ...elementWithoutId,
        position: {
          x: selectedElement.position.x + 20,
          y: selectedElement.position.y + 20,
        },
        zIndex: elements.length + 1,
      });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Element duplicated');
    } catch {
      toast.error('Failed to duplicate element');
    }
  }, [elements.length, queryClient, selectedCertificate, selectedElement]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      const targetId = imageUploadTargetRef.current;

      if (!file || !selectedCertificate || !targetId) return;

      try {
        const updatedElement = await certificateElementApi.updateElementImage(
          selectedCertificate.id,
          targetId,
          file,
        );
        updateElementLocal(targetId, updatedElement);
        toast.success('Image uploaded successfully');
      } catch (error) {
        const mutationError = error as MutationError;
        toast.error(mutationError?.response?.data?.message ?? 'Failed to upload image');
      } finally {
        imageUploadTargetRef.current = null;
        e.target.value = '';
      }
    },
    [selectedCertificate, updateElementLocal],
  );

  const handleTriggerImageUpload = useCallback((elementId: string) => {
    imageUploadTargetRef.current = elementId;
    fileInputRef.current?.click();
  }, []);

  const handleCanvasClick = useCallback(
    async (e: React.MouseEvent) => {
      if (e.target !== canvasRef.current) return;

      if (selectedElementId) {
        await flushElementUpdates(selectedElementId);
      }

      selectElement(null);
      setEditingElementId(null);
    },
    [flushElementUpdates, selectElement, selectedElementId],
  );

  const handleNudgeSelectedElement = useCallback(
    (dx: number, dy: number) => {
      if (!selectedElement) return;

      const nextPosition = {
        x: Math.max(0, selectedElement.position.x + dx),
        y: Math.max(0, selectedElement.position.y + dy),
      };

      void updateElement(selectedElement.id, {
        position: nextPosition,
      });
    },
    [selectedElement, updateElement],
  );

  const handlePreviewUpdate = useCallback(
    (elementId: string, updates: Partial<CertificateElement>) => {
      updateElementLocal(elementId, updates);
    },
    [updateElementLocal],
  );

  const handlePersistUpdate = useCallback(
    async (elementId: string, updates: Partial<CertificateElement>) => {
      await updateElement(elementId, updates);
      await flushElementUpdates(elementId);
    },
    [flushElementUpdates, updateElement],
  );

  const { handleDragStart, handleResizeStart } = useDragAndResize({
    elements,
    canvasSize: size,
    scale,
    onPreview: handlePreviewUpdate,
    onCommit: handlePersistUpdate,
    onGuidesChange: setGuides,
  });

  useEffect(() => {
    return () => {
      void flushElementUpdates();
    };
  }, [flushElementUpdates]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null;
      const isTypingTarget =
        active &&
        (active.tagName === 'INPUT' ||
          active.tagName === 'TEXTAREA' ||
          active.tagName === 'SELECT' ||
          active.isContentEditable);

      if (editingElementId || isTypingTarget) {
        return;
      }

      if (!selectedElement) return;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        void deleteElement(selectedElement.id);
        return;
      }

      const step = event.shiftKey ? 10 : 1;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleNudgeSelectedElement(0, -step);
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleNudgeSelectedElement(0, step);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleNudgeSelectedElement(-step, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNudgeSelectedElement(step, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteElement, editingElementId, handleNudgeSelectedElement, selectedElement]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-300 bg-white px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedCertificate?.title || 'No certificate selected'}
          </span>
          <h1 className="text-sm font-medium text-gray-700">{selectedCertificate?.orientation}</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-60"
            disabled={!selectedCertificate || isGeneratingMock}
            onClick={async () => {
              if (!selectedCertificate) {
                toast.error('Select a template first');
                return;
              }

              try {
                setIsGeneratingMock(true);
                let res;

                try {
                  res = await apiClient.post(
                    `/certificates/dev/mock-generate/${selectedCertificate.id}`,
                    {},
                  );
                } catch {
                  res = await apiClient.get(
                    `/certificates/dev/mock-generate/${selectedCertificate.id}`,
                  );
                }

                const data = res.data?.data || res.data;
                const pdfBase64 = data?.pdfBase64;

                if (!pdfBase64) {
                  throw new Error('No PDF returned');
                }

                const byteCharacters = atob(pdfBase64);
                const byteNumbers = new Array(byteCharacters.length)
                  .fill(0)
                  .map((_, index) => byteCharacters.charCodeAt(index));
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = data?.fileName || 'mock-certificate.pdf';
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
                toast.success('Mock certificate generated');
              } catch (err) {
                const error = err as MutationError;
                toast.error(
                  error?.response?.data?.message || 'Failed to generate mock certificate',
                );
              } finally {
                setIsGeneratingMock(false);
              }
            }}
          >
            {isGeneratingMock ? 'Generating...' : 'Generate Mock Certificate'}
          </button>
          <ZoomControls scale={scale} onScaleChange={setScale} />
        </div>
      </div>

      <div className="relative flex-1 overflow-auto p-2">
        <Ruler size={size} scale={scale} orientation="horizontal" />
        <Ruler size={size} scale={scale} orientation="vertical" />

        <div className="flex min-h-full items-center justify-center pt-8">
          <div className="relative" style={{ width: displayWidth, height: displayHeight }}>
            <div
              ref={canvasRef}
              className="absolute inset-0 origin-top-left border border-gray-300 bg-white"
              style={{
                width: size.width,
                height: size.height,
                transform: `scale(${scale})`,
                backgroundImage:
                  background?.type === 'image' && background?.value
                    ? `url(${background.value})`
                    : undefined,
                backgroundColor: background?.type === 'color' ? background.value : '#FFFFFF',
                backgroundSize: orientation === DocumentOrientation.LANDSCAPE ? 'cover' : 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              onClick={handleCanvasClick}
            >
              {(guides.vertical.length > 0 || guides.horizontal.length > 0) && (
                <div className="pointer-events-none absolute inset-0 z-20">
                  {guides.vertical.map((x) => (
                    <div
                      key={`v-${x}`}
                      className="absolute top-0 h-full w-px bg-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                      style={{ left: x }}
                    />
                  ))}
                  {guides.horizontal.map((y) => (
                    <div
                      key={`h-${y}`}
                      className="absolute left-0 w-full h-px bg-cyan-400 shadow-[0_0_0_1px_rgba(34,211,238,0.35)]"
                      style={{ top: y }}
                    />
                  ))}
                </div>
              )}
              {[...elements]
                .sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1))
                .map((element) => (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedElementId}
                    isEditing={element.id === editingElementId}
                    onRectChange={() => {}}
                    onDragStart={(e, currentElement) => {
                      if (editingElementId === currentElement.id) return;
                      e.stopPropagation();
                      handleElementSelect(currentElement.id);
                      handleDragStart(currentElement.id, e.clientX, e.clientY, currentElement);
                    }}
                    onResizeStart={(e, currentElement, handle: ResizeHandle) => {
                      if (!handle) return;
                      e.stopPropagation();
                      handleElementSelect(currentElement.id);
                      handleResizeStart(
                        currentElement.id,
                        handle,
                        e.clientX,
                        e.clientY,
                        currentElement,
                      );
                    }}
                    onSelect={handleElementSelect}
                    onDoubleClick={handleElementDoubleClick}
                    onUpdate={(updates) => void updateElement(element.id, updates)}
                    onEditingComplete={(value) => void handleEditingComplete(value)}
                    onDelete={() => void deleteElement(element.id)}
                    onBringForward={handleBringForward}
                    onSendBackward={handleSendBackward}
                    onCopy={handleCopyElement}
                    onImageUpload={() => handleTriggerImageUpload(element.id)}
                    totalLayers={elements.length}
                    scale={scale}
                    canvasRef={canvasRef}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
