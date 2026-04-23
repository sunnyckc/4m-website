# My Store - Astro Website

A modern, responsive e-commerce website built with Astro, Tailwind CSS, and shadcn/ui components.

## Features

- 🚀 **Astro** - Fast modern web framework
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 📱 **Responsive Design** - Mobile-first approach
- 🔍 **Product Search & Filtering** - Advanced product discovery
- 📰 **News/Blog System** - Dynamic content management
- 🏆 **Awards Showcase** - Company achievements display
- ⚡ **Alpine.js** - Lightweight JavaScript framework for interactivity

## Project Structure

```
my-store/
│
├── public/                      # Static files (copied as-is to dist)
│   ├── images/
│   │   ├── assets/              # General assets (logo, icons, etc.)
│   │   ├── products/            # Product images
│   │   └── awards/              # Award icons/images
│   │
│   └── data/
│       ├── products.json        # Products data
│       ├── awards.json          # Awards data
│       └── news.json            # Blog/news posts
│
├── src/
│   ├── pages/                   # Each file = a route
│   │   ├── index.astro          # Homepage (/)
│   │   ├── about.astro          # About page (/about)
│   │   ├── contact.astro        # Contact page (/contact)
│   │   ├── awards.astro         # Awards page (/awards)
│   │   ├── news/                # Blog section
│   │   └── products/            # Products section
│   │
│   ├── components/              # Reusable UI components
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── layout/              # Layout components
│   │   ├── products/            # Product-specific components
│   │   ├── awards/              # Award components
│   │   └── news/                # News components
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro     # HTML skeleton
│   │
│   ├── styles/
│   │   └── global.css           # Global styles with CSS variables
│   │
│   ├── lib/
│   │   └── utils.ts             # Utility functions
│   │
│   └── data/
│       └── helpers.ts           # Data loading helpers
│
├── astro.config.mjs             # Astro configuration
├── tailwind.config.js           # Tailwind CSS config
├── components.json              # shadcn/ui configuration
└── package.json                 # Dependencies and scripts
```

## Requirements

- **Node.js**: v18.14.1 or higher
- **npm**: recent version recommended

## Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd my-store
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

   Optional alias:
   ```bash
   npm run build:server
   ```

5. **Preview the production build**
   ```bash
   npm run preview
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:server` - Alias for production server build
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands

## Key Features Implementation

### Product Search & Filtering
- Real-time search across product names, categories, and tags
- Category filtering dropdown
- Stock status filtering
- Responsive grid layout with product cards

### Data Management
- JSON-based data storage for easy content management
- TypeScript interfaces for type safety
- Helper functions for data fetching and filtering
- Support for product images, specifications, and metadata

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation with mobile menu
- Optimized layouts for all screen sizes
- Touch-friendly interactive elements

### Component Architecture
- Reusable shadcn/ui components
- Modular layout system
- Type-safe component props
- Consistent design system

## Customization

### Adding Products
Edit `public/data/products.json` to add new products. Each product should include:
- Unique ID
- Name, description, and price
- Category and subcategory
- Image paths
- Specifications
- Stock status

### Adding Awards
Edit `public/data/awards.json` to add company awards with:
- Award details and description
- Icon/image path
- Organization and year
- Display sequence

### Adding News Posts
Edit `public/data/news.json` to add blog posts with:
- Title, slug, and content
- Author and publication date
- Category and tags
- Featured image

### Styling
- Modify `src/styles/global.css` for global styles
- Update `tailwind.config.js` for theme customization
- CSS variables in global.css for easy color scheme changes

## Deployment

This project is configured for **server deployment** (Node adapter):

- Uses API routes/proxy under `src/pages/api/**`
- Uses dynamic routes that are not fully pre-rendered
- Build with `npm run build` (or `npm run build:server`) and run with `npm run start`

Environment knobs:

- `BASE_PATH=/` (or `/your-subpath` for subpath hosting)
- `SITE_URL=https://your-domain.example`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.