/**
 * On hover, warms the product detail experience by:
 * 1. `link[rel=prefetch]` for the product HTML (SSR + browser cache)
 * 2. `fetch` to `GET /api/v1/products/:id` — then, from the JSON, preloads **gallery and thumbnail** image
 *    URLs in the background so the next navigation can hit the HTTP cache for those assets
 *
 * Deduplicated; short hover delay; cancelled if pointer leaves before the delay.
 */

const HOVER_MS = 100;
const donePages = new Set<string>();
const pendingTimer = new Map<HTMLAnchorElement, ReturnType<typeof setTimeout>>();

/** Dev server, or add `?productPrefetchLog=1` / `localStorage.setItem('debugProductPrefetch', '1')` then refresh. */
function isPrefetchDebug(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  try {
    if (new URLSearchParams(window.location.search).get('productPrefetchLog') === '1') return true;
    if (window.localStorage.getItem('debugProductPrefetch') === '1') return true;
  } catch {
    return false;
  }
  return false;
}

function prefetchLog(...args: unknown[]) {
  if (isPrefetchDebug()) console.log('[product-prefetch]', ...args);
}

function getBrowserApiBase(): string {
  const raw = import.meta.env.PUBLIC_API_URL;
  if (raw && String(raw).trim()) return String(raw).replace(/\/$/, '');
  return '';
}

function parseProductLink(anchor: HTMLAnchorElement): { pageUrl: string; routeKey: string; productId: string | null } | null {
  let url: URL;
  try {
    url = new URL(anchor.href, window.location.origin);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const [first, key, ...rest] = parts;
  if (first !== 'products' || !key || rest.length > 0) return null;
  if (key === 'index' || key === '') return null;
  const productId = anchor.dataset.productId?.trim() || null;
  return { pageUrl: url.href.split('#')[0], routeKey: decodeURIComponent(key), productId };
}

function injectPrefetchLink(absolutePageUrl: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = absolutePageUrl;
  link.as = 'document';
  document.head.appendChild(link);
  prefetchLog('link rel=prefetch →', absolutePageUrl);
}

/** Same shape as `unwrapData` in services/products. */
function unwrapApiPayload(data: unknown): Record<string, unknown> | null {
  if (data == null || typeof data !== 'object') return null;
  const w = data as { data?: unknown };
  if ('data' in w && w.data != null && typeof w.data === 'object') {
    return w.data as Record<string, unknown>;
  }
  return data as Record<string, unknown>;
}

const VIDEO_HOST = /vimeo\.com|youtube\.com|youtu\.be|wistia|cloudinary.*\/video\//i;

function galleryItemToImageUrl(item: Record<string, unknown>): string | null {
  const type = String(item.type ?? '').toLowerCase();
  const href = String(item.signedUrl ?? item.url ?? '').trim();
  if (!href || !/^https?:\/\//i.test(href)) return null;
  if (type.includes('video') && VIDEO_HOST.test(href)) return null;
  if (type.includes('video') && !/\.(png|jpe?g|webp|gif)(\?|$)/i.test(href)) return null;
  return href;
}

/** Lower `sequence` = prefetched first (higher visual priority in the gallery). */
function resolveGallerySequence(
  item: Record<string, unknown>,
  indexInGallery: number,
): number {
  const n = Number(item.sequence);
  if (Number.isFinite(n)) return n;
  // Stable fallback when the API omits `sequence` (keeps list order, after explicit sequences).
  return 1_000_000 + indexInGallery;
}

function collectProductImageUrls(payload: Record<string, unknown>): string[] {
  type SeqHref = { sequence: number; href: string };
  const work: SeqHref[] = [];

  const gallery = payload.gallery;
  if (Array.isArray(gallery)) {
    gallery.forEach((row, indexInGallery) => {
      if (row == null || typeof row !== 'object') return;
      const rec = row as Record<string, unknown>;
      const href = galleryItemToImageUrl(rec);
      if (!href) return;
      work.push({ sequence: resolveGallerySequence(rec, indexInGallery), href });
    });
  }

  work.sort((a, b) => a.sequence - b.sequence);

  const out: string[] = [];
  const seen = new Set<string>();
  for (const { href } of work) {
    if (seen.has(href)) continue;
    seen.add(href);
    out.push(href);
  }

  const thumb = payload.thumbnail;
  if (thumb && typeof thumb === 'object') {
    const t = thumb as Record<string, unknown>;
    const h = String(t.signedUrl ?? t.url ?? '').trim();
    if (h && /^https?:\/\//i.test(h) && !seen.has(h)) {
      seen.add(h);
      out.push(h);
    }
  }

  return out;
}

const MAX_IMAGES_PER_PRODUCT = 16;
const preloadedImageUrls = new Set<string>();

/** Warm browser image cache (decode + cache); CORS is not required for `<img>` / Image(). */
function preloadImageUrlsInBackground(urls: string[]) {
  const slice = urls.slice(0, MAX_IMAGES_PER_PRODUCT);
  let started = 0;
  for (const href of slice) {
    if (preloadedImageUrls.has(href)) continue;
    preloadedImageUrls.add(href);
    const img = new Image();
    img.decoding = 'async';
    (img as HTMLImageElement & { fetchPriority?: 'high' | 'low' | 'auto' }).fetchPriority = 'low';
    img.src = href;
    started += 1;
    prefetchLog('image preload start', started, href.slice(0, 80) + (href.length > 80 ? '…' : ''));
  }
  if (slice.length > 0) prefetchLog('image preload: new downloads this run', started, 'of', slice.length, 'candidates (others may be session-deduped)');
}

async function warmApi(productId: string) {
  const base = getBrowserApiBase();
  if (!base) {
    prefetchLog('skip API: PUBLIC_API_URL is empty (image preload needs JSON from API)');
    return;
  }
  const path = `/api/v1/products/${encodeURIComponent(productId)}`;
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  prefetchLog('fetch JSON', url);
  const init: RequestInit & { priority?: 'low' } = {
    method: 'GET',
    headers: { Accept: 'application/json' },
    priority: 'low',
  };
  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      prefetchLog('API response not ok', res.status, productId);
      return;
    }
    const raw: unknown = await res.json();
    const data = unwrapApiPayload(raw);
    if (data) {
      const imageUrls = collectProductImageUrls(data);
      prefetchLog('JSON ok; gallery/thumbnail image URLs to warm', imageUrls.length, productId);
      if (imageUrls.length > 0) preloadImageUrlsInBackground(imageUrls);
    } else {
      prefetchLog('JSON parse: no product payload (unexpected shape)', productId);
    }
  } catch (e) {
    prefetchLog('API fetch failed (CORS, offline, etc.)', productId, e);
  }
}

