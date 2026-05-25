const ACCESS_TOKEN_KEY = 'access_token';
const AUTH_SESSION_KEY = 'auth-session';

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Store access token in a cookie (shared across tabs)
    const maxAge = 3600; // 1 hour (matches JWT expiry)
    // biome-ignore lint/suspicious/noDocumentCookie: Access token cookie for cross-tab session sharing
    document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;

    // Set a lightweight marker cookie for Next.js middleware route protection (longer-lived)
    const markerMaxAge = 60 * 60 * 24 * 7; // 7 days (matches refresh token lifetime)
    // biome-ignore lint/suspicious/noDocumentCookie: Lightweight auth marker cookie for middleware
    document.cookie = `${AUTH_SESSION_KEY}=true; path=/; max-age=${markerMaxAge}; SameSite=Lax`;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.trim().split('=');
      if (name === ACCESS_TOKEN_KEY) {
        const value = valueParts.join('=');
        if (value) return value;
      }
    }
  }
  return null;
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Expire access token cookie
    // biome-ignore lint/suspicious/noDocumentCookie: Access token cookie removal
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Expire marker cookie
    // biome-ignore lint/suspicious/noDocumentCookie: Auth marker cookie removal
    document.cookie = `${AUTH_SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

    // Clear legacy storage
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('auth_token');

    // Clear legacy cookies
    // biome-ignore lint/suspicious/noDocumentCookie: Legacy cookie cleanup
    document.cookie = `auth-token-exists=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    // biome-ignore lint/suspicious/noDocumentCookie: Legacy cookie cleanup
    document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};

export const INSTITUTION_ID_KEY = 'institution-id';

export const setInstitutionId = (institutionId: string | null) => {
  if (typeof window !== 'undefined') {
    if (institutionId) {
      const maxAge = 60 * 60 * 24 * 7; // 7 days
      // biome-ignore lint/suspicious/noDocumentCookie: Institution ID persistence is a legitimate use case
      document.cookie = `${INSTITUTION_ID_KEY}=${institutionId}; path=/; max-age=${maxAge}; SameSite=Lax`;
    } else {
      // Remove cookie if null
      // biome-ignore lint/suspicious/noDocumentCookie: Institution ID removal is a legitimate use case
      document.cookie = `${INSTITUTION_ID_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

export const getInstitutionId = (): string | null => {
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === INSTITUTION_ID_KEY && value) {
        return value;
      }
    }
  }
  return null;
};

export const removeInstitutionId = () => {
  if (typeof window !== 'undefined') {
    // biome-ignore lint/suspicious/noDocumentCookie: Institution ID removal is a legitimate use case
    document.cookie = `${INSTITUTION_ID_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
};
