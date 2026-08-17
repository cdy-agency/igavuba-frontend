'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_TOASTS = 4;
const DEFAULT_DURATION = 4000;

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  onToastAdded?: (addToast: (toast: Omit<Toast, 'id'>) => void) => void;
}

export function ToastProvider({ children, onToastAdded }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id };
    setToasts((prev) => [newToast, ...prev].slice(0, MAX_TOASTS));
  }, []);

  useEffect(() => {
    if (onToastAdded) {
      onToastAdded(addToast);
    }
  }, [addToast, onToastAdded]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[min(calc(100vw-2rem),400px)] flex-col gap-3 sm:right-6 sm:top-6"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastVariants = {
  success: {
    icon: CheckCircle2,
    iconWrap: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/15',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconWrap: 'bg-red-50 text-red-600 ring-1 ring-red-500/15',
    progress: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/15',
    progress: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconWrap: 'bg-blue-50 text-blue-600 ring-1 ring-blue-500/15',
    progress: 'bg-blue-500',
  },
  loading: {
    icon: Loader2,
    iconWrap: 'bg-slate-50 text-slate-600 ring-1 ring-slate-500/10',
    progress: 'bg-slate-400',
  },
} as const;

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isLeaving, setIsLeaving] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const duration = toast.duration ?? DEFAULT_DURATION;
  const variant = toastVariants[toast.type] ?? toastVariants.info;
  const Icon = variant.icon;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMs = useRef(duration);
  const pausedAt = useRef<number | null>(null);

  const handleRemove = useCallback(() => {
    if (isLeaving) return;
    setIsLeaving(true);
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setTimeout(() => onRemove(toast.id), 220);
  }, [isLeaving, onRemove, toast.id]);

  const startDismissTimer = useCallback(
    (ms: number) => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
      if (toast.type === 'loading' || ms <= 0) return;
      dismissTimer.current = setTimeout(handleRemove, ms);
    },
    [handleRemove, toast.type],
  );

  useEffect(() => {
    remainingMs.current = duration;
    startDismissTimer(duration);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [duration, startDismissTimer]);

  const handlePause = () => {
    if (toast.type === 'loading' || duration <= 0 || pausedAt.current !== null) return;
    pausedAt.current = Date.now();
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    setIsPaused(true);
  };

  const handleResume = () => {
    if (toast.type === 'loading' || duration <= 0 || pausedAt.current === null) return;
    const pausedFor = Date.now() - pausedAt.current;
    remainingMs.current = Math.max(0, remainingMs.current - pausedFor);
    pausedAt.current = null;
    setIsPaused(false);
    startDismissTimer(remainingMs.current);
  };

  return (
    <div
      role="status"
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
      className={cn(
        'toast-enter pointer-events-auto relative overflow-hidden rounded-2xl border border-black/[0.06] bg-white',
        'shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18)]',
        isLeaving && 'toast-exit',
      )}
    >
      <div className="flex items-start gap-3 p-4 pr-3">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            variant.iconWrap,
          )}
        >
          <Icon className={cn('h-[18px] w-[18px]', toast.type === 'loading' && 'animate-spin')} />
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-[13px] font-semibold leading-snug tracking-tight text-slate-900">
            {toast.title}
          </p>
          {toast.description ? (
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{toast.description}</p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleRemove}
          className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {toast.type !== 'loading' && duration > 0 ? (
        <div className="h-[3px] w-full bg-slate-100">
          <div
            className={cn('toast-progress-shrink h-full rounded-full', variant.progress)}
            style={{
              animationDuration: `${duration}ms`,
              animationPlayState: isPaused ? 'paused' : 'running',
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
