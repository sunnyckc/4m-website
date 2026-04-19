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

export type OrbitDirection = 'clockwise' | 'counterClockwise';
export type HeroTextSizeOption = 'sm' | 'md' | 'lg' | 'xl';
export type OrbitSpeedStyle = 'linear' | 'oscillating';

export type OrbitBannerItemJson = {
  image?: string;
  href?: string;
  /** Horizontal size of the orbiting asset (square box). */
  sizePx?: number;
  /** When true or when `image` is missing, show a gray placeholder block. */
  placeholder?: boolean;
};

export type OrbitBannerKidPlacement = {
  xPercent: number;
  yPercent: number;
  widthPx: number;
};

/** Landscape hero with kid figure and orbiting product thumbnails (JSON-driven). */
export type HomeHeroOrbitBannerJson = {
  title?: string;
  subtitle?: string;
  /** Preset heading size options (avoid raw Tailwind in JSON). */
  titleSize?: HeroTextSizeOption;
  /** Preset subtitle size options (avoid raw Tailwind in JSON). */
  subtitleSize?: HeroTextSizeOption;
  ctaText?: string;
  ctaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  background?: {
    image?: string;
    alt?: string;
    fallbackColor?: string;
    /** 0..1 white overlay on top of background image (higher = more dimmed). */
    overlayWhiteOpacity?: number;
  };
  kid: {
    image?: string;
    alt?: string;
    desktop: OrbitBannerKidPlacement;
    mobile?: OrbitBannerKidPlacement;
  };
  orbit: {
    radiusPx: number;
    direction?: OrbitDirection;
    speedSeconds: number;
    startAngleDeg?: number;
    /** Default orbit item box size if an item does not provide `sizePx`. */
    itemSizePx?: number;
    /** White rectangle behind orbit item thumbnails. */
    itemWhiteRect?: boolean;
    /** Keep products upright while orbiting. */
    keepItemsUpright?: boolean;
    /** Rotation speed style. */
    speedStyle?: OrbitSpeedStyle;
  };
  items: OrbitBannerItemJson[];
  className?: string;
  /** Tailwind min-height classes; default is full viewport (`min-h-[100dvh]`). */
  minHeightClassName?: string;
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
  /** `slider` — carousel hero; `fullViewport` — centered full-height hero; `orbitBanner` — landscape orbit hero. */
  variant?: 'slider' | 'fullViewport' | 'orbitBanner';
  fullViewport?: HomeHeroFullViewportJson;
  orbitBanner?: HomeHeroOrbitBannerJson;
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
