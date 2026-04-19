import * as React from 'react';

import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import type {
  HeroTextSizeOption,
  HomeHeroOrbitBannerJson,
  OrbitBannerItemJson,
  OrbitDirection,
  OrbitSpeedStyle,
} from '@/types/home-sections';

import { HeroOrbitTunerPanel } from './hero-orbit-tuner-panel';

export type HeroOrbitBannerProps = {
  config: HomeHeroOrbitBannerJson;
  /**
   * When true, shows the orbit tuning panel (intended for `import.meta.env.DEV` from the page).
   * In production, add `?orbitTuner=1` to the URL to open the same panel.
   */
  showTuner?: boolean;
};

function cloneOrbitConfig(c: HomeHeroOrbitBannerJson): HomeHeroOrbitBannerJson {
  return structuredClone(c);
}

function itemShowsPlaceholder(item: OrbitBannerItemJson): boolean {
  if (item.placeholder === true) return true;
  const src = item.image?.trim();
  return src == null || src === '';
}

function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getTitleClass(size: HeroTextSizeOption | undefined): string {
  const safe = size ?? 'md';
  const classes: Record<HeroTextSizeOption, string> = {
    sm: 'text-2xl md:text-3xl lg:text-4xl',
    md: 'text-3xl md:text-4xl lg:text-5xl',
    lg: 'text-4xl md:text-5xl lg:text-6xl',
    xl: 'text-5xl md:text-6xl lg:text-7xl',
  };
  return classes[safe];
}

function getSubtitleClass(size: HeroTextSizeOption | undefined): string {
  const safe = size ?? 'md';
  const classes: Record<HeroTextSizeOption, string> = {
    sm: 'text-sm md:text-base',
    md: 'text-base md:text-lg',
    lg: 'text-lg md:text-xl',
    xl: 'text-xl md:text-2xl',
  };
  return classes[safe];
}

function getSpinClass(direction: OrbitDirection, speedStyle: OrbitSpeedStyle): string {
  if (speedStyle === 'oscillating') {
    return direction === 'clockwise'
      ? 'animate-hero-orbit-spin-cw-osc'
      : 'animate-hero-orbit-spin-ccw-osc';
  }
  return direction === 'clockwise' ? 'animate-hero-orbit-spin-cw' : 'animate-hero-orbit-spin-ccw';
}

function getCounterClass(direction: OrbitDirection, speedStyle: OrbitSpeedStyle): string {
  if (speedStyle === 'oscillating') {
    return direction === 'clockwise'
      ? 'animate-hero-orbit-counter-cw-osc'
      : 'animate-hero-orbit-counter-ccw-osc';
  }
  return direction === 'clockwise'
    ? 'animate-hero-orbit-counter-cw'
    : 'animate-hero-orbit-counter-ccw';
}

function OrbitItemNode({
  item,
  sizePx,
  counterClass,
  showWhiteRect,
}: {
  item: OrbitBannerItemJson;
  sizePx: number;
  counterClass?: string;
  showWhiteRect: boolean;
}) {
  const showPlaceholder = itemShowsPlaceholder(item);
  const href = item.href?.trim();
  const inner = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-lg transition-transform hover:scale-105',
        showWhiteRect
          ? 'border border-white/40 bg-white/90 shadow-md ring-1 ring-black/5'
          : 'border border-transparent bg-transparent shadow-none',
      )}
      style={{ width: sizePx, height: sizePx }}
    >
      {showPlaceholder ? (
        <span className="block h-full w-full bg-muted" aria-hidden />
      ) : (
        <img
          src={item.image}
          alt=""
          className="h-full w-full object-contain p-1"
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  );

  const wrapped =
    href != null && href !== '' ? (
      <a href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {inner}
      </a>
    ) : (
      inner
    );

  return (
    <div className="pointer-events-auto origin-center">
      <div className={cn('origin-center', counterClass)}>{wrapped}</div>
    </div>
  );
}

