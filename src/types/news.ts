/** News article shape — same for live API and local JSON. */
export interface NewsArticle {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  content: string;
  category: string;
  featured: boolean;
}
