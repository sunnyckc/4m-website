/**
 * Base URL for your backend (no trailing slash), e.g. https://api.example.com/v1
 * Exposed to the browser as PUBLIC_* so the product list can search against it.
 */
export function getPublicApiBaseUrl(): string | null {
  const url = import.meta.env.PUBLIC_API_URL;
  if (url && typeof url === 'string' && url.trim()) {
    return url.replace(/\/$/, '');
  }
  // Fallback avoids SSR detail redirects when an older dev session
  // started without PUBLIC_API_URL loaded.
  return 'https://4m-backend-production.up.railway.app';
}
