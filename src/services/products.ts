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
  /** Main category id, or `hot-products` for hot-only */
  category?: string;
  subcategory?: string;
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
    hot_item: topItem,
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

/** In-memory cache for bundled JSON / repeated list calls (browser + SSR). */
let cachedAllProducts: Product[] | null = null;

async function loadProductsJson(): Promise<Product[]> {
  if (cachedAllProducts) return cachedAllProducts;
  const mod = await import('@public/data/products.json');
  cachedAllProducts = (mod.default || []) as Product[];
  return cachedAllProducts;
}

/**
 * Full catalog for build-time routes (`getStaticPaths`), related products, etc.
 * Tries `GET {API}/api/v1/products?page=1&limit=500` then falls back to local JSON.
 *
 * Backend may return a JSON array or `{ items: Product[] }`.
 */
export async function getAllProducts(): Promise<Product[]> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
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
    } catch (e) {
      console.warn('[services] getAllProducts: API failed, using local JSON', e);
    }
  }
  return loadProductsJson();
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
  if (q) qs.set('search', q);
  if (params.category) qs.set('category', params.category);
  if (params.subcategory) qs.set('subcategory', params.subcategory);
  if (params.sort) qs.set('sort', params.sort);
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.pageSize ?? 9));
  const path = `/api/v1/products${qs.toString() ? `?${qs}` : ''}`;
  const raw = await apiGetJson<unknown>(path);
  return normalizeListResponse(raw, params);
}

function matchesSearch(product: Product, searchTerm: string): boolean {
  if (!searchTerm) return true;
  const term = searchTerm.toLowerCase();
  const tags = [...product.tag_visible, ...product.tag_hidden].join(' ').toLowerCase();
  return (
    product.item_name.toLowerCase().includes(term) ||
    (product.item_code?.toLowerCase().includes(term) ?? false) ||
    tags.includes(term) ||
    product.category_main.toLowerCase().includes(term) ||
    product.category_sub.toLowerCase().includes(term) ||
    product.item_description.toLowerCase().includes(term)
  );
}

function filterProductsLocal(all: Product[], params: ProductsListParams): Product[] {
  const q = params.q?.trim() ?? '';
  const cat = params.category ?? '';
  const sub = params.subcategory ?? '';

  let list = all.filter((product) => {
    if (!matchesSearch(product, q)) return false;

    let matchesCategory: boolean;
    if (!cat) {
      matchesCategory = true;
    } else if (cat === 'hot-products') {
      matchesCategory = product.top_item ?? product.hot_item;
    } else {
      matchesCategory = product.category_main === cat;
    }

    const matchesSub = !sub || product.category_sub === sub;
    return matchesCategory && matchesSub;
  });

  const sort = params.sort ?? '';
  list = [...list].sort((a, b) => {
    if ((a.top_item ?? a.hot_item) && !(b.top_item ?? b.hot_item)) return -1;
    if (!(a.top_item ?? a.hot_item) && (b.top_item ?? b.hot_item)) return 1;
    switch (sort) {
      case 'name-asc':
        return a.item_name.localeCompare(b.item_name);
      case 'name-desc':
        return b.item_name.localeCompare(a.item_name);
      case 'code-asc':
        return (a.item_code || '').localeCompare(b.item_code || '');
      default:
        return a.item_name.localeCompare(b.item_name);
    }
  });

  return list;
}

async function listProductsFromLocalJson(params: ProductsListParams): Promise<ProductsListResult> {
  const all = await loadProductsJson();
  const filtered = filterProductsLocal(all, params);
  const pageSize = params.pageSize ?? 9;
  const page = Math.max(1, params.page ?? 1);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, total, page, pageSize };
}

/**
 * Paginated product list for the catalog UI and for API-backed search.
 * Uses `GET {PUBLIC_API_URL}/products?...` when configured; otherwise filters local JSON.
 */
export async function loadProductsList(params: ProductsListParams): Promise<ProductsListResult> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      return await fetchProductsFromApi(params);
    } catch (e) {
      console.warn('[services] loadProductsList: API failed, using local JSON', e);
    }
  }
  return listProductsFromLocalJson(params);
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
