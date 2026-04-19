import * as React from 'react';

import { getBase } from '@/config';
import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import type {
  HeroTextSizeOption,
  HomeHeroOrbitBannerJson,
  OrbitBannerItemJson,
  OrbitDirection,
  OrbitItemDisplayMode,
  OrbitSpeedStyle,
} from '@/types/home-sections';

import { resolveKidPlacements, resolveOrbitLayouts, resolveTitleBlockOffsets } from './hero-orbit-layout';
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

/** JSON-toggleable rainbow fill for title line 2 (`background-clip: text`). */
const TITLE_LINE2_RAINBOW_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, #e11d48, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6, #d946ef, #e11d48)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  /** Room for descenders (g, y, p); clip-text otherwise tends to crop them. */
  display: 'inline-block',
  lineHeight: 1.22,
  paddingBottom: '0.18em',
  WebkitBoxDecorationBreak: 'clone',
  boxDecorationBreak: 'clone',
};

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

function hashToUnit(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function getItemTiltDeg(config: HomeHeroOrbitBannerJson, item: OrbitBannerItemJson, index: number): number {
  const orbit = config.orbit;
  if (orbit.randomizeItemTilt !== true) return 0;

  const min = Math.abs(orbit.itemTiltMinDeg ?? 5);
  const max = Math.max(min, Math.abs(orbit.itemTiltMaxDeg ?? 15));
  const seed = orbit.itemTiltSeed ?? 1;

  const base = `${seed}|${index}|${item.image ?? ''}|${item.href ?? ''}`;
  const uMagnitude = hashToUnit(`m:${base}`);
  const uSign = hashToUnit(`s:${base}`);

  const magnitude = min + (max - min) * uMagnitude;
  const sign = uSign >= 0.5 ? 1 : -1;
  return sign * magnitude;
}

function getItemDisplayMode(
  globalMode: OrbitItemDisplayMode | undefined,
  item: OrbitBannerItemJson,
  fallbackMode: OrbitItemDisplayMode,
): OrbitItemDisplayMode {
  if (globalMode === 'transparent' || globalMode === 'rectangle' || globalMode === 'circleAccent') {
    return globalMode;
  }
  const mode = item.displayMode;
  if (mode === 'transparent' || mode === 'rectangle' || mode === 'circleAccent') return mode;
  return fallbackMode;
}

function OrbitItemNode({
  item,
  sizePx,
  responsiveOrbitSizing,
  counterClass,
  counterStyle,
  tiltDeg,
  globalDisplayMode,
  globalCircleSizePx,
  fallbackMode,
}: {
  item: OrbitBannerItemJson;
  sizePx: number;
  /** When true, item box / circle accent size follow `--hero-orbit-item-size` / `--hero-orbit-item-circle`. */
  responsiveOrbitSizing?: boolean;
  counterClass?: string;
  counterStyle?: React.CSSProperties;
  tiltDeg?: number;
  globalDisplayMode?: OrbitItemDisplayMode;
  globalCircleSizePx?: number;
  fallbackMode?: OrbitItemDisplayMode;
}) {
  const showPlaceholder = itemShowsPlaceholder(item);
  const href = item.href?.trim();
  const safeFallbackMode = fallbackMode ?? 'rectangle';
  const mode = getItemDisplayMode(globalDisplayMode, item, safeFallbackMode);
  const backgroundColorHex = item.backgroundColorHex?.trim();
  const circleColorHex = item.circleColorHex?.trim();
  const rectangleBg = backgroundColorHex != null && backgroundColorHex !== '' ? backgroundColorHex : undefined;
  const circleBg =
    circleColorHex != null && circleColorHex !== ''
      ? circleColorHex
      : backgroundColorHex != null && backgroundColorHex !== ''
        ? backgroundColorHex
        : '#ffffff';
  const circleSize = Math.max(4, globalCircleSizePx ?? item.circleSizePx ?? Math.round(sizePx * 0.62));
  const inner = (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg transition-transform hover:scale-105',
        responsiveOrbitSizing === true && 'hero-orbit-item-box-size',
        mode === 'rectangle'
          ? 'border border-white/40 bg-white/90 shadow-md ring-1 ring-black/5'
          : 'border border-transparent bg-transparent shadow-none',
      )}
      style={{
        ...(responsiveOrbitSizing === true ? {} : { width: sizePx, height: sizePx }),
        backgroundColor: mode === 'rectangle' ? rectangleBg : undefined,
      }}
    >
      {mode === 'circleAccent' ? (
        <span
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{
            width: responsiveOrbitSizing === true ? 'var(--hero-orbit-item-circle)' : circleSize,
            height: responsiveOrbitSizing === true ? 'var(--hero-orbit-item-circle)' : circleSize,
            backgroundColor: circleBg,
            opacity: 0.95,
          }}
          aria-hidden
        />
      ) : null}
      {showPlaceholder ? (
        <span className="relative z-[1] block h-full w-full bg-muted" aria-hidden />
      ) : (
        <img
          src={item.image}
          alt=""
          className="relative z-[1] h-full w-full object-contain p-1"
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
    <div className={cn('pointer-events-auto origin-center', counterClass)} style={counterStyle}>
      <div
        className="origin-center"
        style={tiltDeg != null && tiltDeg !== 0 ? { transform: `rotate(${tiltDeg}deg)` } : undefined}
      >
        {wrapped}
      </div>
    </div>
  );
}

