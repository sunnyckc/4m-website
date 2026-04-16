/**
 * Transport layer: HTTP when `PUBLIC_API_URL` is set, else bundled `public/data/*.json`.
 * Domain types: `@/types`. Pages should use `@/repositories` (or `@/config` / `@/types`), not services directly.
 */

export { apiGetJson, ApiError } from './http';
export {
  getAllProducts,
  loadProductsList,
  type ProductSort,
  type ProductsListParams,
  type ProductsListResult,
} from './products';
export { loadNewsArticles, loadNewsArticleById } from './news';
export { loadAwards } from './awards';
