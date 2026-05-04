import type {
  Product,
  ProductGalleryItem,
  ProductRelatedProduct,
  ProductThumbnail,
  ProductTranslation,
} from '@/types/product';
import { getProductRouteKey } from '@/lib/product-routing';
import { ApiError, apiGetJson } from '@/services/http';

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
  /** Optional cancellation signal for in-flight requests. */
  signal?: AbortSignal;
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
  const fromPlayer = value.match(/player\.vimeo\.com\/video\/(\d+)/i);
  if (fromPlayer) return fromPlayer[1];
  const fromPath = value.match(/vimeo\.com\/(\d+)/i);
  if (fromPath) return fromPath[1];
  if (/^\d+$/.test(value)) return value;
  return value;
}

/** True when the string is a Vimeo player URL or a bare numeric Vimeo video id (e.g. from VMMule). */
function isVimeoVideoDestination(url: string): boolean {
  const s = url.trim();
  if (!s) return false;
  if (/vimeo\.com\/\d+/i.test(s)) return true;
  if (/player\.vimeo\.com\/video\/\d+/i.test(s)) return true;
  if (/^\d+$/.test(s)) return true;
  return false;
}

function youtubeId(raw: string): string {
  const value = raw.trim();
  const fromQuery = value.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (fromQuery) return fromQuery[1];
  const fromShort = value.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (fromShort) return fromShort[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  return value;
}

function wistiaId(raw: string): string {
  const value = raw.trim();
  const fromIframe = value.match(/wistia\.(?:com|net)\/(?:medias|embed\/iframe)\/([a-zA-Z0-9]+)/);
  if (fromIframe) return fromIframe[1];
  return value;
}

function mapGalleryToMedia(gallery: ProductGalleryItem[]): Product['media'] {
  return gallery.map((item, index) => {
    const type =
      item.type.includes('video') ? 'video' : item.type.includes('award') ? 'award' : 'image';
    const url = item.signedUrl || item.url || '';
    const vimeoFromApi = typeof item.vimeo_video_id === 'string' ? item.vimeo_video_id.trim() : '';
    if (type === 'video') {
      if (vimeoFromApi && /^\d+$/.test(vimeoFromApi)) {
        return {
          type,
          sequence: item.sequence ?? index,
          thumbnail: Boolean(item.isThumbnail),
          hidden: false,
          media_source: 'vimeo',
          media_destination: vimeoFromApi,
        };
      }
      if (isVimeoVideoDestination(url)) {
        return {
          type,
          sequence: item.sequence ?? index,
          thumbnail: Boolean(item.isThumbnail),
          hidden: false,
          media_source: 'vimeo',
          media_destination: vimeoId(url),
        };
      }
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return {
          type,
          sequence: item.sequence ?? index,
          thumbnail: Boolean(item.isThumbnail),
          hidden: false,
          media_source: 'youtube',
          media_destination: youtubeId(url),
        };
      }
      if (url.includes('wistia.com') || url.includes('wistia.net')) {
        return {
          type,
          sequence: item.sequence ?? index,
          thumbnail: Boolean(item.isThumbnail),
          hidden: false,
          media_source: 'wistia',
          media_destination: wistiaId(url),
        };
      }
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

function parseOptionalSequence(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(String(value).trim());
  return Number.isFinite(n) ? n : undefined;
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
    id: input.id == null ? null : String(input.id),
    item_code: String(input.item_code ?? ''),
    item_name: String(input.item_name ?? ''),
    item_description: String(input.item_description ?? ''),
    folder_name: String(input.folder_name ?? input.item_code ?? ''),
    category_main: String(input.category_main ?? ''),
    category_sub: String(input.category_sub ?? ''),
    sequence_category_main: parseOptionalSequence(input.sequence_category_main),
    sequence_category_sub: parseOptionalSequence(input.sequence_category_sub),
    tag_visible: Array.isArray(input.tag_visible) ? (input.tag_visible as string[]) : [],
    tag_hidden: Array.isArray(input.tag_hidden) ? (input.tag_hidden as string[]) : [],
    media,
    specifications: Array.isArray(input.specifications) ? (input.specifications as Product['specifications']) : [],
    award_text: Array.isArray(input.award_text) ? (input.award_text as string[]) : [],
    hot_item: legacyHotItem,
    top_item: topItem,
    multi_language: multiLanguage,
    translations,
    related_product: relatedProducts.map((item) => item.id ?? item.item_code),
    related_products: relatedProducts,
    gallery,
    thumbnail,
  };
}

function isUuidLike(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function matchesProductRouteKey(product: Product, routeKey: string): boolean {
  const lowered = routeKey.toLowerCase();
  return (
    getProductRouteKey(product).toLowerCase() === lowered ||
    product.folder_name.toLowerCase() === lowered ||
    product.item_code.toLowerCase() === lowered
  );
}

async function fetchProductDetailById(productId: string): Promise<Product | null> {
  const raw = await apiGetJson<unknown>(`/api/v1/products/${encodeURIComponent(productId)}`);
  const data = unwrapData<unknown>(raw);
  if (data && typeof data === 'object') {
    return normalizeProduct(data as Record<string, unknown>);
  }
  return null;
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
    const key = item.id || getProductRouteKey(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeListResponse(data: unknown, fallback: ProductsListParams): ProductsListResult {
  const unwrapped = unwrapData<unknown>(data) ?? data;
  if (Array.isArray(unwrapped)) {
    const pageSize = fallback.pageSize ?? 8;
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
    pageSize: Number(pagination.limit ?? obj.pageSize ?? obj.perPage ?? fallback.pageSize ?? 8),
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
  qs.set('limit', String(params.pageSize ?? 8));
  const path = `/api/v1/products${qs.toString() ? `?${qs}` : ''}`;
  const raw = await apiGetJson<unknown>(path, { signal: params.signal });
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
 * The backend resolves `GET /api/v1/products/:id` by UUID, `item_code`, or `folder_name` — try that first,
 * then fall back to scanning the catalog (legacy / mis-keyed slugs).
 */
export async function getProductDetail(routeKey: string): Promise<Product | null> {
  const key = routeKey.trim();
  if (!key) return null;

  try {
    const direct = await fetchProductDetailById(key);
    if (direct) return direct;
  } catch (e) {
    const notFound = e instanceof ApiError && e.status === 404;
    if (!notFound) {
      console.warn('[services] getProductDetail: direct detail request failed', e);
    }
  }

  if (isUuidLike(key)) {
    return null;
  }

  try {
    const all = await getAllProducts();
    const match = all.find((item) => matchesProductRouteKey(item, key)) ?? null;
    if (!match?.id) {
      return match;
    }
    return await fetchProductDetailById(match.id);
  } catch (e) {
    console.warn('[services] getProductDetail: catalog fallback failed', e);
  }

  return null;
}
