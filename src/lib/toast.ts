import { useToast } from "@/components/ui/toast"

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
  };
};

// Global toast functions (for use outside of components)
let globalAddToast:
  | ((toast: {
      type: 'success' | 'error' | 'warning' | 'info' | 'loading';
      title: string;
      description?: string;
      duration?: number;
    }) => void)
  | null = null;

export const setGlobalToast = (
  addToast: (toast: {
    type: 'success' | 'error' | 'warning' | 'info' | 'loading';
    title: string;
    description?: string;
    duration?: number;
  }) => void,
) => {
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
};
