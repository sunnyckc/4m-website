import type { GalleryGridItem, HeroBannerSlide } from '@/components/organisms/home/types';
import homeCatalogHotFallback from '@public/data/home/catalog-hot.json';
import homeGallerySteamFallback from '@public/data/home/gallery-steam.json';
import homeHeroFallback from '@public/data/home/hero.json';
import homeNewsGalleryFallback from '@public/data/home/news-gallery.json';
import homeSocialProofFallback from '@public/data/home/social-proof.json';
import { loadPublicJson } from '@/utils/load-public-json';
import { resolveSiteUrl } from '@/utils/resolve-site-url';
import { apiGetJson } from '@/services/http';
import { CONTACT_INFO_FALLBACK } from '@/constants/contact-fallback';
import { COMPANY_ADDRESS, getCompanyAddressFull } from '@/constants/company';
import type {
  HomeCatalogHotJson,
  HomeGallerySteamJson,
  HomeHeroFullViewportJson,
  HomeHeroJson,
  HomeHeroOrbitBannerJson,
  HomeNewsGalleryItemJson,
  HomeNewsGalleryJson,
  HomeSocialProofItemJson,
  HomeSocialProofJson,
} from '@/types/home-sections';
import type {
  HeroSlide,
  ProductCategoriesData,
  ProductCategory,
  ProductSubcategory,
  SiteLinks,
  SteamCollageData,
  ContactInfo,
} from '@/types/content';

function resolveHeroSlide(slide: HeroBannerSlide): HeroBannerSlide {
  const href = slide.href != null ? resolveSiteUrl(slide.href) ?? slide.href : null;
  if (slide.media.type === 'video') {
    return {
      ...slide,
      media: {
        ...slide.media,
        src: resolveSiteUrl(slide.media.src) ?? slide.media.src,
        posterUrl:
          slide.media.posterUrl != null
            ? resolveSiteUrl(slide.media.posterUrl) ?? slide.media.posterUrl
            : null,
      },
      href,
    };
  }
  return {
    ...slide,
    media: { ...slide.media, src: resolveSiteUrl(slide.media.src) ?? slide.media.src },
    href,
  };
}

function resolveFullViewport(
  fv: HomeHeroFullViewportJson,
): HomeHeroFullViewportJson {
  return {
    ...fv,
    ctaHref: resolveSiteUrl(fv.ctaHref) ?? fv.ctaHref,
  };
}

function resolveOrbitBanner(ob: HomeHeroOrbitBannerJson): HomeHeroOrbitBannerJson {
  return {
    ...ob,
    ctaHref: ob.ctaHref != null ? resolveSiteUrl(ob.ctaHref) ?? ob.ctaHref : ob.ctaHref,
    secondaryCtaHref:
      ob.secondaryCtaHref != null
        ? resolveSiteUrl(ob.secondaryCtaHref) ?? ob.secondaryCtaHref
        : ob.secondaryCtaHref,
    background:
      ob.background != null
        ? {
            ...ob.background,
            image:
              ob.background.image != null
                ? resolveSiteUrl(ob.background.image) ?? ob.background.image
                : ob.background.image,
            variants: ob.background.variants?.map(
              (v) => resolveSiteUrl(v) ?? v,
            ),
          }
        : undefined,
    kid: {
      ...ob.kid,
      image: ob.kid.image != null ? resolveSiteUrl(ob.kid.image) ?? ob.kid.image : ob.kid.image,
      variants: ob.kid.variants?.map(
        (v) => resolveSiteUrl(v) ?? v,
      ),
    },
    items: ob.items.map((item) => ({
      ...item,
      image: item.image != null ? resolveSiteUrl(item.image) ?? item.image : item.image,
      href: item.href != null ? resolveSiteUrl(item.href) ?? item.href : item.href,
    })),
  };
}

function resolveGalleryItem(item: GalleryGridItem): GalleryGridItem {
  return {
    ...item,
    imageUrl: item.imageUrl != null ? resolveSiteUrl(item.imageUrl) ?? item.imageUrl : null,
    href: item.href != null ? resolveSiteUrl(item.href) ?? item.href : null,
    batches: item.batches?.map((b) => ({
      ...b,
      href: b.href != null ? resolveSiteUrl(b.href) ?? b.href : null,
    })),
  };
}

function resolveSocialProofItem(item: HomeSocialProofItemJson): HomeSocialProofItemJson {
  return {
    ...item,
    logo: item.logo != null ? resolveSiteUrl(item.logo) ?? item.logo : item.logo,
    href: item.href != null ? resolveSiteUrl(item.href) ?? item.href : item.href,
  };
}

function resolveNewsGalleryItem(item: HomeNewsGalleryItemJson): HomeNewsGalleryItemJson {
  return {
    ...item,
    image: item.image != null ? resolveSiteUrl(item.image) ?? item.image : item.image,
    href: resolveSiteUrl(item.href) ?? item.href,
  };
}

const STEAM_COLLAGE_FALLBACK: SteamCollageData = {
  mainItem: {
    id: 'main-fallback',
    title: 'STEAM Education',
    backgroundColor: 'bg-gradient-to-br from-indigo-600 to-purple-700',
  },
  smallItems: [],
};

