import type { ApiErrorResponse, AuthUser, PendingVerificationState } from '@/types';
import { getAuthToken, removeAuthToken, setAuthToken } from './cookies';

const AUTH_STORAGE_KEY = 'auth_state';
const PENDING_VERIFICATION_KEY = 'pending_verification';

export interface StoredAuthState {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getStoredAuthState(): StoredAuthState | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthState;
  } catch {
    clearStoredAuthState();
    return null;
  }
}

export function persistAuthState(state: StoredAuthState) {
  if (!isBrowser()) {
    return;
  }

  setAuthToken(state.accessToken);
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
}

export function clearStoredAuthState() {
  if (!isBrowser()) {
    return;
  }

  removeAuthToken();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/** Buffer before expiry to refresh early and avoid 401s mid-request. */
export const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60;

interface AccessTokenPayload {
  exp?: number;
  sub?: string;
}

export function parseAccessTokenPayload(token: string): AccessTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = decodeBase64Url(parts[1]);
    if (!decoded) {
      return null;
    }

    return JSON.parse(decoded) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(
  token: string,
  bufferSeconds = ACCESS_TOKEN_REFRESH_BUFFER_SECONDS,
): boolean {
  const payload = parseAccessTokenPayload(token);
  if (!payload?.exp) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now + bufferSeconds;
}

export function getAccessToken() {
  const storedState = getStoredAuthState();
  const storedToken = storedState?.accessToken ?? null;
  const cookieToken = getAuthToken();

  if (storedToken && !isAccessTokenExpired(storedToken, 0)) {
    return storedToken;
  }

  if (cookieToken && !isAccessTokenExpired(cookieToken, 0)) {
    if (storedState) {
      persistAuthState({
        ...storedState,
        accessToken: cookieToken,
      });
    }
    return cookieToken;
  }

  return storedToken ?? cookieToken ?? null;
}

export function getRefreshToken() {
  return getStoredAuthState()?.refreshToken ?? null;
}

export function updateStoredTokens(accessToken: string, refreshToken?: string) {
  const currentState = getStoredAuthState();
  if (!currentState) {
    setAuthToken(accessToken);
    return;
  }

  persistAuthState({
    accessToken,
    refreshToken: refreshToken ?? currentState.refreshToken,
    user: currentState.user,
  });
}

export function storePendingVerification(state: PendingVerificationState) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(state));
}

export function getPendingVerification(): PendingVerificationState | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(PENDING_VERIFICATION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as PendingVerificationState;
  } catch {
    clearPendingVerification();
    return null;
  }
}

export function clearPendingVerification() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(PENDING_VERIFICATION_KEY);
}

export function getApiErrorMessage(error: unknown, fallback = 'Request failed') {
  const errorResponse = error as {
    response?: {
      data?: ApiErrorResponse;
    };
    message?: string;
  };

  const message = errorResponse.response?.data?.message;

  if (Array.isArray(message)) {
    return message[0] ?? fallback;
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  if (typeof errorResponse.message === 'string' && errorResponse.message.trim().length > 0) {
    return errorResponse.message;
  }

  return fallback;
}

export function decodeBase64Url(value: string): string | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return atob(padded);
  } catch {
    return null;
  }
}
