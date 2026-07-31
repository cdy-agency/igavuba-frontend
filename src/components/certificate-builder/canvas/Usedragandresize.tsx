import { useCallback, useEffect, useRef, useState } from 'react';
import { CertificateElementType, type CertificateElement } from '@/types/certificate';
import type { CanvasDimensions, ResizeHandle } from '@/types/certificate';
import { constrainToBounds } from '@/utils/certificate-template';

interface UseDragAndResizeProps {
  elements: CertificateElement[];
  canvasSize: CanvasDimensions;
  scale: number;
  onPreview: (elementId: string, updates: Partial<CertificateElement>) => void;
  onCommit: (elementId: string, updates: Partial<CertificateElement>) => void | Promise<void>;
  onGuidesChange?: (guides: { vertical: number[]; horizontal: number[] }) => void;
}

type InteractionState =
  | {
      type: 'drag';
      elementId: string;
      startX: number;
      startY: number;
      startElementX: number;
      startElementY: number;
    }
  | {
      type: 'resize';
      elementId: string;
      handle: ResizeHandle;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      startElementX: number;
      startElementY: number;
    };

function isSymmetricResizableElement(element: CertificateElement) {
  return (
    element.type === CertificateElementType.IMAGE || element.type === CertificateElementType.QR_CODE
  );
}

