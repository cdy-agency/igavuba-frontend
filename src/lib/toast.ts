import { useToast } from "@/components/ui/toast"

type ToastAction = { label: string; onClick: () => void };

interface ToastInput {
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  duration?: number;
  action?: ToastAction;
  onExpire?: () => void;
}

interface UndoableToastParams {
  title: string;
  description?: string;
  duration?: number;
  undoLabel?: string;
  /** Called if the user does NOT undo (timeout elapses or toast is dismissed). Commit the action here. */
  onExpire: () => void;
  /** Called when the user clicks undo. Reverse the optimistic change here. */
  onUndo: () => void;
}

const DEFAULT_UNDO_DURATION = 6000;

// Hook-based toast functions
export const useToastFunctions = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string, duration?: number) => {
      addToast({ type: 'success', title, description, duration });
    },
    error: (title: string, description?: string, duration?: number) => {
      addToast({ type: 'error', title, description, duration });
    },
    warning: (title: string, description?: string, duration?: number) => {
      addToast({ type: 'warning', title, description, duration });
    },
    info: (title: string, description?: string, duration?: number) => {
      addToast({ type: 'info', title, description, duration });
    },
    loading: (title: string, description?: string) => {
      addToast({ type: 'loading', title, description, duration: 0 });
    },
    undoable: (params: UndoableToastParams) => {
      addToast({
        type: 'warning',
        title: params.title,
        description: params.description,
        duration: params.duration ?? DEFAULT_UNDO_DURATION,
        action: { label: params.undoLabel ?? 'Undo', onClick: params.onUndo },
        onExpire: params.onExpire,
      });
    },
  };
};

// Global toast functions (for use outside of components)
let globalAddToast: ((toast: ToastInput) => void) | null = null;

export const setGlobalToast = (addToast: (toast: ToastInput) => void) => {
  globalAddToast = addToast;
};

export const toast = {
  success: (title: string, description?: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ type: 'success', title, description, duration });
    }
  },
  error: (title: string, description?: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ type: 'error', title, description, duration });
    }
  },
  warning: (title: string, description?: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ type: 'warning', title, description, duration });
    }
  },
  info: (title: string, description?: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ type: 'info', title, description, duration });
    }
  },
  loading: (title: string, description?: string) => {
    if (globalAddToast) {
      globalAddToast({ type: 'loading', title, description, duration: 0 });
    }
  },
  /** Shows a reversible action toast, e.g. "Module deleted — Undo". */
  undoable: (params: UndoableToastParams) => {
    if (globalAddToast) {
      globalAddToast({
        type: 'warning',
        title: params.title,
        description: params.description,
        duration: params.duration ?? DEFAULT_UNDO_DURATION,
        action: { label: params.undoLabel ?? 'Undo', onClick: params.onUndo },
        onExpire: params.onExpire,
      });
    }
  },
};
