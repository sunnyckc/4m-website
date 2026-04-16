import { loadPublicJson } from '@/utils/load-public-json';
import { CONTACT_INFO_FALLBACK } from '@/constants/contact-fallback';
import type {
  HeroSlide,
  ProductCategoriesData,
  ProductCategory,
  ProductSubcategory,
  SiteLinks,
  SteamCollageData,
  ContactInfo,
} from '@/types/content';

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
  return loadPublicJson('contact.json', CONTACT_INFO_FALLBACK);
}
