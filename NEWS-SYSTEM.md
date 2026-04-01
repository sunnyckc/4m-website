# 4M News System Documentation

## Overview
The news system has been implemented to match the 4M Industrial Development Limited website structure, featuring a news listing page and individual news detail pages.

## Features
- ✅ News listing page (`/news`) with featured articles
- ✅ Individual news detail pages (`/news/[id]`)
- ✅ Related articles section
- ✅ Social sharing buttons
- ✅ Responsive design with mobile support
- ✅ Category badges and featured article highlighting
- ✅ SEO-optimized with proper meta tags
- ✅ Breadcrumb navigation

## File Structure
```
src/
├── components/news/
│   └── NewsCard.astro          # Reusable news card component
├── data/
│   └── news.ts                 # News helper functions and types
├── pages/news/
│   ├── index.astro             # News listing page
│   └── [id].astro              # Individual news detail page
└── styles/
    └── global.css              # Updated with news-specific styles

public/
├── data/
│   └── news.json               # News articles data
└── images/news/
    ├── if-design-award-2018.jpg
    ├── maglev-train-2017.jpg
    ├── hkai-2016.jpg
    ├── kidzlabs-2015.jpg
    ├── red-dot-2015.jpg
    └── default-news.jpg
```

## News Data Structure
Each news article follows this structure:
```typescript
interface NewsArticle {
  id: string;           // Unique identifier for URL routing
  title: string;        // Article title
  date: string;         // Publication date (YYYY.MM.DD format)
  excerpt: string;      // Short description for listing page
  image?: string;       // Optional featured image path
  content: string;      // Full article content (supports markdown-style headings)
  category: string;     // Article category (Awards, Product Launch, etc.)
  featured: boolean;    // Whether to highlight as featured article
}
```

## Sample Articles Included
Based on the actual 4M website content:

1. **Winner of iF Design Award 2018** (Featured)
   - Category: Awards
   - Date: 2018.04.24
   - About Green Science series winning prestigious design award

2. **4M Maglev Train Wins Best New S.T.E.M Toy** (Featured)
   - Category: Product Launch
   - Date: 2017.02.28
   - About Maglev Train Model winning at Toy Fair 2017

3. **4M Wins Triple Honours at HKAI 2016**
   - Category: Awards
   - Date: 2017.02.08
   - About AR Wonder: Dinosaur DNA winning three categories

4. **KidzLabs Series Consumer Product Design Award 2015**
   - Category: Awards
   - Date: 2015.12.14
   - About KidzLabs series recognition

5. **Red Dot Design Award 2015**
   - Category: Awards
   - Date: 2015.09.10
   - About Green Science series winning Red Dot Award

## Helper Functions Available
- `getAllNews()` - Get all articles sorted by date
- `getNewsById(id)` - Get specific article by ID
- `getFeaturedNews()` - Get only featured articles
- `getNewsByCategory(category)` - Filter by category
- `getRelatedNews(currentId, category, limit)` - Get related articles
- `formatDate(dateString)` - Format date for display
- `formatContent(content)` - Convert content to HTML
- `getNewsCategories()` - Get all unique categories

## Styling Features
- Responsive grid layout
- Hover animations and transitions
- Featured article highlighting
- Category badges with color coding
- Social sharing buttons
- Mobile-friendly navigation
- Consistent typography using Fredoka and Comic Neue fonts

## URLs
- News listing: `http://localhost:4324/news`
- Individual articles: `http://localhost:4324/news/[article-id]`

## Adding New Articles
1. Add new article object to `/public/data/news.json`
2. Add corresponding image to `/public/images/news/`
3. The system will automatically generate routes and display the new article

## Development Server
The system is currently running at `http://localhost:4324/` with hot reload enabled.