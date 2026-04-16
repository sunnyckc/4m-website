import type {
  ContactInfo,
  HeroSlide,
  ProductCategoriesData,
  SiteLinks,
  SteamCollageData,
} from '@/types/content';

/**
 * Load typed JSON from `public/data/*.json` (build-time dynamic import).
 */
type PublicDataKey = keyof typeof publicDataLoaders;

const publicDataLoaders = {
  'hero-slides.json': () => import('@public/data/hero-slides.json'),
  'steam-collage.json': () => import('@public/data/steam-collage.json'),
  'product-categories.json': () => import('@public/data/product-categories.json'),
  'site-links.json': () => import('@public/data/site-links.json'),
  'contact.json': () => import('@public/data/contact.json'),
} as const;

type PublicDataMap = {
  'hero-slides.json': HeroSlide[];
  'steam-collage.json': SteamCollageData;
  'product-categories.json': ProductCategoriesData;
  'site-links.json': SiteLinks;
  'contact.json': ContactInfo;
};

export async function loadPublicJson<K extends PublicDataKey>(
  key: K,
  fallback: PublicDataMap[K]
): Promise<PublicDataMap[K]> {
  try {
    const mod = await publicDataLoaders[key]();
    const data = mod.default as PublicDataMap[K] | undefined;
    if (data === undefined || data === null) return fallback;
    return data;
  } catch (error) {
    console.error(`[utils] loadPublicJson(${key}):`, error);
    return fallback;
  }
}
