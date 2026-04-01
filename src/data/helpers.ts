// Data loading helpers

export interface Product {
  id: string;
  product_code: string; // 4M-style product codes like "00-03267"
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  tags: string[];
  images: {
    main: string;
    gallery: string[];
  };
  specifications: Record<string, string | string[] | undefined>;
  awards?: string[]; // Product awards and certifications
  featured: boolean;
  hot_item: boolean; // Mark products as hot/trending items
  created_at: string;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  icon: string;
  year: number;
  organization: string;
  sequence: number;
  featured: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  featured: boolean;
}

export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: "default" | "outline";
}

export interface CollageItem {
  id: string;
  title?: string;
  image?: string;
  backgroundColor?: string;
  textColor?: string;
  href?: string;
}

export interface SteamCollageData {
  mainItem: CollageItem;
  smallItems: CollageItem[];
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  subcategories: ProductSubcategory[];
}

export interface ProductSubcategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductCategoriesData {
  categories: ProductCategory[];
}

export interface ContactInfo {
  company: {
    name: string;
    tagline: string;
  };
  contact: {
    email: {
      primary: string;
      display: string;
    };
    phone: {
      primary: string;
      display: string;
      international: string;
    };
    address: {
      line1: string;
      line2: string;
      city: string;
      country: string;
      full: string;
    };
  };
  businessHours: {
    timezone: string;
    schedule: {
      [key: string]: {
        open?: string;
        close?: string;
        display: string;
        closed?: boolean;
      };
    };
    note: string;
  };
  social: {
    website: string;
    linkedin: string;
    facebook: string;
    twitter: string;
  };
  support: {
    customerService: {
      email: string;
      phone: string;
    };
    technicalSupport: {
      email: string;
      note: string;
    };
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    // Import the JSON data directly for Astro SSR
    const productsModule = await import('../../public/data/products.json');
    return productsModule.default || [];
  } catch (error) {
    console.error('Error loading products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(product => product.id === id) || null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.featured);
}

export async function getHotProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(product => product.hot_item);
}

export async function getAwards(): Promise<Award[]> {
  try {
    const awardsModule = await import('../../public/data/awards.json');
    const awards = awardsModule.default || [];
    return awards.sort((a: Award, b: Award) => a.sequence - b.sequence);
  } catch (error) {
    console.error('Error loading awards:', error);
    return [];
  }
}

export async function getFeaturedAwards(): Promise<Award[]> {
  const awards = await getAwards();
  return awards.filter(award => award.featured);
}

export async function getNews(): Promise<NewsPost[]> {
  try {
    const newsModule = await import('../../public/data/news.json');
    const news = newsModule.default || [];
    return news.sort((a: NewsPost, b: NewsPost) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error loading news:', error);
    return [];
  }
}

export async function getNewsPostBySlug(slug: string): Promise<NewsPost | null> {
  const news = await getNews();
  return news.find(post => post.slug === slug) || null;
}

export async function getFeaturedNews(): Promise<NewsPost[]> {
  const news = await getNews();
  return news.filter(post => post.featured);
}

export function getUniqueCategories(products: Product[]): string[] {
  const categories = products.map(product => product.category);
  return [...new Set(categories)].sort();
}

export function getUniqueSubcategories(products: Product[], category?: string): string[] {
  let filteredProducts = products;
  if (category) {
    filteredProducts = products.filter(product => product.category === category);
  }
  const subcategories = filteredProducts.map(product => product.subcategory);
  return [...new Set(subcategories)].sort();
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const heroModule = await import('../../public/data/hero-slides.json');
    return heroModule.default || [];
  } catch (error) {
    console.error('Error loading hero slides:', error);
    return [];
  }
}

export async function getSteamCollageData(): Promise<SteamCollageData> {
  try {
    const steamModule = await import('../../public/data/steam-collage.json');
    return steamModule.default || {
      mainItem: {
        id: 'main-fallback',
        title: 'STEAM Education',
        backgroundColor: 'bg-gradient-to-br from-indigo-600 to-purple-700'
      },
      smallItems: []
    };
  } catch (error) {
    console.error('Error loading STEAM collage data:', error);
    return {
      mainItem: {
        id: 'main-fallback',
        title: 'STEAM Education',
        backgroundColor: 'bg-gradient-to-br from-indigo-600 to-purple-700'
      },
      smallItems: []
    };
  }
}

export async function getProductCategories(): Promise<ProductCategoriesData> {
  try {
    // Import the JSON data directly for Astro SSR
    const categoriesModule = await import('../../public/data/product-categories.json');
    return categoriesModule.default || { categories: [] };
  } catch (error) {
    console.error('Error loading product categories:', error);
    return { categories: [] };
  }
}

export async function getCategoryById(categoryId: string): Promise<ProductCategory | null> {
  const categoriesData = await getProductCategories();
  return categoriesData.categories.find(cat => cat.id === categoryId) || null;
}

export async function getSubcategoryById(categoryId: string, subcategoryId: string): Promise<ProductSubcategory | null> {
  const category = await getCategoryById(categoryId);
  if (!category) return null;
  return category.subcategories.find(sub => sub.id === subcategoryId) || null;
}

export function searchProducts(products: Product[], searchTerm: string): Product[] {
  if (!searchTerm.trim()) return products;
  
  const term = searchTerm.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(term) ||
    product.product_code.toLowerCase().includes(term) ||
    product.description.toLowerCase().includes(term) ||
    product.tags.some(tag => tag.toLowerCase().includes(term))
  );
}

