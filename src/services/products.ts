import type {
  Product,
  ProductGalleryItem,
  ProductRelatedProduct,
  ProductThumbnail,
  ProductTranslation,
} from '@/types/product';
import { getPublicApiBaseUrl } from '@/config/api';
import { apiGetJson } from '@/services/http';

export type ProductSort = 'name-asc' | 'name-desc' | 'code-asc' | '';

export interface ProductsListParams {
  /** Free-text search (name, code, tags, category, description) */
  q?: string;
  /** Main category id, or `top-items` for top-only */
  category?: string;
  subcategory?: string;
  /** Explicit top-item filter (true = top items only). */
  topOnly?: boolean;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export interface ProductsListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

interface ApiListPagination {
  page?: number;
  limit?: number;
  total?: number;
}

interface ApiWrappedData<T> {
  success?: boolean;
  data?: T;
}

function vimeoId(raw: string): string {
  const value = raw.trim();
  const fromPath = value.match(/vimeo\.com\/(\d+)/);
  if (fromPath) return fromPath[1];
  return value;
}

function mapGalleryToMedia(gallery: ProductGalleryItem[]): Product['media'] {
  return gallery.map((item, index) => {
    const type =
      item.type.includes('video') ? 'video' : item.type.includes('award') ? 'award' : 'image';
    const url = item.signedUrl || item.url || '';
    if (type === 'video' && url.includes('vimeo.com')) {
      return {
        type,
        sequence: item.sequence ?? index,
        thumbnail: Boolean(item.isThumbnail),
        hidden: false,
        media_source: 'vimeo',
        media_destination: vimeoId(url),
      };
    }
    return {
      type,
      sequence: item.sequence ?? index,
      thumbnail: Boolean(item.isThumbnail),
      hidden: false,
      media_source: 'url',
      media_destination: url,
    };
  });
}

function mapTranslationsToMultiLanguage(translations: ProductTranslation[]): Product['multi_language'] {
  return translations
    .filter((item) => !item.isHidden)
    .map((item) => ({
      language: item.language,
      media_source: 'url' as const,
      media_destination: item.signedUrl || item.url || '',
    }))
    .filter((item) => item.media_destination !== '');
}

function normalizeProduct(input: Record<string, unknown>): Product {
  const gallery = Array.isArray(input.gallery) ? (input.gallery as ProductGalleryItem[]) : [];
  const translations = Array.isArray(input.translations)
    ? (input.translations as ProductTranslation[])
    : [];
  const relatedProducts = Array.isArray(input.related_products)
    ? (input.related_products as ProductRelatedProduct[])
    : [];
  const topItem = Boolean(input.top_item ?? input.hot_item ?? false);
  const legacyHotItem = typeof input.hot_item === 'boolean' ? input.hot_item : undefined;
  const media = mapGalleryToMedia(gallery);
  const multiLanguage = mapTranslationsToMultiLanguage(translations);

  const thumbnail =
    input.thumbnail && typeof input.thumbnail === 'object'
      ? (input.thumbnail as ProductThumbnail)
      : null;

  return {
    item_code: String(input.item_code ?? ''),
    item_name: String(input.item_name ?? ''),
    item_description: String(input.item_description ?? ''),
    folder_name: String(input.folder_name ?? input.item_code ?? ''),
    category_main: String(input.category_main ?? ''),
    category_sub: String(input.category_sub ?? ''),
    tag_visible: Array.isArray(input.tag_visible) ? (input.tag_visible as string[]) : [],
    tag_hidden: Array.isArray(input.tag_hidden) ? (input.tag_hidden as string[]) : [],
    media,
    specifications: Array.isArray(input.specifications) ? (input.specifications as Product['specifications']) : [],
    award_text: Array.isArray(input.award_text) ? (input.award_text as string[]) : [],
    hot_item: legacyHotItem,
    top_item: topItem,
    multi_language: multiLanguage,
    translations,
    related_product: relatedProducts.map((item) => item.item_code),
    related_products: relatedProducts,
    gallery,
    thumbnail,
  };
}

function unwrapData<T>(data: unknown): T | null {
  if (!data || typeof data !== 'object') return null;
  const wrapped = data as ApiWrappedData<T>;
  if ('data' in wrapped) {
    return (wrapped.data ?? null) as T | null;
  }
  return data as T;
}

/**
 * Full catalog for related products, etc.
 * Fetches all pages from `GET {API}/api/v1/products?page=&limit=`.
 *
 * Backend may return a JSON array or `{ items: Product[] }`.
 */
export async function getAllProducts(): Promise<Product[]> {
  const base = getPublicApiBaseUrl();
  if (!base) {
    throw new Error('API base URL is not set');
  }
  const pageSize = 20;
  const first = normalizeListResponse(
    await apiGetJson<unknown>(`/api/v1/products?page=1&limit=${pageSize}`),
    { page: 1, pageSize }
  );
  const totalPages = Math.max(1, Math.ceil(first.total / Math.max(1, first.pageSize)));
  if (totalPages <= 1) return first.items;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      apiGetJson<unknown>(`/api/v1/products?page=${i + 2}&limit=${pageSize}`)
    )
  );
  const all = [...first.items];
  for (const page of rest) {
    const parsed = normalizeListResponse(page, { pageSize });
    all.push(...parsed.items);
  }
  const seen = new Set<string>();
  return all.filter((item) => {
    const key = item.item_code || item.folder_name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeListResponse(data: unknown, fallback: ProductsListParams): ProductsListResult {
  const unwrapped = unwrapData<unknown>(data) ?? data;
  if (Array.isArray(unwrapped)) {
    const pageSize = fallback.pageSize ?? 9;
    return {
      items: unwrapped.map((item) => normalizeProduct(item as Record<string, unknown>)),
      total: unwrapped.length,
      page: fallback.page ?? 1,
      pageSize,
    };
  }
  const obj = unwrapped as Record<string, unknown>;
  const itemsRaw = (obj.items ?? obj.products ?? []) as unknown[];
  const pagination = (obj.pagination ?? {}) as ApiListPagination;
  const items = itemsRaw.map((item) => normalizeProduct(item as Record<string, unknown>));
  return {
    items,
    total: Number(pagination.total ?? obj.total ?? items.length ?? 0),
    page: Number(pagination.page ?? obj.page ?? fallback.page ?? 1),
    pageSize: Number(pagination.limit ?? obj.pageSize ?? obj.perPage ?? fallback.pageSize ?? 9),
  };
}

async function fetchProductsFromApi(params: ProductsListParams): Promise<ProductsListResult> {
  const qs = new URLSearchParams();
  const q = params.q?.trim();
  const isTopOnly = params.topOnly || params.category === 'top-items' || params.category === 'hot-products';
  if (q) qs.set('search', q);
  if (isTopOnly) {
    qs.set('top_item', 'true');
  } else if (params.category) {
    // Keep legacy and newer query names for backend compatibility.
    qs.set('category', params.category);
    qs.set('category_main', params.category);
  }
  if (params.subcategory) {
    qs.set('subcategory', params.subcategory);
    qs.set('category_sub', params.subcategory);
  }
  if (params.sort) qs.set('sort', params.sort);
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.pageSize ?? 9));
  const path = `/api/v1/products${qs.toString() ? `?${qs}` : ''}`;
  const raw = await apiGetJson<unknown>(path);
  return normalizeListResponse(raw, params);
}

/**
 * Paginated product list for the catalog UI and for API-backed search.
 * Uses `GET {API}/api/v1/products?...` only (no local JSON fallback).
 */
export async function loadProductsList(params: ProductsListParams): Promise<ProductsListResult> {
  return fetchProductsFromApi(params);
}

/**
 * Product detail request for SSR detail page.
 * Accepts folder_name or item_code as route key.
 */
export async function getProductDetail(routeKey: string): Promise<Product | null> {
  const base = getPublicApiBaseUrl();
  if (!base) return null;
  const key = routeKey.trim();
  if (!key) return null;
  try {
    const raw = await apiGetJson<unknown>(`/api/v1/products/${encodeURIComponent(key)}`);
    const data = unwrapData<unknown>(raw);
    if (data && typeof data === 'object') {
      return normalizeProduct(data as Record<string, unknown>);
    }
  } catch (e) {
    console.warn('[services] getProductDetail: detail API failed, trying catalog fallback', e);
  }

  try {
    const all = await getAllProducts();
    return (
      all.find(
        (item) =>
          item.item_code.toLowerCase() === key.toLowerCase() ||
          item.folder_name.toLowerCase() === key.toLowerCase()
      ) ?? null
    );
  } catch {
    return null;
  }
}
