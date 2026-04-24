/** Site base path for links and asset URLs. */
export function getBase(): string {
  try {
    const base = import.meta.env.BASE_URL || '/';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  } catch {
    return '';
  }
}

const FALSEY = new Set(['false', '0', 'no', 'off']);

/**
 * When false, the product detail page does not show the share / social block.
 * Set `PUBLIC_PRODUCT_DETAIL_SOCIAL=false` (or `0`, `no`, `off`) to hide.
 * Default: shown when unset.
 */
export function isProductDetailSocialEnabled(): boolean {
  try {
    const raw = import.meta.env.PUBLIC_PRODUCT_DETAIL_SOCIAL;
    if (raw === undefined || raw === '') return true;
    return !FALSEY.has(String(raw).toLowerCase().trim());
  } catch {
    return true;
  }
}
