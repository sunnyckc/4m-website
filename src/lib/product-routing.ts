import type { Product } from '@/types';

type ProductRouteLike = Pick<Product, 'id' | 'item_code' | 'folder_name'>;

export function getProductRouteKey(product: ProductRouteLike): string {
  return product.item_code || product.folder_name || product.id || '';
}

export function getProductHref(product: ProductRouteLike, base = ''): string {
  const routeKey = getProductRouteKey(product);
  return `${base}/products/${encodeURIComponent(routeKey)}`;
}
