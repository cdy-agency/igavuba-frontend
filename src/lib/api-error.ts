import { isAxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types';

const GENERIC_NETWORK_MESSAGE =
  'Unable to reach our servers. Check your internet connection, disable VPN if enabled, and try again.';

const GENERIC_TIMEOUT_MESSAGE =
  'The request timed out. Check your internet connection and try again.';

const GENERIC_ENCRYPTION_MESSAGE =
  'We could not secure your request on this device. Please refresh the page and try again.';

function extractBackendMessage(data: ApiErrorResponse | undefined, fallback: string): string | null {
  if (!data) {
    return null;
  }

  const { message, details } = data;

  if (Array.isArray(message)) {
    const first = message.find((item) => typeof item === 'string' && item.trim().length > 0);
    if (first) {
      return first;
    }
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return message;
  }

  if (details) {
    for (const fieldMessages of Object.values(details)) {
      const first = fieldMessages.find((item) => item.trim().length > 0);
      if (first) {
        return first;
      }
    }
  }

  return null;
}

function mapStatusToMessage(status: number, fallback: string): string {
  if (status === 401) {
    return 'Your session has expired. Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 429) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (status >= 500) {
    return 'Our servers are temporarily unavailable. Please try again in a few minutes.';
  }

  return fallback;
}

function mapTransportError(error: { code?: string; message?: string }): string | null {
  if (error.code === 'ECONNABORTED') {
    return GENERIC_TIMEOUT_MESSAGE;
  }

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return GENERIC_NETWORK_MESSAGE;
  }

  const message = error.message?.toLowerCase() ?? '';

  if (message.includes('next_public_rsa_public_key')) {
    return 'Security setup failed. Please refresh the page or contact support.';
  }

  if (
    message.includes('encrypt') ||
    message.includes('decrypt') ||
    message.includes('crypto') ||
    message.includes('subtle')
  ) {
    return GENERIC_ENCRYPTION_MESSAGE;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof Error && error.name === 'ApiClientError') {
    return error.message;
  }

  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const backendMessage = extractBackendMessage(data, fallback);

    if (backendMessage) {
      return backendMessage;
    }

    if (error.response?.status) {
      return mapStatusToMessage(error.response.status, fallback);
    }

    const transportMessage = mapTransportError(error);
    if (transportMessage) {
      return transportMessage;
    }
  }

  if (error instanceof Error) {
    const transportMessage = mapTransportError(error);
    if (transportMessage) {
      return transportMessage;
    }

    if (error.message.trim().length > 0 && error.message !== 'Network Error') {
      return error.message;
    }
  }

  return fallback;
}
