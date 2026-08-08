'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'pending' | 'offline' | 'saved';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function parseLocalDraft<T>(rawValue: string | null, fallback: T): T {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function stableSerialize(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

export function useLocalDraft<T>(storageKey: string, initialState: T) {
  const [draft, setDraft] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!isBrowser() || hydrated) {
      setHydrated(true);
      return;
    }

    const rawValue = window.localStorage.getItem(storageKey);
    if (rawValue) {
      setDraft(parseLocalDraft(rawValue, initialState));
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || !isBrowser()) return;

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch {
      // Silent failure; local draft is best-effort.
    }
  }, [draft, hydrated, storageKey]);

  const clearDraft = () => {
    if (isBrowser()) {
      try {
        window.localStorage.removeItem(storageKey);
      } catch {
        // ignore
      }
    }

    setDraft(initialState);
  };

  return { draft, setDraft, clearDraft, hydrated };
}

export function useAutoSave<T>(config: {
  storageKey: string;
  value: T;
  onChange: (value: T) => void;
  saveFn: (value: T) => Promise<void>;
  debounceMs?: number;
  restoreOnMount?: boolean;
  enabled?: boolean;
  onStatusChange?: (status: SaveStatus, message?: string | null) => void;
}) {
  const {
    storageKey,
    value,
    onChange,
    saveFn,
    debounceMs = 600,
    restoreOnMount = false,
    enabled = true,
    onStatusChange,
  } = config;

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [hasPendingSave, setHasPendingSave] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(() => {
    return isBrowser() ? !window.navigator.onLine : false;
  });

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedSerializedRef = useRef<string>(stableSerialize(value));
  const latestValueRef = useRef<T>(value);
  const latestSerializedRef = useRef<string>(stableSerialize(value));
  const hasRestoredRef = useRef(false);
  const unmountedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const saveFnRef = useRef(saveFn);
  const onStatusChangeRef = useRef(onStatusChange);
  const statusRef = useRef<SaveStatus>(status);

  onChangeRef.current = onChange;
  saveFnRef.current = saveFn;
  onStatusChangeRef.current = onStatusChange;
  statusRef.current = status;

  const valueSerialized = stableSerialize(value);
  latestValueRef.current = value;
  latestSerializedRef.current = valueSerialized;

  const reportStatus = useCallback((nextStatus: SaveStatus, message: string | null = null) => {
    setStatus((current) => (current === nextStatus ? current : nextStatus));
    // Always notify only when status actually changes — prevents context update storms.
    if (statusRef.current === nextStatus) {
      return;
    }
    statusRef.current = nextStatus;
    onStatusChangeRef.current?.(nextStatus, message);
  }, []);

  const persistLocalDraft = useCallback(
    (nextValue: T) => {
      if (!isBrowser()) return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextValue));
      } catch {
        // ignore
      }
    },
    [storageKey],
  );

  const removeLocalDraft = useCallback(() => {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  const performSave = useCallback(
    async (valueToSave: T) => {
      setError(null);
      setIsSaving(true);
      reportStatus('saving', null);

      try {
        await saveFnRef.current(valueToSave);
        if (unmountedRef.current) return;

        lastSavedSerializedRef.current = stableSerialize(valueToSave);
        setHasPendingSave(false);
        setLastSavedAt(new Date().toISOString());
        removeLocalDraft();
        reportStatus('saved', 'Saved');
      } catch (saveError) {
        if (unmountedRef.current) return;

        const offline = isBrowser() ? !window.navigator.onLine : false;
        setIsOffline(offline);
        setHasPendingSave(true);
        setError(saveError instanceof Error ? saveError.message : String(saveError));
        reportStatus(offline ? 'offline' : 'pending', offline ? 'Offline draft' : 'Save pending');
        persistLocalDraft(valueToSave);
      } finally {
        if (!unmountedRef.current) {
          setIsSaving(false);
        }
      }
    },
    [persistLocalDraft, removeLocalDraft, reportStatus],
  );

  const flushPendingSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (isOffline) {
      reportStatus('offline', 'Offline draft');
      return;
    }

    if (latestSerializedRef.current === lastSavedSerializedRef.current) {
      setHasPendingSave(false);
      return;
    }

    await performSave(latestValueRef.current);
  }, [isOffline, performSave, reportStatus]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;

    const handleOnline = () => {
      setIsOffline(false);
      if (latestSerializedRef.current !== lastSavedSerializedRef.current) {
        reportStatus('pending', 'Pending changes');
        void flushPendingSave();
      } else {
        reportStatus('saved', 'Saved');
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      reportStatus('offline', 'Offline draft');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [flushPendingSave, reportStatus]);

  useEffect(() => {
    if (!isBrowser()) return;
    if (!restoreOnMount || hasRestoredRef.current) return;

    hasRestoredRef.current = true;
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      lastSavedSerializedRef.current = latestSerializedRef.current;
      return;
    }

    const restored = parseLocalDraft<T>(rawValue, latestValueRef.current);
    const restoredSerialized = stableSerialize(restored);
    if (restoredSerialized !== latestSerializedRef.current) {
      onChangeRef.current(restored);
      setHasPendingSave(true);
      reportStatus(isOffline ? 'offline' : 'pending', isOffline ? 'Offline draft' : 'Pending changes');
    } else {
      lastSavedSerializedRef.current = restoredSerialized;
    }
  }, [storageKey, restoreOnMount, isOffline, reportStatus]);

  // When autosave is first enabled, treat the current value as already saved.
  const wasEnabledRef = useRef(enabled);
  useEffect(() => {
    if (enabled && !wasEnabledRef.current) {
      lastSavedSerializedRef.current = latestSerializedRef.current;
      setHasPendingSave(false);
    }
    wasEnabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (restoreOnMount && !hasRestoredRef.current) return;

    if (valueSerialized === lastSavedSerializedRef.current) {
      return;
    }

    persistLocalDraft(value);
    setHasPendingSave(true);
    reportStatus(isOffline ? 'offline' : 'pending', isOffline ? 'Offline draft' : 'Pending changes');

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    if (isOffline) {
      return;
    }

    saveTimerRef.current = setTimeout(() => {
      saveTimerRef.current = null;
      void performSave(latestValueRef.current);
    }, debounceMs);
  }, [
    enabled,
    valueSerialized,
    value,
    isOffline,
    debounceMs,
    storageKey,
    restoreOnMount,
    persistLocalDraft,
    performSave,
    reportStatus,
  ]);

  return useMemo(
    () => ({
      status,
      isSaving,
      hasPendingSave,
      lastSavedAt,
      error,
      isOffline,
      flush: flushPendingSave,
      clearDraft: removeLocalDraft,
      /** Mark current value as clean (e.g. after hydrating from server). */
      markSaved: (nextValue?: T) => {
        const serialized = stableSerialize(nextValue ?? latestValueRef.current);
        lastSavedSerializedRef.current = serialized;
        setHasPendingSave(false);
      },
    }),
    [
      status,
      isSaving,
      hasPendingSave,
      lastSavedAt,
      error,
      isOffline,
      flushPendingSave,
      removeLocalDraft,
    ],
  );
}
