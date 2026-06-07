import axios, { InternalAxiosRequestConfig } from 'axios';
import {
  clearStoredAuthState,
  getAccessToken,
  getRefreshToken,
} from '@/lib/auth';
import { decryptResponse, encryptAESKeyOnly, encryptPayload } from '@/lib/crypto';
import { ensureValidAccessToken, refreshSessionTokens } from '@/lib/session-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const encryptionEnabled = !!process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;

type ExtendedAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const aesKeyMap = new WeakMap<InternalAxiosRequestConfig, CryptoKey>();

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string | null) {
  if (!token) {
    if (typeof config.headers?.delete === 'function') {
      config.headers.delete('Authorization');
    } else if (config.headers) {
      delete config.headers.Authorization;
    }
    return;
  }

  const value = `Bearer ${token}`;
  if (typeof config.headers?.set === 'function') {
    config.headers.set('Authorization', value);
  } else if (config.headers) {
    config.headers.Authorization = value;
  }
}

function shouldSkipAuthRefresh(config: ExtendedAxiosRequestConfig) {
  if (config.skipAuthRefresh) {
    return true;
  }

  const url = config.url ?? '';
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/signup') ||
    url.includes('/auth/verify-email') ||
    url.includes('/auth/resend-verification') ||
    url.includes('/auth/forgot-password') ||
    url.includes('/auth/verify-reset-otp') ||
    url.includes('/auth/reset-password') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/invitation')
  );
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const extendedConfig = config as ExtendedAxiosRequestConfig;

    if (!shouldSkipAuthRefresh(extendedConfig)) {
      const token = await ensureValidAccessToken();
      if (!token) {
        return Promise.reject(new Error('Not authenticated'));
      }
      setAuthorizationHeader(config, token);
    } else {
      setAuthorizationHeader(config, getAccessToken());
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (!encryptionEnabled) {
      return config;
    }

    const isMultipart =
      config.data instanceof FormData ||
      config.headers['Content-Type']?.toString().includes('multipart/form-data');

    const hasBody = config.data !== undefined && config.data !== null;

    if (isMultipart) {
      const { encryptedKey, aesKey } = await encryptAESKeyOnly();
      aesKeyMap.set(config, aesKey);
      config.headers['X-Key'] = encryptedKey;
    } else if (hasBody) {
      const encrypted = await encryptPayload(config.data);
      aesKeyMap.set(config, encrypted.aesKey);
      config.headers['X-Key'] = encrypted.encryptedKey;
      config.headers['X-IV'] = encrypted.iv;
      config.headers['X-Tag'] = encrypted.tag;
      config.data = { payload: encrypted.encryptedData };
    } else {
      const { encryptedKey, aesKey } = await encryptAESKeyOnly();
      aesKeyMap.set(config, aesKey);
      config.headers['X-Key'] = encryptedKey;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(async (response) => {
  const aesKey = aesKeyMap.get(response.config);
  const iv = response.headers['x-iv'];
  const tag = response.headers['x-tag'];

  if (aesKey && iv && tag && response.data?.payload) {
    response.data = await decryptResponse(aesKey, {
      encryptedData: response.data.payload,
      iv,
      tag,
    });
  }

  return response;
});

apiClient.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

  if (
    error.response?.status !== 401 ||
    !originalRequest ||
    originalRequest._retry ||
    shouldSkipAuthRefresh(originalRequest)
  ) {
    return Promise.reject(error);
  }

  if (!getRefreshToken()) {
    clearStoredAuthState();
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const newAccessToken = await refreshSessionTokens();
    setAuthorizationHeader(originalRequest, newAccessToken);
    return apiClient(originalRequest);
  } catch (refreshError) {
    clearStoredAuthState();

    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }

    return Promise.reject(refreshError);
  }
});

export default apiClient;
