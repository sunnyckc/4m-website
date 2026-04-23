/**
 * Browser calls should go through the frontend proxy (`PUBLIC_API_URL`).
 * SSR calls can go directly to a private backend origin (`API_INTERNAL_URL`).
 */
export function getPublicApiBaseUrl(): string | null {
  const internal = import.meta.env.API_INTERNAL_URL;
  if (import.meta.env.SSR && internal && typeof internal === 'string' && internal.trim()) {
    return internal.replace(/\/$/, '');
  }

  const publicUrl = import.meta.env.PUBLIC_API_URL;
  if (publicUrl && typeof publicUrl === 'string' && publicUrl.trim()) {
    return publicUrl.replace(/\/$/, '');
  }

  // Safe fallback for older environments where variables are missing.
  return 'https://4m-backend-production.up.railway.app';
}