function startHover(anchor: HTMLAnchorElement) {
  const parsed = parseProductLink(anchor);
  if (!parsed) return;
  if (donePages.has(parsed.pageUrl)) return;

  const existing = pendingTimer.get(anchor);
  if (existing) clearTimeout(existing);

  const t = setTimeout(() => {
    pendingTimer.delete(anchor);
    if (donePages.has(parsed.pageUrl)) return;
    donePages.add(parsed.pageUrl);
    prefetchLog('hover → run (after ' + HOVER_MS + 'ms):', parsed.routeKey);
    injectPrefetchLink(parsed.pageUrl);
    if (parsed.productId) warmApi(parsed.productId);
  }, HOVER_MS);
  pendingTimer.set(anchor, t);
}

function endHover(anchor: HTMLAnchorElement) {
  const t = pendingTimer.get(anchor);
  if (t) {
    clearTimeout(t);
    pendingTimer.delete(anchor);
  }
}

let started = false;

export function initProductLinkPrefetch(): void {
  if (started) return;
  if (typeof document === 'undefined') return;
  started = true;

  document.addEventListener(
    'pointerenter',
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const anchor = t.closest('a[href*="/products/"]');
      if (anchor == null || !(anchor instanceof HTMLAnchorElement)) return;
      startHover(anchor);
    },
    true,
  );

  document.addEventListener(
    'pointerleave',
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const anchor = t.closest('a[href*="/products/"]');
      if (anchor == null || !(anchor instanceof HTMLAnchorElement)) return;
      endHover(anchor);
    },
    true,
  );
}
