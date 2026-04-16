import type { Product } from '@/types/product';
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
 * Tries `GET {API}/products?all=true` then falls back to local JSON.
 *
 * Backend may return a JSON array or `{ items: Product[] }`.
 */
export async function getAllProducts(): Promise<Product[]> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      const data = await apiGetJson<unknown>('/products?all=true');
      if (Array.isArray(data)) return data as Product[];
      const obj = data as { items?: Product[]; products?: Product[] };
      const items = obj.items ?? obj.products;
      if (Array.isArray(items)) return items;
    } catch (e) {
      console.warn('[services] getAllProducts: API failed, using local JSON', e);
    }
  }
  return loadProductsJson();
}

function normalizeListResponse(data: unknown, fallback: ProductsListParams): ProductsListResult {
  if (Array.isArray(data)) {
    const pageSize = fallback.pageSize ?? 9;
    return {
      items: data,
      total: data.length,
      page: fallback.page ?? 1,
      pageSize,
    };
  }
  const obj = data as Record<string, unknown>;
  const items = (obj.items ?? obj.products ?? obj.data ?? []) as Product[];
  return {
    items,
    total: Number(obj.total ?? items.length ?? 0),
    page: Number(obj.page ?? fallback.page ?? 1),
    pageSize: Number(obj.pageSize ?? obj.perPage ?? fallback.pageSize ?? 9),
  };
}

async function fetchProductsFromApi(params: ProductsListParams): Promise<ProductsListResult> {
  const qs = new URLSearchParams();
  const q = params.q?.trim();
  if (q) qs.set('q', q);
  if (params.category) qs.set('category', params.category);
  if (params.subcategory) qs.set('subcategory', params.subcategory);
  if (params.sort) qs.set('sort', params.sort);
  qs.set('page', String(params.page ?? 1));
  qs.set('pageSize', String(params.pageSize ?? 9));
  const path = `/products${qs.toString() ? `?${qs}` : ''}`;
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
      matchesCategory = product.hot_item;
    } else {
      matchesCategory = product.category_main === cat;
    }

    const matchesSub = !sub || product.category_sub === sub;
    return matchesCategory && matchesSub;
  });

  const sort = params.sort ?? '';
  list = [...list].sort((a, b) => {
    if (a.hot_item && !b.hot_item) return -1;
    if (!a.hot_item && b.hot_item) return 1;
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
