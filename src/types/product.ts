export interface ProductMedia {
  type: 'video' | 'image' | 'award';
  sequence: number;
  thumbnail: boolean;
  hidden: boolean;
  media_source: 'file' | 'url' | 'vimeo' | 'wistia' | 'youtube';
  media_destination: string;
}

export interface ProductSpecification {
  field: string;
  display_name: string;
  value: string;
}

export interface MultiLanguage {
  language: string;
  media_source: 'file' | 'url' | 'vimeo' | 'wistia' | 'youtube';
  media_destination: string;
}

export interface Product {
  item_code: string;
  item_name: string;
  item_description: string;
  folder_name: string;
  category_main: string;
  category_sub: string;
  tag_visible: string[];
  tag_hidden: string[];
  media: ProductMedia[];
  specifications: ProductSpecification[];
  award_text: string[];
  hot_item: boolean;
  multi_language: MultiLanguage[];
  related_product: string[];
  /**
   * New API field names (kept alongside legacy keys while the UI migrates).
   */
  top_item?: boolean;
  gallery?: ProductGalleryItem[];
  translations?: ProductTranslation[];
  related_products?: ProductRelatedProduct[];
  thumbnail?: ProductThumbnail | null;
}

export interface ProductGalleryItem {
  id?: string;
  type: string;
  sequence: number;
  isThumbnail?: boolean;
  url?: string;
  objectKey?: string;
  signedUrl?: string;
  signedExpiresIn?: number;
  media_id?: string;
}

export interface ProductTranslation {
  id?: string;
  language: string;
  isHidden?: boolean;
  sequence?: number;
  url?: string;
  signedUrl?: string;
  signedExpiresIn?: number;
}

export interface ProductRelatedProduct {
  id: string | null;
  item_code: string;
  linked: boolean;
}

export interface ProductThumbnail {
  signedUrl?: string;
  signedExpiresIn?: number;
  objectKey?: string;
}
