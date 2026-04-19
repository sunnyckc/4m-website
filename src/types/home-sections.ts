import type { GalleryGridItem, HeroBannerSlide } from '@/components/organisms/home/types';

/** Props subset for `HeroBannerSlider` (from JSON). */
export type HomeHeroSliderOptions = {
  autoplay?: boolean;
  autoplayDelayMs?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  heightClassName?: string;
  loop?: boolean;
};

/** Centered full-viewport hero (alternative to the slider). */
export type HomeHeroFullViewportJson = {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  /** CSS `background` value (gradient, etc.). */
  background?: string;
  className?: string;
  innerClassName?: string;
  minHeightClassName?: string;
  mediaSlotMinHeightClassName?: string;
  /** When false, the reserved media slot is omitted. */
  showMediaSlot?: boolean;
};

export type HomeHeroJson = {
  /** `slider` — carousel hero; `fullViewport` — centered full-height hero. */
  variant?: 'slider' | 'fullViewport';
  fullViewport?: HomeHeroFullViewportJson;
  slides: HeroBannerSlide[];
  options?: HomeHeroSliderOptions;
};

export type HomeGalleryLayoutJson = {
  gridClassName?: string;
  gapClassName?: string;
  className?: string;
};

export type HomeGallerySteamJson = {
  title: string;
  description?: string;
  items: GalleryGridItem[];
  layout?: HomeGalleryLayoutJson;
};

export type HomeCatalogHotCarouselJson = {
  itemsPerSlide: number;
  initialSlideIndex?: number;
  showArrows?: boolean;
  showDots?: boolean;
  slideGridClassName?: string;
};

export type HomeCatalogHotJson = {
  title: string;
  description?: string;
  carousel: HomeCatalogHotCarouselJson;
};
