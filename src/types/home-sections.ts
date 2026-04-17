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

export type HomeHeroJson = {
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
