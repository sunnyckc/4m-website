import type { GalleryGridItem, HeroBannerSlide } from '@/components/organisms/home/types';
import homeCatalogHotFallback from '@public/data/home/catalog-hot.json';
import homeGallerySteamFallback from '@public/data/home/gallery-steam.json';
import homeHeroFallback from '@public/data/home/hero.json';
import { loadPublicJson } from '@/utils/load-public-json';
import { resolveSiteUrl } from '@/utils/resolve-site-url';
import { CONTACT_INFO_FALLBACK } from '@/constants/contact-fallback';
import { COMPANY_ADDRESS, getCompanyAddressFull } from '@/constants/company';
import type {
  HomeCatalogHotJson,
  HomeGallerySteamJson,
  HomeHeroFullViewportJson,
  HomeHeroJson,
  HomeHeroOrbitBannerJson,
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
          }
        : undefined,
    kid: {
      ...ob.kid,
      image: ob.kid.image != null ? resolveSiteUrl(ob.kid.image) ?? ob.kid.image : ob.kid.image,
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

const STEAM_COLLAGE_FALLBACK: SteamCollageData = {
  mainItem: {
    id: 'main-fallback',
    title: 'STEAM Education',
    backgroundColor: 'bg-gradient-to-br from-indigo-600 to-purple-700',
  },
  smallItems: [],
};

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return loadPublicJson('hero-slides.json', []);
}

export async function getSteamCollageData(): Promise<SteamCollageData> {
  return loadPublicJson('steam-collage.json', STEAM_COLLAGE_FALLBACK);
}

export async function getProductCategories(): Promise<ProductCategoriesData> {
  return loadPublicJson('product-categories.json', { categories: [] });
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
