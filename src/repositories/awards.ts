import { loadAwards } from '@/services/awards';
import type { Award } from '@/types/award';

export async function getAwards(): Promise<Award[]> {
  try {
    return await loadAwards();
  } catch (error) {
    console.error('Error loading awards:', error);
    return [];
  }
}

export async function getFeaturedAwards(): Promise<Award[]> {
  const awards = await getAwards();
  return awards.filter((award) => award.featured);
}