interface CategoriesFilterApiItem {
  category_main?: unknown;
  category_subs?: unknown;
}

function titleFromSlug(value: string): string {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeCategorySubcategory(value: unknown): string {
  return String(value ?? '').trim();
}

function mapCategoriesFilterItems(items: unknown): ProductCategory[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((raw): ProductCategory | null => {
      const item = raw as CategoriesFilterApiItem;
      const categoryMain = normalizeCategorySubcategory(item.category_main);
      if (!categoryMain) return null;
      const subValues = Array.isArray(item.category_subs) ? item.category_subs : [];
      const seenSubIds = new Set<string>();
      const subcategories: ProductSubcategory[] = [];
      for (const sub of subValues) {
        const subId = normalizeCategorySubcategory(sub);
        if (!subId || seenSubIds.has(subId)) continue;
        seenSubIds.add(subId);
        subcategories.push({
          id: subId,
          name: titleFromSlug(subId),
          description: '',
        });
      }
      return {
        id: categoryMain,
        name: titleFromSlug(categoryMain),
        description: '',
        subcategories,
      };
    })
    .filter((item): item is ProductCategory => item !== null);
}

/** Accepts wrapped `{ data: ... }`, `{ data: { items } }`, top-level `items`, or a raw array. */
function extractCategoryFilterItems(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;
  if ('data' in r) return extractCategoryFilterItems(r.data);
  if (Array.isArray(r.items)) return r.items;
  if (Array.isArray(r.categories)) return r.categories;
  return [];
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return loadPublicJson('hero-slides.json', []);
}

export async function getSteamCollageData(): Promise<SteamCollageData> {
  return loadPublicJson('steam-collage.json', STEAM_COLLAGE_FALLBACK);
}

export async function getProductCategories(): Promise<ProductCategoriesData> {
  const paths = [
    '/api/v1/products/categories',
    '/api/v1/cms/products/categories',
    '/cms/products/categories',
  ];
  for (const path of paths) {
    try {
      const apiResponse = await apiGetJson<unknown>(path);
      const items = extractCategoryFilterItems(apiResponse);
      const mapped = mapCategoriesFilterItems(items);
      if (mapped.length > 0) {
        return { categories: mapped };
      }
    } catch (error) {
      console.warn(`[site] getProductCategories: ${path} failed`, error);
    }
  }
  console.warn('[site] getProductCategories: no category data from API; empty sidebar');
  return { categories: [] };
}

export async function getCategoryById(categoryId: string): Promise<ProductCategory | null> {
  const categoriesData = await getProductCategories();
  return categoriesData.categories.find((cat) => cat.id === categoryId) || null;
}

export async function getSubcategoryById(
  categoryId: string,
  subcategoryId: string
): Promise<ProductSubcategory | null> {
  const category = await getCategoryById(categoryId);
  if (!category) return null;
  return category.subcategories.find((sub) => sub.id === subcategoryId) || null;
}

export async function getSiteLinks(): Promise<SiteLinks> {
  return loadPublicJson('site-links.json', { catalog_buttons: [] });
}

export async function getContactInfo(): Promise<ContactInfo> {
  const loaded = await loadPublicJson('contact.json', CONTACT_INFO_FALLBACK);
  return {
    ...loaded,
    contact: {
      ...loaded.contact,
      address: {
        ...COMPANY_ADDRESS,
        full: getCompanyAddressFull(),
      },
    },
  };
}

export async function getHomeHero(): Promise<HomeHeroJson> {
  const data = await loadPublicJson('home/hero.json', homeHeroFallback as HomeHeroJson);
  return {
    ...data,
    slides: data.slides.map(resolveHeroSlide),
    fullViewport:
      data.fullViewport != null ? resolveFullViewport(data.fullViewport) : undefined,
    orbitBanner:
      data.orbitBanner != null ? resolveOrbitBanner(data.orbitBanner) : undefined,
  };
}

export async function getHomeGallerySteam(): Promise<HomeGallerySteamJson> {
  const data = await loadPublicJson(
    'home/gallery-steam.json',
    homeGallerySteamFallback as HomeGallerySteamJson,
  );
  return {
    ...data,
    items: data.items.map(resolveGalleryItem),
  };
}

export async function getHomeCatalogHot(): Promise<HomeCatalogHotJson> {
  return loadPublicJson('home/catalog-hot.json', homeCatalogHotFallback as HomeCatalogHotJson);
}

export async function getHomeSocialProof(): Promise<HomeSocialProofJson> {
  const data = await loadPublicJson(
    'home/social-proof.json',
    homeSocialProofFallback as HomeSocialProofJson,
  );
  return {
    ...data,
    items: data.items.map(resolveSocialProofItem),
  };
}

export async function getHomeNewsGallery(): Promise<HomeNewsGalleryJson> {
  const data = await loadPublicJson(
    'home/news-gallery.json',
    homeNewsGalleryFallback as HomeNewsGalleryJson,
  );
  return {
    ...data,
    items: data.items.map(resolveNewsGalleryItem),
  };
}
