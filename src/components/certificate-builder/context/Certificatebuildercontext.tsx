'use client';

import { usePathname } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { certificateApi } from '@/api/certificate-template.api';
import { certificateElementApi } from '@/api/certificate-template-element.api';
import { toast } from '@/lib/toast';
import type {
  Certificate,
  CertificateBackground,
  CertificateBuilderContextValue,
  CertificateElement,
  CreateCertificateTemplateFormData,
  TextStyle,
} from '@/types/certificate';
import { CertificateElementType } from '@/types/certificate';
import {
  getDefaultPlaceholder,
  getDefaultSize,
  isLockedByDefault,
  isTextBasedElement,
  normalizeCertificate,
  normalizeCertificateElement,
} from '@/utils/certificate-template';

const ELEMENT_SYNC_DELAY = 500;

const CertificateBuilderContext = createContext<CertificateBuilderContextValue | undefined>(
  undefined,
);

function extractCertificates(data: unknown): Certificate[] {
  if (!data || typeof data !== 'object') {
    return [];
  }

  let templates: Certificate[] = [];

  if ('data' in data && data.data && typeof data.data === 'object' && 'templates' in data.data) {
    const rawTemplates = data.data.templates;
    templates = Array.isArray(rawTemplates) ? rawTemplates : [];
  } else if ('templates' in data) {
    const rawTemplates = (data as { templates?: Certificate[] }).templates;
    templates = Array.isArray(rawTemplates) ? rawTemplates : [];
  }

  return templates.map(normalizeCertificate);
}

function mergeTextStyle(
  current: CertificateElement['textStyle'],
  incoming: CertificateElement['textStyle'],
) {
  if (!incoming) {
    return current;
  }

  return {
    ...current,
    ...incoming,
  };
}

function mergePendingUpdates(
  existing: Partial<CertificateElement>,
  incoming: Partial<CertificateElement>,
): Partial<CertificateElement> {
  return {
    ...existing,
    ...incoming,
    position: incoming.position
      ? {
          ...(existing.position ?? { x: 0, y: 0 }),
          ...incoming.position,
        }
      : existing.position,
    size: incoming.size
      ? {
          ...(existing.size ?? { width: 280, height: 48 }),
          ...incoming.size,
        }
      : existing.size,
    textStyle: mergeTextStyle(existing.textStyle, incoming.textStyle),
  };
}

function mergeElementUpdates(
  element: CertificateElement,
  updates: Partial<CertificateElement>,
): CertificateElement {
  return normalizeCertificateElement({
    ...element,
    ...updates,
    position: updates.position
      ? { ...element.position, ...updates.position }
      : element.position,
    size: updates.size ? { ...element.size, ...updates.size } : element.size,
    textStyle: mergeTextStyle(element.textStyle, updates.textStyle),
  });
}

