import axios from 'axios';
import {
  clearStoredAuthState,
  getAccessToken,
  getRefreshToken,
  isAccessTokenExpired,
  updateStoredTokens,
} from '@/lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

type RefreshSubscriber = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshSubscribers: RefreshSubscriber[] = [];

function subscribeTokenRefresh(resolve: (token: string) => void, reject: (error: unknown) => void) {
  refreshSubscribers.push({ resolve, reject });
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((subscriber) => subscriber.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach((subscriber) => subscriber.reject(error));
  refreshSubscribers = [];
}

async function requestTokenRefresh(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const newAccessToken = response.data?.accessToken as string | undefined;
  const newRefreshToken = response.data?.refreshToken as string | undefined;

  if (!newAccessToken) {
    throw new Error('No access token in refresh response');
  }

  updateStoredTokens(newAccessToken, newRefreshToken);
  return newAccessToken;
}

export function isSessionRefreshInProgress() {
  return isRefreshing;
}

/** Single-flight refresh — prevents parallel /auth/refresh calls that revoke all tokens. */
export async function refreshSessionTokens(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      subscribeTokenRefresh(resolve, reject);
    });
  }

  isRefreshing = true;

  try {
    const newToken = await requestTokenRefresh();
    onTokenRefreshed(newToken);
    return newToken;
  } catch (error) {
    onRefreshFailed(error);
    throw error;
  } finally {
    isRefreshing = false;
  }
}

export async function ensureValidAccessToken(): Promise<string | null> {
  const currentToken = getAccessToken();
  if (!currentToken) {
    return null;
  }

  if (!isAccessTokenExpired(currentToken)) {
    return currentToken;
  }

  try {
    return await refreshSessionTokens();
  } catch {
    clearStoredAuthState();
    return null;
  }
}
