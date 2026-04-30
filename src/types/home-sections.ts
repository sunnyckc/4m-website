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

/** Orbit ring geometry for one viewport (px). Unset fields inherit from the next larger breakpoint. */
export type OrbitBannerOrbitLayout = {
  radiusPx?: number;
  centerOffsetXPx?: number;
  centerOffsetYPx?: number;
  /** Default item box size when an item omits `sizePx`. */
  itemSizePx?: number;
  /** Circle accent diameter in `circleAccent` mode. */
  itemCircleSizePx?: number;
};

/** Logo + title + subtitle + CTAs column: vertical nudge in px (negative = up, positive = down). */
export type OrbitBannerTitleBlockPlacement = {
  offsetYPx?: number;
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
  /**
   * Vertical offset for the main copy column (logo, titles, CTAs). Per breakpoint; omitted values inherit from the next larger size.
   */
  titleBlock?: {
    large?: OrbitBannerTitleBlockPlacement;
    medium?: OrbitBannerTitleBlockPlacement;
    mobile?: OrbitBannerTitleBlockPlacement;
  };
  background?: {
    image?: string;
    alt?: string;
    fallbackColor?: string;
    /** 0..1 white overlay on top of background image (higher = more dimmed). */
    overlayWhiteOpacity?: number;
    /** Multiple background variants to switch between in the tuner panel. */
    variants?: string[];
    /** Index into `variants` for the active background (defaults to 0). */
    variantIndex?: number;
  };
  kid: {
    image?: string;
    alt?: string;
    /** Largest screens (1024px+). */
    large?: OrbitBannerKidPlacement;
    /** Tablet / medium (768px–1023px). */
    medium?: OrbitBannerKidPlacement;
    /** Narrow screens (under 768px). */
    mobile?: OrbitBannerKidPlacement;
    /**
     * @deprecated Use `large`. Still read when `large` is omitted (migration).
     */
    desktop?: OrbitBannerKidPlacement;
    /** Multiple kid image variants to switch between in the tuner panel. */
    variants?: string[];
    /** Index into `variants` for the active kid image (defaults to 0). */
    variantIndex?: number;
  };
  orbit: {
    /** @deprecated Prefer `orbit.large` / per-breakpoint layout; still seeds `large` when used. */
    radiusPx?: number;
    /** Orbit center offset from anchor point in px (positive right/down). */
    centerOffsetXPx?: number;
    centerOffsetYPx?: number;
    direction?: OrbitDirection;
    speedSeconds?: number;
    startAngleDeg?: number;
    /** Default orbit item box size if an item does not provide `sizePx`. Seeds `large` layout. */
    itemSizePx?: number;
    /** Global display mode applied to all orbit items. */
    itemDisplayMode?: OrbitItemDisplayMode;
    /** Global circle accent size (px) in `circleAccent` mode. Seeds `large` layout. */
    itemCircleSizePx?: number;
    /** Orbit layout on large screens (1024px+). */
    large?: OrbitBannerOrbitLayout;
    medium?: OrbitBannerOrbitLayout;
    mobile?: OrbitBannerOrbitLayout;
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

/** Hero variant duplicating the KidzLab visual: gradient → texture → active object image → text + CTAs. */
export type HomeHeroKidzlabBannerJson = {
  titleLine1: string;
  titleLine2?: string;
  titleLine2RainbowGradient?: boolean;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  /** Active object image path (absolute under `/public` or resolved URL). */
  image: string;
  imageAlt?: string;
  /** Background gradient class (defaults to KidzLab blue). */
  bgColor?: string;
  /** Texture overlay image path (defaults to kidzlabs-texture.png). */
  texture?: string;
  /** Show the MagmaParticles canvas overlay. */
  showMagma?: boolean;
  /** Magma source X as percentage (0–100). */
  magmaX?: number;
  /** Magma source Y as percentage (0–100). */
  magmaY?: number;
  imageWidthPx?: number;
  imageHeightPx?: number;
  imageRightPct?: number;
  imageBottomPct?: number;
  /** Logo image path. */
  logo?: string;
  /** Logo height in px. */
  logoHeightPx?: number;
  className?: string;
  minHeightClassName?: string;
};

export type HomeHeroJson = {
  /** `slider` — carousel hero; `fullViewport` — centered full-height hero; `orbitBanner` — landscape orbit hero; `kidzlabBanner` — KidzLab-style hero. */
  variant?: 'slider' | 'fullViewport' | 'orbitBanner' | 'kidzlabBanner';
  fullViewport?: HomeHeroFullViewportJson;
  orbitBanner?: HomeHeroOrbitBannerJson;
  kidzlabBanner?: HomeHeroKidzlabBannerJson;
  slides: HeroBannerSlide[];
  options?: HomeHeroSliderOptions;
  /** Toggle product hover icons and display mode on the Explore by Product Family section. */
  productFamilyIcons?: {
    enabled?: boolean;
    displayMode?: 'default' | 'fullBleed';
  };
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

/** One partner / retailer / brand mark for the home “As seen on” ribbon. */
export type HomeSocialProofItemJson = {
  id?: string;
  /** Display name (alt text and fallback if `logo` is missing). */
  name: string;
  /** Public URL to a PNG/SVG logo under `/public`. */
  logo?: string;
  /** Optional link when the mark is clickable. */
  href?: string;
  /** Slightly larger mark (e.g. featured partners in the center). */
  emphasis?: boolean;
};

export type HomeSocialProofJson = {
  title: string;
  subtitle?: string;
  items: HomeSocialProofItemJson[];
  /** Optional section root class (Tailwind). */
  className?: string;
};

/** One image tile for the home “Latest news” gallery (links to internal or external URL). */
export type HomeNewsGalleryItemJson = {
  id?: string;
  /** Path under `/public` (e.g. `/images/...`) or absolute `http(s)` URL. Omit for gradient placeholder. */
  image?: string;
  /** Destination when the tile is clicked (resolved with site base for internal paths). */
  href: string;
  headline: string;
  /** Shown in overlay when `showOverlay` is true (any display string, e.g. `April 2026`). */
  date?: string;
  /**
   * When false, the tile is image (or placeholder) only. Default true — bottom gradient + date/headline.
   */
  showOverlay?: boolean;
  /** Accessible name; defaults to `headline`. */
  imageAlt?: string;
};

export type HomeNewsGalleryJson = {
  title?: string;
  subtitle?: string;
  items: HomeNewsGalleryItemJson[];
  /** Optional section root class (Tailwind). */
  className?: string;
  /** Optional grid classes (default: 2 cols narrow, 3 cols from `sm`). */
  gridClassName?: string;
};
