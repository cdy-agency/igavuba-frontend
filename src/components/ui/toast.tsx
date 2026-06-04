'use client';

import * as React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      // Auto remove toast after duration
      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 4000);
      }
    },
    [removeToast],
  );

  // Set up global toast function via callback
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
    <div className="fixed top-4 right-4 z-50 space-y-2">
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

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          accent: 'bg-success/100',
          icon: 'text-success',
          iconComponent: <CheckCircle className="h-5 w-5" />,
        };
      case 'error':
        return {
          accent: 'bg-destructive/100',
          icon: 'text-destructive',
          iconComponent: <XCircle className="h-5 w-5" />,
        };
      case 'warning':
        return {
          accent: 'bg-accent/100',
          icon: 'text-accent',
          iconComponent: <AlertCircle className="h-5 w-5" />,
        };
      case 'info':
        return {
          accent: 'bg-primary-light',
          icon: 'text-primary',
          iconComponent: <Info className="h-5 w-5" />,
        };
      case 'loading':
        return {
          accent: 'bg-surface0',
          icon: 'text-muted-foreground',
          iconComponent: <Loader2 className="h-5 w-5 animate-spin" />,
        };
      default:
        return {
          accent: 'bg-surface0',
          icon: 'text-muted-foreground',
          iconComponent: <Info className="h-5 w-5" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={cn(
        'relative min-w-[320px] max-w-[420px] bg-background rounded-xl shadow-lg border border-border p-4 transition-all duration-300 ease-out',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {/* Colored accent on bottom right */}
      <div
        className={cn('absolute bottom-0 right-0 w-2 h-2 rounded-tl-lg opacity-20', styles.accent)}
      />

      <div className="flex items-start space-x-3">
        <div className={cn('flex-shrink-0', styles.icon)}>{styles.iconComponent}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{toast.title}</p>
          {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="flex-shrink-0 text-muted-foreground hover:text-muted-foreground transition-colors p-1 rounded-full hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Convenience functions
export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    // This will be called from the context
    return { type: 'success' as const, title, description, duration };
  },
  error: (title: string, description?: string, duration?: number) => {
    return { type: 'error' as const, title, description, duration };
  },
  warning: (title: string, description?: string, duration?: number) => {
    return { type: 'warning' as const, title, description, duration };
  },
  info: (title: string, description?: string, duration?: number) => {
    return { type: 'info' as const, title, description, duration };
  },
  loading: (title: string, description?: string) => {
    return { type: 'loading' as const, title, description, duration: 0 };
  },
};
