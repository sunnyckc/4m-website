import type { Award } from '@/types/award';
import { getPublicApiBaseUrl } from '@/config/api';
import { apiGetJson } from '@/services/http';

async function loadAwardsJson(): Promise<Award[]> {
  const mod = await import('@public/data/awards.json');
  const awards = (mod.default || []) as Award[];
  return awards.sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return parseInt(b.year, 10) - parseInt(a.year, 10);
  });
}

/**
 * Full awards list from `GET {API}/awards` or local `public/data/awards.json`.
 */
export async function loadAwards(): Promise<Award[]> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      const data = await apiGetJson<unknown>('/awards');
      if (Array.isArray(data)) return data as Award[];
      const obj = data as { items?: Award[]; awards?: Award[] };
      return (obj.items ?? obj.awards ?? []) as Award[];
    } catch (e) {
      console.warn('[services] loadAwards: API failed, using local JSON', e);
    }
  }
  return loadAwardsJson();
}