export function HeroOrbitBannerView({ config }: { config: HomeHeroOrbitBannerJson }) {
  const base = getBase();
  const {
    title,
    titleLine1,
    titleLine2,
    titleLine2RainbowGradient,
    subtitle,
    logoHeightPx,
    titleSize,
    subtitleSize,
    ctaText,
    ctaHref,
    secondaryCtaText,
    secondaryCtaHref,
    titleBlock,
    background,
    kid,
    orbit,
    items,
    className,
    minHeightClassName = 'min-h-[100dvh]',
  } = config;

  const kidPl = resolveKidPlacements(kid);
  const orbitLayouts = resolveOrbitLayouts(orbit);
  const titleOffsets = resolveTitleBlockOffsets(titleBlock);

  const direction = orbit.direction ?? 'clockwise';
  const speedStyle = orbit.speedStyle ?? 'linear';
  const keepItemsUpright = orbit.keepItemsUpright ?? true;
  const fallbackDisplayMode: OrbitItemDisplayMode =
    orbit.itemWhiteRect != null ? (orbit.itemWhiteRect ? 'rectangle' : 'transparent') : 'rectangle';
  const globalItemDisplayMode = orbit.itemDisplayMode;
  const globalItemCircleSizePx = orbit.itemCircleSizePx;
  const showCenterPoint = orbit.showCenterPoint ?? true;
  const useRuntimeOscillation = speedStyle === 'oscillating';
  const ringSpinClass = getSpinClass(direction, speedStyle);
  const itemCounterClass = keepItemsUpright ? getCounterClass(direction, speedStyle) : undefined;
  const ringRef = React.useRef<HTMLDivElement | null>(null);

  const startAngle = orbit.startAngleDeg ?? -90;
  const n = Math.max(1, items.length);
  const defaultItemSizePx = orbit.itemSizePx ?? 72;
  const backgroundOverlayWhiteOpacity = clamp(0, background?.overlayWhiteOpacity ?? 0, 1);

  const sectionStyle = {
    '--hero-orbit-duration': `${orbit.speedSeconds ?? 40}s`,
    '--hero-orbit-kid-x-mobile': `${kidPl.mobile.xPercent}%`,
    '--hero-orbit-kid-y-mobile': `${kidPl.mobile.yPercent}%`,
    '--hero-orbit-kid-w-mobile': `${kidPl.mobile.widthPx}px`,
    '--hero-orbit-kid-x-medium': `${kidPl.medium.xPercent}%`,
    '--hero-orbit-kid-y-medium': `${kidPl.medium.yPercent}%`,
    '--hero-orbit-kid-w-medium': `${kidPl.medium.widthPx}px`,
    '--hero-orbit-kid-x-large': `${kidPl.large.xPercent}%`,
    '--hero-orbit-kid-y-large': `${kidPl.large.yPercent}%`,
    '--hero-orbit-kid-w-large': `${kidPl.large.widthPx}px`,
    '--hero-orbit-radius-mobile': `${orbitLayouts.mobile.radiusPx}px`,
    '--hero-orbit-cx-mobile': `${orbitLayouts.mobile.centerOffsetXPx}px`,
    '--hero-orbit-cy-mobile': `${orbitLayouts.mobile.centerOffsetYPx}px`,
    '--hero-orbit-item-size-mobile': `${orbitLayouts.mobile.itemSizePx}px`,
    '--hero-orbit-item-circle-mobile': `${orbitLayouts.mobile.itemCircleSizePx}px`,
    '--hero-orbit-radius-medium': `${orbitLayouts.medium.radiusPx}px`,
    '--hero-orbit-cx-medium': `${orbitLayouts.medium.centerOffsetXPx}px`,
    '--hero-orbit-cy-medium': `${orbitLayouts.medium.centerOffsetYPx}px`,
    '--hero-orbit-item-size-medium': `${orbitLayouts.medium.itemSizePx}px`,
    '--hero-orbit-item-circle-medium': `${orbitLayouts.medium.itemCircleSizePx}px`,
    '--hero-orbit-radius-large': `${orbitLayouts.large.radiusPx}px`,
    '--hero-orbit-cx-large': `${orbitLayouts.large.centerOffsetXPx}px`,
    '--hero-orbit-cy-large': `${orbitLayouts.large.centerOffsetYPx}px`,
    '--hero-orbit-item-size-large': `${orbitLayouts.large.itemSizePx}px`,
    '--hero-orbit-item-circle-large': `${orbitLayouts.large.itemCircleSizePx}px`,
    '--hero-title-offset-y-mobile': `${titleOffsets.mobile}px`,
    '--hero-title-offset-y-medium': `${titleOffsets.medium}px`,
    '--hero-title-offset-y-large': `${titleOffsets.large}px`,
  } as React.CSSProperties;

  const fallbackBg = background?.fallbackColor ?? '#e5e7eb';
  const bgImage = background?.image?.trim();
  const kidSrc = kid.image?.trim();
  const showKidPlaceholder = kidSrc == null || kidSrc === '';
  const logoHeight = Math.max(20, logoHeightPx ?? 56);
  const trimmedTitleLine1 = titleLine1?.trim() ?? '';
  const trimmedTitleLine2 = titleLine2?.trim() ?? '';
  const useSplitTitle = trimmedTitleLine1 !== '' && trimmedTitleLine2 !== '';

  React.useEffect(() => {
    const ringEl = ringRef.current;
    if (ringEl == null) return;

    if (!useRuntimeOscillation) {
      ringEl.style.removeProperty('--hero-orbit-angle');
      return;
    }

    const T = Math.max(1, orbit.speedSeconds ?? 40);
    const directionSign = direction === 'clockwise' ? 1 : -1;
    /** 0..~0.95 — speed multiplier is `1 + amp*sin(...)`, stays forward (never reverses). */
    const amp = clamp(0, (orbit.oscillationHeight ?? 45) / 100, 0.95);
    const frequency = Math.max(0.25, orbit.oscillationFrequency ?? 2);
    const startTs = performance.now();
    let prevNow = startTs;
    /** Unbounded accumulated angle — avoids modulo snap (esp. non-integer `frequency`). */
    let angleAccumDeg = 0;
    let rafId = 0;

    const tick = (now: number) => {
      const dtSec = Math.min(0.1, Math.max(0, (now - prevNow) / 1000));
      prevNow = now;
      const tSec = (now - startTs) / 1000;
      // `frequency` waves per average revolution: same period scale as `T`.
      const mult = 1 + amp * Math.sin((2 * Math.PI * frequency * tSec) / T);
      const omegaDegPerSec = (360 / T) * mult;
      angleAccumDeg += directionSign * omegaDegPerSec * dtSec;
      ringEl.style.setProperty('--hero-orbit-angle', `${angleAccumDeg}deg`);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    useRuntimeOscillation,
    direction,
    orbit.speedSeconds,
    orbit.oscillationHeight,
    orbit.oscillationFrequency,
  ]);

  return (
    <section
      className={cn(
        /* Clip orbit + kid (absolute) so nothing paints outside the hero box */
        'hero-orbit-section relative mb-0 flex min-h-0 w-full flex-col overflow-hidden',
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

      {/*
        No z-index on this wrapper so children can stack vs. orbit (z-3): line 1 uses z-[2], rest z-[4].
      */}
      <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col justify-center px-4 py-10 pb-12 sm:px-6 lg:px-8 md:py-12 md:pb-14">
        <div className="hero-orbit-title-block flex w-full max-w-full flex-col justify-center gap-4 pb-1 md:max-w-[60%]">
          <img
            src={`${base}/images/assets/logo.png`}
            alt="4M Industrial Development Limited"
            className="relative z-[4] h-auto w-auto max-w-none self-start object-contain"
            style={{ height: `${logoHeight}px`, width: 'auto' }}
            loading="eager"
            decoding="async"
          />
          {useSplitTitle ? (
            <h1
              className={cn(
                'font-bold tracking-tight text-fun leading-[1.2] md:leading-[1.25]',
                getTitleClass(titleSize),
              )}
            >
              <span className="relative z-[2] block pb-[0.02em]">{trimmedTitleLine1}</span>
              <span
                className={cn(
                  'relative z-[4] block',
                  titleLine2RainbowGradient !== true && 'pb-[0.12em]',
                )}
                style={titleLine2RainbowGradient === true ? TITLE_LINE2_RAINBOW_STYLE : undefined}
              >
                {trimmedTitleLine2}
              </span>
            </h1>
          ) : title != null && title !== '' ? (
            <h1
              className={cn(
                'relative z-[4] font-bold tracking-tight text-fun',
                getTitleClass(titleSize),
              )}
            >
              {title}
            </h1>
          ) : null}
          {subtitle ? (
            <p
              className={cn(
                'relative z-[4] text-muted-foreground text-comic',
                getSubtitleClass(subtitleSize),
              )}
            >
              {subtitle}
            </p>
          ) : null}
          {(ctaText != null && ctaText !== '' && ctaHref != null && ctaHref !== '') ||
          (secondaryCtaText != null &&
            secondaryCtaText !== '' &&
            secondaryCtaHref != null &&
            secondaryCtaHref !== '') ? (
            <div className="relative z-[4] flex flex-wrap gap-3 pt-2">
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
                  className="font-fredoka btn-bouncy rounded-xl px-8 text-base shadow-md"
                >
                  <a href={secondaryCtaHref}>{secondaryCtaText}</a>
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hero-orbit-anchor">
        <div className="relative h-0 w-0">
          {items.length > 0 ? (
            <div className="hero-orbit-translate pointer-events-none absolute left-0 top-0 z-0">
              {showCenterPoint ? (
                <div className="absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                  <span className="block h-3 w-3 rounded-full border border-red-700 bg-red-500/90 shadow-[0_0_0_6px_rgba(239,68,68,0.2)]" />
                </div>
              ) : null}
              {/* Single orbit track: all items revolve around one center point. */}
              <div className="hero-orbit-ring-size relative -translate-x-1/2 -translate-y-1/2">
                <div
                  ref={ringRef}
                  className={cn(
                    'absolute inset-0 origin-center',
                    !useRuntimeOscillation && ringSpinClass,
                  )}
                  style={
                    useRuntimeOscillation
                      ? { transform: 'rotate(var(--hero-orbit-angle, 0deg))' }
                      : undefined
                  }
                >
                  {items.map((item, i) => {
                    const angle = startAngle + (360 / n) * i;
                    const overrideSizePx = item.sizePx ?? 0;
                    const sizePx = overrideSizePx > 0 ? overrideSizePx : defaultItemSizePx;
                    const tiltDeg = getItemTiltDeg(config, item, i);
                    return (
                      <div
                        key={i}
                        className="hero-orbit-item-pos absolute left-1/2 top-1/2 origin-center will-change-transform"
                        style={{ '--hero-item-angle': `${angle}deg` } as React.CSSProperties}
                      >
                        <div className="-translate-x-1/2 -translate-y-1/2">
                          <OrbitItemNode
                            item={item}
                            sizePx={sizePx}
                            responsiveOrbitSizing={overrideSizePx <= 0}
                            counterClass={useRuntimeOscillation ? undefined : itemCounterClass}
                            counterStyle={
                              useRuntimeOscillation && keepItemsUpright
                                ? { transform: 'rotate(calc(-1 * var(--hero-orbit-angle, 0deg)))' }
                                : undefined
                            }
                            tiltDeg={tiltDeg}
                            globalDisplayMode={globalItemDisplayMode}
                            globalCircleSizePx={
                              overrideSizePx <= 0 ? undefined : globalItemCircleSizePx
                            }
                            fallbackMode={fallbackDisplayMode}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {showKidPlaceholder ? (
            <div
              className="absolute bottom-0 right-0 z-10 w-[var(--hero-orbit-kid-w-mobile)] max-w-none rounded-lg bg-muted md:w-[var(--hero-orbit-kid-w-medium)] lg:w-[var(--hero-orbit-kid-w-large)]"
              style={{ aspectRatio: '3 / 4' }}
              aria-hidden
            />
          ) : (
            <img
              src={kidSrc}
              alt={kid.alt ?? ''}
              className="absolute bottom-0 right-0 z-10 h-auto w-[var(--hero-orbit-kid-w-mobile)] max-w-none object-contain object-bottom md:w-[var(--hero-orbit-kid-w-medium)] lg:w-[var(--hero-orbit-kid-w-large)]"
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
