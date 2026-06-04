'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import {
  clearPendingVerification,
  clearStoredAuthState,
  getPendingVerification,
  getStoredAuthState,
  persistAuthState,
  storePendingVerification,
  updateStoredTokens,
} from '@/lib/auth';
import { GUEST_ROUTES } from '@/lib/routes';
import { toast } from '@/lib/toast';
import type { AuthUser, LoginResponse, PendingVerificationState, User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  pendingVerification: PendingVerificationState | null;
  showAuthModal: boolean;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  refreshSession: () => Promise<boolean>;
  setPendingVerification: (state: PendingVerificationState | null) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(user: AuthUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    role: user.role,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingVerification, setPendingVerificationState] =
    useState<PendingVerificationState | null>(null);

  const setSession = useCallback(
    (payload: { accessToken: string; refreshToken: string; user: AuthUser }) => {
      persistAuthState(payload);
      setUser(mapUser(payload.user));
      queryClient.setQueryData(['auth-user'], mapUser(payload.user));
    },
    [queryClient],
  );

  const setPendingVerification = useCallback((state: PendingVerificationState | null) => {
    setPendingVerificationState(state);

    if (state) {
      storePendingVerification(state);
      return;
    }

    clearPendingVerification();
  }, []);

  const refreshSession = useCallback(async () => {
    const storedState = getStoredAuthState();
    if (!storedState?.refreshToken) {
      clearStoredAuthState();
      setUser(null);
      return false;
    }

    try {
      const response = await authApi.refresh(storedState.refreshToken);
      const refreshedUser = response.user ?? storedState.user;
      persistAuthState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken ?? storedState.refreshToken,
        user: refreshedUser,
      });
      setUser(mapUser(refreshedUser));
      return true;
    } catch {
      clearStoredAuthState();
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const verificationState = getPendingVerification();
      if (verificationState) {
        setPendingVerificationState(verificationState);
      }

      const storedState = getStoredAuthState();
      if (!storedState) {
        setIsLoading(false);
        return;
      }

      setUser(mapUser(storedState.user));
      const refreshed = await refreshSession();
      if (!refreshed) {
        clearStoredAuthState();
      }

      setIsLoading(false);
    };

    void initializeAuth();
  }, [refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      setSession(response);
      setPendingVerification(null);
      toast.success(response.message, 'You are now signed in');
      return response;
    },
    [setPendingVerification, setSession],
  );

  const logout = useCallback(async () => {
    clearStoredAuthState();
    setUser(null);
    queryClient.clear();
    toast.success('Logged out successfully');
    router.replace(GUEST_ROUTES.LOGIN);
  }, [queryClient, router]);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => setShowAuthModal(false), []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      loading: isLoading,
      pendingVerification,
      showAuthModal,
      login,
      logout,
      setSession,
      refreshSession,
      setPendingVerification,
      openAuthModal,
      closeAuthModal,
    }),
    [
      closeAuthModal,
      isLoading,
      login,
      logout,
      openAuthModal,
      pendingVerification,
      refreshSession,
      setPendingVerification,
      setSession,
      showAuthModal,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
