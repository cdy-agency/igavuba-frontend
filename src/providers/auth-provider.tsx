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
import { currentUserQueryKey } from '@/hooks/use-current-user';
import {
  clearPendingVerification,
  clearStoredAuthState,
  getAccessToken,
  getPendingVerification,
  getRefreshToken,
  getStoredAuthState,
  isAccessTokenExpired,
  persistAuthState,
  storePendingVerification,
} from '@/lib/auth';
import { refreshSessionTokens } from '@/lib/session-token';
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
  fetchCurrentUser: () => Promise<AuthUser | null>;
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
    institutionId: user.institutionId,
    profileImage: user.profileImage,
    emailVerified: user.emailVerified,
    institution: user.institution ?? null,
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

  const applyUserProfile = useCallback(
    (profile: AuthUser) => {
      const mapped = mapUser(profile);
      setUser(mapped);
      queryClient.setQueryData(currentUserQueryKey, {
        success: true,
        message: 'Current user retrieved successfully',
        user: profile,
      });

      const storedState = getStoredAuthState();
      if (storedState) {
        persistAuthState({
          ...storedState,
          user: profile,
        });
      }

      return mapped;
    },
    [queryClient],
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      applyUserProfile(response.user);
      return response.user;
    } catch {
      return null;
    }
  }, [applyUserProfile]);

  const setSession = useCallback(
    (payload: { accessToken: string; refreshToken: string; user: AuthUser }) => {
      persistAuthState(payload);
      applyUserProfile(payload.user);
    },
    [applyUserProfile],
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
    if (!storedState || !getRefreshToken()) {
      clearStoredAuthState();
      setUser(null);
      return false;
    }

    try {
      const currentToken = getAccessToken();
      if (currentToken && !isAccessTokenExpired(currentToken)) {
        const profile = (await fetchCurrentUser()) ?? storedState.user;
        applyUserProfile(profile);
        return true;
      }

      await refreshSessionTokens();
      const profile = (await fetchCurrentUser()) ?? storedState.user;
      applyUserProfile(profile);
      return true;
    } catch {
      clearStoredAuthState();
      setUser(null);
      return false;
    }
  }, [applyUserProfile, fetchCurrentUser]);

  useEffect(() => {
    let cancelled = false;

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

      try {
        const refreshed = await Promise.race([
          refreshSession(),
          new Promise<boolean>((resolve) => {
            window.setTimeout(() => resolve(false), 10_000);
          }),
        ]);

        if (cancelled) {
          return;
        }

        if (!refreshed) {
          clearStoredAuthState();
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const token = getAccessToken();
      if (!token || isAccessTokenExpired(token)) {
        void refreshSession();
      }
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [user, refreshSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authApi.login({ email, password });
      persistAuthState({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      });

      const profile = (await fetchCurrentUser()) ?? response.user;
      applyUserProfile(profile);
      setPendingVerification(null);
      toast.success(response.message, 'You are now signed in');
      return response;
    },
    [applyUserProfile, fetchCurrentUser, setPendingVerification],
  );

  const logout = useCallback(async () => {
    clearStoredAuthState();
    setUser(null);
    queryClient.removeQueries({ queryKey: currentUserQueryKey });
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
      fetchCurrentUser,
      setPendingVerification,
      openAuthModal,
      closeAuthModal,
    }),
    [
      closeAuthModal,
      fetchCurrentUser,
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
