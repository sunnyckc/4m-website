import type { NewsArticle } from '@/types/news';
import { getPublicApiBaseUrl } from '@/config/api';
import { apiGetJson } from '@/services/http';

async function loadNewsJson(): Promise<NewsArticle[]> {
  const mod = await import('@public/data/news.json');
  const news = (mod.default || []) as NewsArticle[];
  return [...news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Full news list from `GET {API}/news` or `public/data/news.json`.
 */
export async function loadNewsArticles(): Promise<NewsArticle[]> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      const data = await apiGetJson<unknown>('/news');
      if (Array.isArray(data)) return data as NewsArticle[];
      const obj = data as { items?: NewsArticle[]; news?: NewsArticle[] };
      return (obj.items ?? obj.news ?? []) as NewsArticle[];
    } catch (e) {
      console.warn('[services] loadNewsArticles: API failed, using local JSON', e);
    }
  }
  return loadNewsJson();
}

/**
 * Single article from `GET {API}/news/:id` or local JSON.
 */
export async function loadNewsArticleById(id: string): Promise<NewsArticle | null> {
  const base = getPublicApiBaseUrl();
  if (base) {
    try {
      const article = await apiGetJson<NewsArticle>(`/news/${encodeURIComponent(id)}`);
      if (article && article.id) return article;
    } catch (e) {
      console.warn('[services] loadNewsArticleById: API failed, using local JSON', e);
    }
  }
  const all = await loadNewsJson();
  return all.find((a) => a.id === id) ?? null;
}
