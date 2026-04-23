/**
 * On hover, warms the product detail experience by:
 * 1. `link[rel=prefetch]` for the product HTML (SSR + browser cache)
 * 2. Optional `fetch` to `GET /api/v1/products/:key` to warm the same JSON the backend uses for that page
 *
 * Deduplicated; short hover delay; cancelled if pointer leaves before the delay.
 */

const HOVER_MS = 100;
const donePages = new Set<string>();
const pendingTimer = new Map<HTMLAnchorElement, ReturnType<typeof setTimeout>>();

function getBrowserApiBase(): string {
  const raw = import.meta.env.PUBLIC_API_URL;
  if (raw && String(raw).trim()) return String(raw).replace(/\/$/, '');
  return '';
}

function parseProductRouteKey(anchor: HTMLAnchorElement): { pageUrl: string; routeKey: string } | null {
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
  return { pageUrl: url.href.split('#')[0], routeKey: decodeURIComponent(key) };
}

function injectPrefetchLink(absolutePageUrl: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = absolutePageUrl;
  link.as = 'document';
  document.head.appendChild(link);
}

function warmApi(routeKey: string) {
  const base = getBrowserApiBase();
  if (!base) return;
  const path = `/api/v1/products/${encodeURIComponent(routeKey)}`;
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const init: RequestInit & { priority?: 'low' } = {
    method: 'GET',
    headers: { Accept: 'application/json' },
    priority: 'low',
  };
  void fetch(url, init).catch(() => {
    // Ignore failed prefetch (auth, CORS, offline)
  });
}

function startHover(anchor: HTMLAnchorElement) {
  const parsed = parseProductRouteKey(anchor);
  if (!parsed) return;
  if (donePages.has(parsed.pageUrl)) return;

  const existing = pendingTimer.get(anchor);
  if (existing) clearTimeout(existing);

  const t = setTimeout(() => {
    pendingTimer.delete(anchor);
    if (donePages.has(parsed.pageUrl)) return;
    donePages.add(parsed.pageUrl);
    injectPrefetchLink(parsed.pageUrl);
    warmApi(parsed.routeKey);
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