export async function getContactInfo(): Promise<ContactInfo> {
  try {
    const contactModule = await import('../../public/data/contact.json');
    return contactModule.default;
  } catch (error) {
    console.error('Error loading contact info:', error);
    // Return fallback contact info
    return {
      company: {
        name: "4M Industrial Development Limited",
        tagline: "For Minds - Helping children develop creativity and imagination since 1993"
      },
      contact: {
        email: {
          primary: "infodesk@4m-ind.com",
          display: "infodesk@4m-ind.com"
        },
        phone: {
          primary: "+85235898200",
          display: "+852 3589 8200",
          international: "+852 3589 8200"
        },
        address: {
          line1: "Unit 3129, 31/F, Sun Hung Kai Centre",
          line2: "30 Harbour Road, Wan Chai, Hong Kong",
          city: "Hong Kong",
          country: "Hong Kong",
          full: "Unit 3129, 31/F, Sun Hung Kai Centre, 30 Harbour Road, Wan Chai, Hong Kong"
        }
      },
      businessHours: {
        timezone: "HKT",
        schedule: {
          monday: { open: "09:00", close: "18:00", display: "9:00 AM - 6:00 PM" },
          tuesday: { open: "09:00", close: "18:00", display: "9:00 AM - 6:00 PM" },
          wednesday: { open: "09:00", close: "18:00", display: "9:00 AM - 6:00 PM" },
          thursday: { open: "09:00", close: "18:00", display: "9:00 AM - 6:00 PM" },
          friday: { open: "09:00", close: "18:00", display: "9:00 AM - 6:00 PM" },
          saturday: { open: "10:00", close: "16:00", display: "10:00 AM - 4:00 PM" },
          sunday: { closed: true, display: "Closed" }
        },
        note: "All times are in Hong Kong Time (HKT)"
      },
      social: {
        website: "https://www.4m-ind.com",
        linkedin: "",
        facebook: "",
        twitter: ""
      },
      support: {
        customerService: {
          email: "infodesk@4m-ind.com",
          phone: "+852 3589 8200"
        },
        technicalSupport: {
          email: "infodesk@4m-ind.com",
          note: "For technical support, please contact our customer service"
        }
      }
    };
  }
}