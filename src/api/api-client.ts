import axios, { InternalAxiosRequestConfig } from 'axios';
import {
  clearStoredAuthState,
  getAccessToken,
  getRefreshToken,
  updateStoredTokens,
} from '@/lib/auth';
import { decryptResponse, encryptAESKeyOnly, encryptPayload } from '@/lib/crypto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const encryptionEnabled = !!process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;

type ExtendedAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuthRefresh?: boolean;
};

const aesKeyMap = new WeakMap<InternalAxiosRequestConfig, CryptoKey>();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function onRefreshFailed() {
  refreshSubscribers = [];
}

apiClient.interceptors.response.use(undefined, async (error) => {
  const originalRequest = error.config as ExtendedAxiosRequestConfig | undefined;

  if (
    error.response?.status !== 401 ||
    !originalRequest ||
    originalRequest._retry ||
    originalRequest.skipAuthRefresh ||
    originalRequest.url?.includes('/auth/login') ||
    originalRequest.url?.includes('/auth/signup') ||
    originalRequest.url?.includes('/auth/verify-email') ||
    originalRequest.url?.includes('/auth/resend-verification') ||
    originalRequest.url?.includes('/auth/forgot-password') ||
    originalRequest.url?.includes('/auth/verify-reset-otp') ||
    originalRequest.url?.includes('/auth/reset-password') ||
    originalRequest.url?.includes('/auth/refresh') ||
    originalRequest.url?.includes('/auth/invitation')
  ) {
    return Promise.reject(error);
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearStoredAuthState();
    return Promise.reject(error);
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeTokenRefresh((newToken: string) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        resolve(apiClient(originalRequest));
      });
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const newAccessToken = response.data?.accessToken as string | undefined;
    const newRefreshToken = response.data?.refreshToken as string | undefined;

    if (!newAccessToken) {
      throw new Error('No access token in refresh response');
    }

    updateStoredTokens(newAccessToken, newRefreshToken);
    onTokenRefreshed(newAccessToken);
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return apiClient(originalRequest);
  } catch (refreshError) {
    onRefreshFailed();
    clearStoredAuthState();

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
});

export default apiClient;
