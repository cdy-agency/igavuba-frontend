'use client';

import { useEffect, useRef, useState } from 'react';

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
  onStatusChange?: (status: SaveStatus, message?: string | null) => void;
}) {
  const {
    storageKey,
    value,
    onChange,
    saveFn,
    debounceMs = 600,
    restoreOnMount = false,
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
  const lastSavedValueRef = useRef<T>(value);
  const latestValueRef = useRef<T>(value);
  const hasRestoredRef = useRef(false);
  const unmountedRef = useRef(false);

  const reportStatus = (nextStatus: SaveStatus, message: string | null = null) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus, message);
  };

  const persistLocalDraft = (nextValue: T) => {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextValue));
    } catch {
      // ignore
    }
  };

  const removeLocalDraft = () => {
    if (!isBrowser()) return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  };

  const performSave = async (valueToSave: T) => {
    setError(null);
    setIsSaving(true);
    reportStatus('saving', null);

    try {
      await saveFn(valueToSave);
      if (unmountedRef.current) return;

      lastSavedValueRef.current = valueToSave;
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
  };

  const flushPendingSave = async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }

    if (isOffline) {
      reportStatus('offline', 'Offline draft');
      return;
    }

    if (!hasPendingSave) {
      return;
    }

    await performSave(latestValueRef.current);
  };

  useEffect(() => {
    latestValueRef.current = value;
  }, [value]);

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
      reportStatus(hasPendingSave ? 'pending' : 'saved', hasPendingSave ? 'Pending changes' : 'Saved');
      if (hasPendingSave) {
        void flushPendingSave();
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
  }, [hasPendingSave]);

  useEffect(() => {
    if (!isBrowser()) return;

    if (restoreOnMount && !hasRestoredRef.current) {
      hasRestoredRef.current = true;
      const rawValue = window.localStorage.getItem(storageKey);
      if (!rawValue) {
        return;
      }

      const restored = parseLocalDraft<T>(rawValue, value);
      if (JSON.stringify(restored) !== JSON.stringify(value)) {
        onChange(restored);
        setHasPendingSave(true);
        reportStatus(isOffline ? 'offline' : 'pending', isOffline ? 'Offline draft' : 'Pending changes');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey, restoreOnMount]);

  useEffect(() => {
    if (!hasRestoredRef.current && restoreOnMount) return;

    if (JSON.stringify(value) === JSON.stringify(lastSavedValueRef.current)) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isOffline, debounceMs, storageKey]);

  return {
    status,
    isSaving,
    hasPendingSave,
    lastSavedAt,
    error,
    isOffline,
    flush: flushPendingSave,
    clearDraft: removeLocalDraft,
  };
}
