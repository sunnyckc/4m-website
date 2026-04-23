import { getAllProducts } from '@/services/products';
import type { Product, ProductMedia } from '@/types/product';
import { getBase } from '@/config/site';

function resolveMediaUrl(product: Product, m: ProductMedia): string {
  if (m.media_source === 'file') {
    return `${getBase()}/images/products/${product.folder_name}/${m.media_destination}`;
  }
  return m.media_destination;
}

export function getProductThumbnail(product: Product): string {
  const directThumb = product.thumbnail?.signedUrl?.trim() || '';
  if (directThumb) return directThumb;

  const thumbs = product.media.filter((m) => m.type === 'image' && !m.hidden && m.thumbnail);

  if (thumbs.length === 1) {
    return resolveMediaUrl(product, thumbs[0]);
  }

  if (thumbs.length > 1) {
    const pick = thumbs[Math.floor(Math.random() * thumbs.length)];
    return resolveMediaUrl(product, pick);
  }

  const firstImage = product.media
    .filter((m) => m.type === 'image' && !m.hidden)
    .sort((a, b) => a.sequence - b.sequence)[0];
  return firstImage ? resolveMediaUrl(product, firstImage) : '';
}

export function getProductVisibleMedia(product: Product): ProductMedia[] {
  return product.media.filter((m) => !m.hidden).sort((a, b) => a.sequence - b.sequence);
}

export function resolveMediaPath(product: Product, media: ProductMedia): string {
  if (media.media_source === 'file') {
    return `${getBase()}/images/products/${product.folder_name}/${media.media_destination}`;
  }
  return media.media_destination;
}

export async function getProducts(): Promise<Product[]> {
  try {
    return await getAllProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find((product) => product.folder_name === id) || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.category_main.toLowerCase() === category.toLowerCase());
}

export async function getTopItemsProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => product.top_item ?? product.hot_item);
}

/** @deprecated Use `getTopItemsProducts`. */
export const getHotProducts = getTopItemsProducts;

export function getUniqueCategories(products: Product[]): string[] {
  const categories = products.map((product) => product.category_main);
  return [...new Set(categories)].sort();
}

export function getUniqueSubcategories(products: Product[], category?: string): string[] {
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter((product) => product.category_main === category);
  }
  const subcategories = filteredProducts.map((product) => product.category_sub);
  return [...new Set(subcategories)].sort();
}

export function searchProducts(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm.trim()) return products;

  const term = searchTerm.toLowerCase();
  return products.filter(
    (product) =>
      product.item_name.toLowerCase().includes(term) ||
      product.item_code.toLowerCase().includes(term) ||
      product.tag_visible.some((tag) => tag.toLowerCase().includes(term)) ||
      product.tag_hidden.some((tag) => tag.toLowerCase().includes(term)) ||
      product.category_main.toLowerCase().includes(term) ||
      product.category_sub.toLowerCase().includes(term)
  );
}
