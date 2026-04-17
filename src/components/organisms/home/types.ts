/** Optional link chips shown on cards (e.g. categories, promos). */
export type Batch = {
  label: string;
  href?: string | null;
};

export type HeroSlideMedia =
  | {
      type: 'video';
      src: string;
      posterUrl?: string | null;
      muted?: boolean;
      loop?: boolean;
      playsInline?: boolean;
    }
  | {
      type: 'image';
      src: string;
    };

export type HeroBannerSlide = {
  id: string;
  media: HeroSlideMedia;
  /** Decorative / accessible description for the visual (video or image). */
  imageAlt: string;
  /** Native tooltip text (e.g. `title` on interactive regions). */
  hoverText?: string | null;
  overlay?: {
    gradient?: string;
    opacity?: number;
  };
  textPrimary: string;
  textSecondary?: string | null;
  href?: string | null;
  ctaLabel?: string | null;
};

export type GalleryGridItem = {
  id: string;
  /** Omit or leave empty for image-only tiles (still set `imageAlt` / `hoverText` as needed). */
  textPrimary?: string | null;
  textSecondary?: string | null;
  imageUrl?: string | null;
  /** Accessible description for the image (`alt`). */
  imageAlt: string;
  /** Native tooltip text (`title` where used). */
  hoverText?: string | null;
  href?: string | null;
  batches?: Batch[];
  span?: Partial<
    Record<
      'default' | 'sm' | 'md' | 'lg' | 'xl',
      { col: number; row: number }
    >
  >;
};

export type CatalogSliderItem = {
  id: string;
  /** Omit or leave empty for image-only cards (still set `imageAlt` / `hoverText` as needed). */
  textPrimary?: string | null;
  textSecondary?: string | null;
  imageUrl?: string | null;
  /** Accessible description for the image (`alt`). */
  imageAlt: string;
  /** Native tooltip text (`title` where used). */
  hoverText?: string | null;
  href?: string | null;
  batches?: Batch[];
};
