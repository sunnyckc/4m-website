export interface HeroSlide {
  id: string;
  image: string;
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  ctaVariant?: 'default' | 'outline';
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

export interface ProductSubcategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  subcategories: ProductSubcategory[];
}

export interface ProductCategoriesData {
  categories: ProductCategory[];
}

export interface CatalogButton {
  label: string;
  url: string;
}

export interface SiteLinks {
  catalog_buttons: CatalogButton[];
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