export function CertificateBuilderProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'elements' | 'backgrounds'>('elements');
  const [isAddingElement, setIsAddingElement] = useState(false);
  const [canvasScale, setCanvasScale] = useState(1);

  const certificatesRef = useRef<Certificate[]>([]);
  const selectedCertificateIdRef = useRef<string | null>(null);
  const pendingElementUpdatesRef = useRef<Map<string, Partial<CertificateElement>>>(new Map());
  const elementUpdateTimeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const inFlightElementUpdatesRef = useRef<Set<string>>(new Set());
  const templateSaveChainRef = useRef(Promise.resolve());

  const runTemplateSave = useCallback((task: () => Promise<void>) => {
    const next = templateSaveChainRef.current.then(task);
    templateSaveChainRef.current = next.catch(() => undefined);
    return next;
  }, []);

  const hasUnsyncedChanges = useCallback(() => {
    return (
      pendingElementUpdatesRef.current.size > 0 ||
      inFlightElementUpdatesRef.current.size > 0
    );
  }, []);

  const { data: certificatesData } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => certificateApi.getCertificates(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    certificatesRef.current = certificates;
  }, [certificates]);

  useEffect(() => {
    selectedCertificateIdRef.current = selectedCertificateId;
  }, [selectedCertificateId]);

  const updateCertificateInState = useCallback(
    (certificateId: string, updater: (certificate: Certificate) => Certificate) => {
      setCertificates((current) =>
        current.map((certificate) =>
          certificate.id === certificateId ? updater(certificate) : certificate,
        ),
      );
    },
    [],
  );

  const replaceCertificateInState = useCallback((certificate: Certificate) => {
    const normalized = normalizeCertificate(certificate);
    setCertificates((current) => {
      const index = current.findIndex((item) => item.id === normalized.id);

      if (index === -1) {
        return [normalized, ...current];
      }

      const next = [...current];
      next[index] = normalized;
      return next;
    });
  }, []);

  const updateElementLocal = useCallback(
    (id: string, updates: Partial<CertificateElement>) => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      updateCertificateInState(certificateId, (certificate) => ({
        ...certificate,
        elements:
          certificate.elements?.map((element) =>
            element.id === id ? mergeElementUpdates(element, updates) : element,
          ) ?? certificate.elements,
        layoutData: {
          ...certificate.layoutData,
          elements: certificate.layoutData.elements.map((element) =>
            element.id === id ? mergeElementUpdates(element, updates) : element,
          ),
        },
      }));
    },
    [updateCertificateInState],
  );

  const clearElementTimer = useCallback((id: string) => {
    const timer = elementUpdateTimeoutsRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      elementUpdateTimeoutsRef.current.delete(id);
    }
  }, []);

  const flushElementUpdates = useCallback(
    async (id?: string) => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      const flushOne = async (elementId: string) => {
        clearElementTimer(elementId);

        if (inFlightElementUpdatesRef.current.has(elementId)) {
          return;
        }

        const pending = pendingElementUpdatesRef.current.get(elementId);
        if (!pending || Object.keys(pending).length === 0) {
          pendingElementUpdatesRef.current.delete(elementId);
          return;
        }

        pendingElementUpdatesRef.current.delete(elementId);
        inFlightElementUpdatesRef.current.add(elementId);

        try {
          await runTemplateSave(async () => {
            await certificateElementApi.updateElement(certificateId, elementId, pending);
          });
        } catch {
          pendingElementUpdatesRef.current.set(elementId, {
            ...pending,
            ...pendingElementUpdatesRef.current.get(elementId),
          });

          toast.error('Failed to sync element changes');
        } finally {
          inFlightElementUpdatesRef.current.delete(elementId);

          if (pendingElementUpdatesRef.current.has(elementId)) {
            void flushOne(elementId);
          }
        }
      };

      if (id) {
        await flushOne(id);
        return;
      }

      const pendingIds = Array.from(pendingElementUpdatesRef.current.keys());
      await Promise.all(pendingIds.map((elementId) => flushOne(elementId)));
    },
    [clearElementTimer, runTemplateSave],
  );

  const queueElementUpdate = useCallback(
    (id: string, updates: Partial<CertificateElement>) => {
      const existing = pendingElementUpdatesRef.current.get(id) || {};
      pendingElementUpdatesRef.current.set(id, mergePendingUpdates(existing, updates));

      clearElementTimer(id);
      elementUpdateTimeoutsRef.current.set(
        id,
        setTimeout(() => {
          void flushElementUpdates(id);
        }, ELEMENT_SYNC_DELAY),
      );
    },
    [clearElementTimer, flushElementUpdates],
  );

  useEffect(() => {
    const fetchedCertificates = extractCertificates(certificatesData);
    if (!fetchedCertificates.length && certificates.length) {
      return;
    }

    if (!fetchedCertificates.length) {
      return;
    }

    if (hasUnsyncedChanges()) {
      return;
    }

    setCertificates(fetchedCertificates);

    if (!selectedCertificateIdRef.current) {
      setSelectedCertificateId(fetchedCertificates[0]?.id ?? null);
    }
  }, [certificatesData, certificates.length, hasUnsyncedChanges]);

  useEffect(() => {
    return () => {
      void flushElementUpdates();
    };
  }, [pathname, flushElementUpdates]);

  const selectedCertificate = useMemo(
    () => certificates.find((certificate) => certificate.id === selectedCertificateId) || null,
    [certificates, selectedCertificateId],
  );

  const elements = useMemo(
    () => selectedCertificate?.layoutData?.elements || [],
    [selectedCertificate],
  );

  const selectCertificate = useCallback(
    async (id: string | null) => {
      await flushElementUpdates();
      setSelectedCertificateId(id);
      setSelectedElementId(null);
    },
    [flushElementUpdates],
  );

  const addCertificate = useCallback(
    async (data: CreateCertificateTemplateFormData): Promise<void> => {
      const newCertificate = await certificateApi.createCertificate(data);
      replaceCertificateInState(newCertificate);
      setSelectedCertificateId(newCertificate.id);
    },
    [replaceCertificateInState],
  );

  const updateCertificate = useCallback(
    async (id: string, updates: Partial<Certificate>): Promise<void> => {
      const updatedCertificate = (await certificateApi.updateCertificate(
        id,
        updates,
      )) as Certificate;
      replaceCertificateInState(updatedCertificate);
    },
    [replaceCertificateInState],
  );

  const deleteCertificate = useCallback(async (id: string): Promise<void> => {
    await certificateApi.deleteCertificate(id);
    setCertificates((current) => current.filter((certificate) => certificate.id !== id));

    if (selectedCertificateIdRef.current === id) {
      const remaining = certificatesRef.current.filter((certificate) => certificate.id !== id);
      setSelectedCertificateId(remaining[0]?.id ?? null);
    }
  }, []);

  const addElement = useCallback(
    async (
      type: CertificateElementType,
      options?: {
        value?: string;
        locked?: boolean;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        textStyle?: TextStyle;
      },
    ): Promise<void> => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      setIsAddingElement(true);

      try {
        const locked = options?.locked ?? isLockedByDefault(type);
        const defaultValue = options?.value ?? getDefaultPlaceholder(type);
        const defaultSize = options?.size ?? getDefaultSize(type);
        const defaultTextStyle =
          options?.textStyle ??
          (isTextBasedElement(type)
            ? {
                fontFamily: 'Montserrat',
                fontSize:
                  type === CertificateElementType.STUDENT_NAME
                    ? 24
                    : type === CertificateElementType.COURSE_NAME
                      ? 20
                      : 14,
                fontWeight:
                  type === CertificateElementType.STUDENT_NAME ||
                  type === CertificateElementType.COURSE_NAME
                    ? 'bold'
                    : 'normal',
                color: '#000000',
                textAlign: 'center',
              }
            : undefined);

        const newElement = (await certificateElementApi.addElement(certificateId, {
          type,
          position: options?.position ?? { x: 400, y: 300 },
          size: defaultSize,
          zIndex: elements.length + 1,
          locked,
          value: defaultValue,
          textStyle: defaultTextStyle,
        })) as CertificateElement;

        updateCertificateInState(certificateId, (certificate) => ({
          ...certificate,
          elements: [...(certificate.elements ?? certificate.layoutData.elements), newElement],
          layoutData: {
            ...certificate.layoutData,
            elements: [...certificate.layoutData.elements, newElement],
          },
        }));
        setSelectedElementId(newElement.id);
      } finally {
        setIsAddingElement(false);
      }
    },
    [elements.length, updateCertificateInState],
  );

  const updateElement = useCallback(
    async (id: string, updates: Partial<CertificateElement>): Promise<void> => {
      updateElementLocal(id, updates);
      queueElementUpdate(id, updates);
    },
    [queueElementUpdate, updateElementLocal],
  );

  const deleteElement = useCallback(
    async (id: string): Promise<void> => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      clearElementTimer(id);
      pendingElementUpdatesRef.current.delete(id);

      await certificateElementApi.deleteElement(certificateId, id);

      updateCertificateInState(certificateId, (certificate) => ({
        ...certificate,
        elements:
          certificate.elements?.filter((element) => element.id !== id) ?? certificate.elements,
        layoutData: {
          ...certificate.layoutData,
          elements: certificate.layoutData.elements.filter((element) => element.id !== id),
        },
      }));

      if (selectedElementId === id) {
        setSelectedElementId(null);
      }
    },
    [clearElementTimer, selectedElementId, updateCertificateInState],
  );

  const selectElement = useCallback((id: string | null) => {
    setSelectedElementId(id);
  }, []);

  const reorderElements = useCallback(
    async (elementIds: string[]): Promise<void> => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      await certificateElementApi.reorderElements(certificateId, elementIds);
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
    [queryClient],
  );

  const updateBackground = useCallback(
    async (background: CertificateBackground): Promise<void> => {
      const certificateId = selectedCertificateIdRef.current;
      if (!certificateId) return;

      const updatedCertificate = (await certificateApi.updateBackground(
        certificateId,
        background,
      )) as Certificate;
      replaceCertificateInState(updatedCertificate);
    },
    [replaceCertificateInState],
  );

  const value: CertificateBuilderContextValue = {
    certificates,
    selectedCertificateId,
    selectedCertificate,
    selectedElementId,
    elements,
    activeTab,
    isAddingElement,
    canvasScale,
    selectCertificate,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    addElement,
    updateElement,
    updateElementLocal,
    flushElementUpdates,
    deleteElement,
    selectElement,
    reorderElements,
    setActiveTab,
    updateBackground,
    setCanvasScale,
  };

  return (
    <CertificateBuilderContext.Provider value={value}>
      {children}
    </CertificateBuilderContext.Provider>
  );
}

export function useCertificateBuilder() {
  const context = useContext(CertificateBuilderContext);
  if (context === undefined) {
    throw new Error('useCertificateBuilder must be used within a CertificateBuilderProvider');
  }
  return context;
}
