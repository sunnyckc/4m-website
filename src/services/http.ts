import { getPublicApiBaseUrl } from '@/config/api';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * GET JSON from `{apiBase}{path}` where `apiBase` is resolved by `getPublicApiBaseUrl()`.
 */
export async function apiGetJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getPublicApiBaseUrl();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new ApiError(`API request failed: ${res.status}`, res.status, path);
  }
  return (await res.json()) as T;
}
