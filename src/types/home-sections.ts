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
export type OrbitItemDisplayMode = 'transparent' | 'rectangle' | 'circleAccent';

export type OrbitBannerItemJson = {
  image?: string;
  href?: string;
  /** Visual style for this item card. */
  displayMode?: OrbitItemDisplayMode;
  /** Optional hex background color for rectangle style (e.g. `#ffffff`). */
  backgroundColorHex?: string;
  /** Optional hex color for circle accent style (e.g. `#22d3ee`). */
  circleColorHex?: string;
  /** Circle accent size in px (centered behind PNG). */
  circleSizePx?: number;
  /** Horizontal size of the orbiting asset (square box). */
  sizePx?: number;
  /** When true or when `image` is missing, show a gray placeholder block. */
  placeholder?: boolean;
};

export type OrbitBannerKidPlacement = {
  xPercent?: number;
  yPercent?: number;
  widthPx?: number;
};

/** Landscape hero with kid figure and orbiting product thumbnails (JSON-driven). */
export type HomeHeroOrbitBannerJson = {
  title?: string;
  /**
   * Optional two-line title: line 1 stacks below orbiting items (`z-index` lower than orbit);
   * line 2 stacks above orbit with the rest of the copy. When both are set, they replace `title`.
   */
  titleLine1?: string;
  titleLine2?: string;
  /** When true (split title only), paints line 2 with a multi-stop rainbow gradient fill. */
  titleLine2RainbowGradient?: boolean;
  subtitle?: string;
  /** Main logo height shown above title (in px). */
  logoHeightPx?: number;
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
    radiusPx?: number;
    /** Orbit center offset from anchor point in px (positive right/down). */
    centerOffsetXPx?: number;
    centerOffsetYPx?: number;
    direction?: OrbitDirection;
    speedSeconds?: number;
    startAngleDeg?: number;
    /** Default orbit item box size if an item does not provide `sizePx`. */
    itemSizePx?: number;
    /** Global display mode applied to all orbit items. */
    itemDisplayMode?: OrbitItemDisplayMode;
    /** Global circle accent size (px) applied to all items in `circleAccent` mode. */
    itemCircleSizePx?: number;
    /** White rectangle behind orbit item thumbnails. */
    itemWhiteRect?: boolean;
    /** Keep products upright while orbiting. */
    keepItemsUpright?: boolean;
    /** Rotation speed style. */
    speedStyle?: OrbitSpeedStyle;
    /** Oscillation depth (percent). Higher value means stronger fast/slow contrast. */
    oscillationHeight?: number;
    /** Number of oscillation waves per full revolution. */
    oscillationFrequency?: number;
    /** Apply random static tilt to each orbit item. */
    randomizeItemTilt?: boolean;
    /** Minimum absolute tilt angle in degrees for random item tilt. */
    itemTiltMinDeg?: number;
    /** Maximum absolute tilt angle in degrees for random item tilt. */
    itemTiltMaxDeg?: number;
    /** Seed value used to reshuffle deterministic random tilts. */
    itemTiltSeed?: number;
    /** Debug marker to visualize the exact orbit center. */
    showCenterPoint?: boolean;
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