export function useDragAndResize({
  elements,
  canvasSize,
  scale,
  onPreview,
  onCommit,
  onGuidesChange,
}: UseDragAndResizeProps) {
  const interactionRef = useRef<InteractionState | null>(null);
  const latestBoundsRef = useRef<Map<string, Partial<CertificateElement>>>(new Map());
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const getElement = useCallback(
    (elementId: string) => elements.find((element) => element.id === elementId),
    [elements],
  );

  const clearGuides = useCallback(() => {
    onGuidesChange?.({ vertical: [], horizontal: [] });
  }, [onGuidesChange]);

  const snapRect = useCallback(
    (rect: { x: number; y: number; width: number; height: number; elementId: string }) => {
      const threshold = 8;
      if (!getElement(rect.elementId)) {
        return {
          ...rect,
          guides: { vertical: [], horizontal: [] },
        };
      }

      const verticalCandidates = new Set<number>([0, canvasSize.width / 2, canvasSize.width]);
      const horizontalCandidates = new Set<number>([0, canvasSize.height / 2, canvasSize.height]);

      elements.forEach((element) => {
        if (element.id === rect.elementId) return;
        verticalCandidates.add(element.position.x);
        verticalCandidates.add(element.position.x + element.size.width / 2);
        verticalCandidates.add(element.position.x + element.size.width);
        horizontalCandidates.add(element.position.y);
        horizontalCandidates.add(element.position.y + element.size.height / 2);
        horizontalCandidates.add(element.position.y + element.size.height);
      });

      const snapped = { ...rect };
      const guides = { vertical: [] as number[], horizontal: [] as number[] };

      const left = rect.x;
      const centerX = rect.x + rect.width / 2;
      const right = rect.x + rect.width;
      const top = rect.y;
      const centerY = rect.y + rect.height / 2;
      const bottom = rect.y + rect.height;

      let bestVertical:
        | { diff: number; value: number; anchor: 'left' | 'center' | 'right' }
        | undefined;
      let bestHorizontal:
        | { diff: number; value: number; anchor: 'top' | 'center' | 'bottom' }
        | undefined;

      verticalCandidates.forEach((candidate) => {
        const verticalAnchors = [
          { anchor: 'left' as const, current: left, next: candidate },
          { anchor: 'center' as const, current: centerX, next: candidate - rect.width / 2 },
          { anchor: 'right' as const, current: right, next: candidate - rect.width },
        ];

        verticalAnchors.forEach((option) => {
          const diff = Math.abs(option.current - candidate);
          if (diff > threshold) return;
          if (!bestVertical || diff < bestVertical.diff) {
            bestVertical = { diff, value: option.next, anchor: option.anchor };
          }
        });
      });

      horizontalCandidates.forEach((candidate) => {
        const horizontalAnchors = [
          { anchor: 'top' as const, current: top, next: candidate },
          { anchor: 'center' as const, current: centerY, next: candidate - rect.height / 2 },
          { anchor: 'bottom' as const, current: bottom, next: candidate - rect.height },
        ];

        horizontalAnchors.forEach((option) => {
          const diff = Math.abs(option.current - candidate);
          if (diff > threshold) return;
          if (!bestHorizontal || diff < bestHorizontal.diff) {
            bestHorizontal = { diff, value: option.next, anchor: option.anchor };
          }
        });
      });

      if (bestVertical) {
        snapped.x = bestVertical.value;
        guides.vertical.push(
          bestVertical.anchor === 'center'
            ? snapped.x + rect.width / 2
            : bestVertical.anchor === 'right'
              ? snapped.x + rect.width
              : snapped.x,
        );
      }

      if (bestHorizontal) {
        snapped.y = bestHorizontal.value;
        guides.horizontal.push(
          bestHorizontal.anchor === 'center'
            ? snapped.y + rect.height / 2
            : bestHorizontal.anchor === 'bottom'
              ? snapped.y + rect.height
              : snapped.y,
        );
      }

      return { ...snapped, guides };
    },
    [canvasSize.height, canvasSize.width, elements, getElement],
  );

  const handleDragStart = useCallback(
    (elementId: string, startX: number, startY: number, element: CertificateElement) => {
      interactionRef.current = {
        type: 'drag',
        elementId,
        startX,
        startY,
        startElementX: element.position.x,
        startElementY: element.position.y,
      };
      setIsDragging(true);
    },
    [],
  );

  const handleResizeStart = useCallback(
    (
      elementId: string,
      handle: ResizeHandle,
      startX: number,
      startY: number,
      element: CertificateElement,
    ) => {
      if (!handle) return;

      interactionRef.current = {
        type: 'resize',
        elementId,
        handle,
        startX,
        startY,
        startWidth: element.size.width,
        startHeight: element.size.height,
        startElementX: element.position.x,
        startElementY: element.position.y,
      };
      setIsResizing(true);
    },
    [],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      const element = getElement(interaction.elementId);
      if (!element) return;

      const deltaX = (event.clientX - interaction.startX) / scale;
      const deltaY = (event.clientY - interaction.startY) / scale;

      if (interaction.type === 'drag') {
        const snapped = snapRect({
          x: interaction.startElementX + deltaX,
          y: interaction.startElementY + deltaY,
          width: element.size.width,
          height: element.size.height,
          elementId: interaction.elementId,
        });

        const constrained = constrainToBounds(
          snapped.x,
          snapped.y,
          snapped.width,
          snapped.height,
          canvasSize.width,
          canvasSize.height,
        );

        const next = {
          position: { x: constrained.x, y: constrained.y },
        };

        latestBoundsRef.current.set(interaction.elementId, next);
        onGuidesChange?.(snapped.guides);
        onPreview(interaction.elementId, next);
        return;
      }

      let newWidth = interaction.startWidth;
      let newHeight = interaction.startHeight;
      let newX = interaction.startElementX;
      let newY = interaction.startElementY;
      const symmetric = isSymmetricResizableElement(element);
      const aspectRatio = interaction.startWidth / interaction.startHeight;

      if (symmetric) {
        const verticalHandle = interaction.handle === 'n' || interaction.handle === 's';
        const useHeight = verticalHandle;
        const scaleFromWidth =
          interaction.handle === 'w' || interaction.handle === 'nw' || interaction.handle === 'sw'
            ? (interaction.startWidth - deltaX) / interaction.startWidth
            : (interaction.startWidth + deltaX) / interaction.startWidth;
        const scaleFromHeight =
          interaction.handle === 'n' || interaction.handle === 'nw' || interaction.handle === 'ne'
            ? (interaction.startHeight - deltaY) / interaction.startHeight
            : (interaction.startHeight + deltaY) / interaction.startHeight;
        const rawScale = useHeight ? scaleFromHeight : scaleFromWidth;
        const nextScale = Number.isFinite(rawScale) ? Math.max(0.05, rawScale) : 1;

        newWidth = interaction.startWidth * nextScale;
        newHeight = newWidth / aspectRatio;

        const centerX = interaction.startElementX + interaction.startWidth / 2;
        const centerY = interaction.startElementY + interaction.startHeight / 2;

        newX = centerX - newWidth / 2;
        newY = centerY - newHeight / 2;
      } else {
        switch (interaction.handle) {
          case 'se':
            newWidth = interaction.startWidth + deltaX;
            newHeight = interaction.startHeight + deltaY;
            break;
          case 'sw':
            newWidth = interaction.startWidth - deltaX;
            newHeight = interaction.startHeight + deltaY;
            newX = interaction.startElementX + deltaX;
            break;
          case 'ne':
            newWidth = interaction.startWidth + deltaX;
            newHeight = interaction.startHeight - deltaY;
            newY = interaction.startElementY + deltaY;
            break;
          case 'nw':
            newWidth = interaction.startWidth - deltaX;
            newHeight = interaction.startHeight - deltaY;
            newX = interaction.startElementX + deltaX;
            newY = interaction.startElementY + deltaY;
            break;
          case 'n':
            newHeight = interaction.startHeight - deltaY;
            newY = interaction.startElementY + deltaY;
            break;
          case 's':
            newHeight = interaction.startHeight + deltaY;
            break;
          case 'e':
            newWidth = interaction.startWidth + deltaX;
            break;
          case 'w':
            newWidth = interaction.startWidth - deltaX;
            newX = interaction.startElementX + deltaX;
            break;
        }
      }

      const snapped = snapRect({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
        elementId: interaction.elementId,
      });

      const constrained = constrainToBounds(
        snapped.x,
        snapped.y,
        snapped.width,
        snapped.height,
        canvasSize.width,
        canvasSize.height,
      );

      const next = {
        size: { width: constrained.width, height: constrained.height },
        position: { x: constrained.x, y: constrained.y },
      };

      latestBoundsRef.current.set(interaction.elementId, next);
      onGuidesChange?.(snapped.guides);
      onPreview(interaction.elementId, next);
    };

    const handlePointerUp = () => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      const latest = latestBoundsRef.current.get(interaction.elementId);
      if (latest) {
        void onCommit(interaction.elementId, latest);
        latestBoundsRef.current.delete(interaction.elementId);
      }

      interactionRef.current = null;
      setIsDragging(false);
      setIsResizing(false);
      clearGuides();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    canvasSize.height,
    canvasSize.width,
    clearGuides,
    getElement,
    onCommit,
    onPreview,
    onGuidesChange,
    scale,
    snapRect,
  ]);

  return {
    handleDragStart,
    handleResizeStart,
    isDragging,
    isResizing,
  };
}
