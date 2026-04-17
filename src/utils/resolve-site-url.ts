import { getBase } from '@/config/site';

/**
 * Prefixes internal paths with the site base (e.g. `/4m-website`).
 * Leaves `http(s)://` URLs unchanged.
 */
export function resolveSiteUrl(path: string | null | undefined): string | null | undefined {
  if (path == null || path === '') return path;
  const trimmed = path.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = getBase();
  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${base}${normalized}`;
}