export function HeroOrbitBannerView({ config }: { config: HomeHeroOrbitBannerJson }) {
  const {
    title,
    subtitle,
    titleSize,
    subtitleSize,
    ctaText,
    ctaHref,
    secondaryCtaText,
    secondaryCtaHref,
    background,
    kid,
    orbit,
    items,
    className,
    minHeightClassName = 'min-h-[100dvh]',
  } = config;

  const mobilePlacement = kid.mobile ?? kid.desktop;
  const direction = orbit.direction ?? 'clockwise';
  const speedStyle = orbit.speedStyle ?? 'linear';
  const keepItemsUpright = orbit.keepItemsUpright ?? true;
  const showWhiteRect = orbit.itemWhiteRect ?? true;
  const ringSpinClass = getSpinClass(direction, speedStyle);
  const itemCounterClass = keepItemsUpright ? getCounterClass(direction, speedStyle) : undefined;

  const startAngle = orbit.startAngleDeg ?? -90;
  const n = Math.max(1, items.length);
  const radius = orbit.radiusPx;
  const defaultItemSizePx = orbit.itemSizePx ?? 72;
  const backgroundOverlayWhiteOpacity = clamp(0, background?.overlayWhiteOpacity ?? 0, 1);

  const sectionStyle = {
    '--hero-orbit-duration': `${orbit.speedSeconds}s`,
    '--hero-orbit-kid-x-mobile': `${mobilePlacement.xPercent}%`,
    '--hero-orbit-kid-y-mobile': `${mobilePlacement.yPercent}%`,
    '--hero-orbit-kid-x-desktop': `${kid.desktop.xPercent}%`,
    '--hero-orbit-kid-y-desktop': `${kid.desktop.yPercent}%`,
    '--hero-orbit-kid-w-mobile': `${mobilePlacement.widthPx}px`,
    '--hero-orbit-kid-w-desktop': `${kid.desktop.widthPx}px`,
  } as React.CSSProperties;

  const fallbackBg = background?.fallbackColor ?? '#e5e7eb';
  const bgImage = background?.image?.trim();
  const kidSrc = kid.image?.trim();
  const showKidPlaceholder = kidSrc == null || kidSrc === '';

  return (
    <section
      className={cn(
        'relative flex min-h-0 w-full flex-col overflow-hidden',
        minHeightClassName,
        className,
      )}
      style={sectionStyle}
    >
      {bgImage ? (
        <img
          src={bgImage}
          alt={background?.alt ?? ''}
          className="absolute inset-0 z-0 h-full w-full object-cover object-center"
          loading="eager"
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor: fallbackBg }}
          aria-hidden
        />
      )}
      {backgroundOverlayWhiteOpacity > 0 ? (
        <div
          className="absolute inset-0 z-[1] bg-white"
          style={{ opacity: backgroundOverlayWhiteOpacity }}
          aria-hidden
        />
      ) : null}
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/85 via-background/40 to-transparent md:from-background/80 md:via-background/25" />

      <div className="relative z-[3] mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col justify-center px-4 py-10 sm:px-6 lg:px-8 md:py-12">
        <div className="flex max-w-xl flex-col justify-center gap-4 md:max-w-lg">
          {title ? (
            <h1 className={cn('font-bold tracking-tight text-fun', getTitleClass(titleSize))}>
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p className={cn('text-muted-foreground text-comic', getSubtitleClass(subtitleSize))}>
              {subtitle}
            </p>
          ) : null}
          {(ctaText != null && ctaText !== '' && ctaHref != null && ctaHref !== '') ||
          (secondaryCtaText != null &&
            secondaryCtaText !== '' &&
            secondaryCtaHref != null &&
            secondaryCtaHref !== '') ? (
            <div className="flex flex-wrap gap-3 pt-2">
              {ctaText != null && ctaText !== '' && ctaHref != null && ctaHref !== '' ? (
                <Button
                  asChild
                  size="lg"
                  className="font-fredoka btn-bouncy rounded-xl px-8 text-base"
                >
                  <a href={ctaHref}>{ctaText}</a>
                </Button>
              ) : null}
              {secondaryCtaText != null &&
              secondaryCtaText !== '' &&
              secondaryCtaHref != null &&
              secondaryCtaHref !== '' ? (
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="font-fredoka rounded-xl border-white/80 bg-white/80 px-8 text-base text-foreground hover:bg-white"
                >
                  <a href={secondaryCtaHref}>{secondaryCtaText}</a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hero-orbit-anchor">
        <div className="relative flex flex-col items-center">
          {items.length > 0 ? (
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: (radius + 96) * 2,
                height: (radius + 96) * 2,
              }}
            >
              <div
                className={cn(
                  'absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2',
                  ringSpinClass,
                )}
              >
                {items.map((item, i) => {
                  const angle = startAngle + (360 / n) * i;
                  const sizePx = item.sizePx ?? defaultItemSizePx;
                  return (
                    <div
                      key={i}
                      className="absolute left-0 top-0 origin-center will-change-transform"
                      style={{
                        transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                      }}
                    >
                      <OrbitItemNode
                        item={item}
                        sizePx={sizePx}
                        counterClass={itemCounterClass}
                        showWhiteRect={showWhiteRect}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {showKidPlaceholder ? (
            <div
              className="relative z-10 w-[var(--hero-orbit-kid-w-mobile)] max-w-[90vw] rounded-lg bg-muted md:w-[var(--hero-orbit-kid-w-desktop)]"
              style={{ aspectRatio: '3 / 4' }}
              aria-hidden
            />
          ) : (
            <img
              src={kidSrc}
              alt={kid.alt ?? ''}
              className="relative z-10 h-auto max-h-[min(85dvh,920px)] w-[var(--hero-orbit-kid-w-mobile)] max-w-[min(90vw,var(--hero-orbit-kid-w-mobile))] object-contain object-bottom md:w-[var(--hero-orbit-kid-w-desktop)]"
              loading="eager"
              decoding="async"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function HeroOrbitBanner({ config, showTuner = false }: HeroOrbitBannerProps) {
  const [queryTuner, setQueryTuner] = React.useState(false);
  const baselineRef = React.useRef(config);
  const [draft, setDraft] = React.useState(() => cloneOrbitConfig(config));

  React.useEffect(() => {
    baselineRef.current = config;
    setDraft(cloneOrbitConfig(config));
  }, [config]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setQueryTuner(new URLSearchParams(window.location.search).get('orbitTuner') === '1');
  }, []);

  const tunerEnabled = showTuner || queryTuner;

  const resetToSaved = React.useCallback(() => {
    setDraft(cloneOrbitConfig(baselineRef.current));
  }, []);

  return (
    <>
      <HeroOrbitBannerView config={draft} />
      {tunerEnabled ? (
        <HeroOrbitTunerPanel draft={draft} setDraft={setDraft} onReset={resetToSaved} />
      ) : null}
    </>
  );
}
