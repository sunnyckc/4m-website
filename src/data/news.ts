// News data helper functions
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

// Load news data
export async function getAllNews(): Promise<NewsArticle[]> {
  try {
    const response = await fetch(new URL('/data/news.json', import.meta.env.SITE || 'http://localhost:4324'));
    const news: NewsArticle[] = await response.json();
    return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading news data:', error);
    return [];
  }
}

// Get a single news article by ID
export async function getNewsById(id: string): Promise<NewsArticle | null> {
  const allNews = await getAllNews();
  return allNews.find(article => article.id === id) || null;
}

// Get featured news articles
export async function getFeaturedNews(): Promise<NewsArticle[]> {
  const allNews = await getAllNews();
  return allNews.filter(article => article.featured);
}

// Get news by category
export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  const allNews = await getAllNews();
  return allNews.filter(article => article.category.toLowerCase() === category.toLowerCase());
}

// Get related news articles (same category, excluding current)
export async function getRelatedNews(currentId: string, category: string, limit: number = 3): Promise<NewsArticle[]> {
  const categoryNews = await getNewsByCategory(category);
  return categoryNews
    .filter(article => article.id !== currentId)
    .slice(0, limit);
}

// Format date for display
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString.replace(/\./g, '/'));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString; // Return original if parsing fails
  }
}

// Format content with proper HTML
export function formatContent(content: string): string {
  return content
    .split('\n\n')
    .map(paragraph => {
      if (paragraph.startsWith('## ')) {
        return `<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4 font-fredoka">${paragraph.replace('## ', '')}</h2>`;
      }
      return `<p class="mb-6 leading-relaxed text-gray-700">${paragraph}</p>`;
    })
    .join('');
}

// Get all unique categories
export async function getNewsCategories(): Promise<string[]> {
  const allNews = await getAllNews();
  const categories = [...new Set(allNews.map(article => article.category))];
  return categories.sort();
}