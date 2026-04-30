'use client';

import * as React from 'react';

import { HeroOrbitBanner } from './hero-orbit-banner';
import { HeroKidzlabStyle } from './hero-kidzlab-style';
import { HeroFullViewport } from './hero-full-viewport';
import { HeroBannerSlider } from './hero-banner-slider';
import { HeroTunerPanel, type HeroTunerConfig } from './hero-tuner-panel';
import type { HomeHeroJson } from '@/types/home-sections';

export type HeroSectionProps = {
  config: HomeHeroJson;
  showTuner?: boolean;
};

export function HeroSection({ config, showTuner = false }: HeroSectionProps) {
  const variant = config.variant ?? 'slider';

  const [tunerConfig, setTunerConfig] = React.useState<HeroTunerConfig>({
    variant,
    kidzlabBanner: config.kidzlabBanner ? JSON.parse(JSON.stringify(config.kidzlabBanner)) : undefined,
    orbitBanner: config.orbitBanner ? JSON.parse(JSON.stringify(config.orbitBanner)) : undefined,
    fullViewport: config.fullViewport ? JSON.parse(JSON.stringify(config.fullViewport)) : undefined,
    slides: config.slides ? JSON.parse(JSON.stringify(config.slides)) : undefined,
    options: config.options ? JSON.parse(JSON.stringify(config.options)) : undefined,
  });

  React.useEffect(() => {
    setTunerConfig({
      variant,
      kidzlabBanner: config.kidzlabBanner ? JSON.parse(JSON.stringify(config.kidzlabBanner)) : undefined,
      orbitBanner: config.orbitBanner ? JSON.parse(JSON.stringify(config.orbitBanner)) : undefined,
      fullViewport: config.fullViewport ? JSON.parse(JSON.stringify(config.fullViewport)) : undefined,
      slides: config.slides ? JSON.parse(JSON.stringify(config.slides)) : undefined,
      options: config.options ? JSON.parse(JSON.stringify(config.options)) : undefined,
    });
  }, [config, variant]);

  const resetTuner = React.useCallback(() => {
    setTunerConfig({
      variant,
      kidzlabBanner: config.kidzlabBanner ? JSON.parse(JSON.stringify(config.kidzlabBanner)) : undefined,
      orbitBanner: config.orbitBanner ? JSON.parse(JSON.stringify(config.orbitBanner)) : undefined,
      fullViewport: config.fullViewport ? JSON.parse(JSON.stringify(config.fullViewport)) : undefined,
      slides: config.slides ? JSON.parse(JSON.stringify(config.slides)) : undefined,
      options: config.options ? JSON.parse(JSON.stringify(config.options)) : undefined,
    });
  }, [config, variant]);

  const kid = tunerConfig.kidzlabBanner;
  const orb = tunerConfig.orbitBanner;
  const fv = tunerConfig.fullViewport;

  return (
    <>
      {variant === 'orbitBanner' && orb ? (
        <HeroOrbitBanner config={orb} />
      ) : variant === 'kidzlabBanner' && kid ? (
        <HeroKidzlabStyle
          titleLine1={kid.titleLine1}
          titleLine2={kid.titleLine2}
          titleLine2RainbowGradient={kid.titleLine2RainbowGradient}
          subtitle={kid.subtitle}
          ctaText={kid.ctaText}
          ctaHref={kid.ctaHref}
          secondaryCtaText={kid.secondaryCtaText}
          secondaryCtaHref={kid.secondaryCtaHref}
          image={kid.image}
          imageAlt={kid.imageAlt}
          bgColor={kid.bgColor}
          texture={kid.texture}
          showMagma={kid.showMagma}
          magmaRightPx={kid.magmaRightPx}
          magmaBottomPx={kid.magmaBottomPx}
          imageWidthPx={kid.imageWidthPx}
          imageHeightPx={kid.imageHeightPx}
          imageRightPx={kid.imageRightPx}
          imageBottomPx={kid.imageBottomPx}
          logo={kid.logo}
          logoHeightPx={kid.logoHeightPx}
          floatingProducts={kid.floatingProducts}
          minHeightClassName={kid.minHeightClassName}
          showBottomWave={kid.showBottomWave}
          bottomWaveOpacity={kid.bottomWaveOpacity}
          bottomWaveHeightPx={kid.bottomWaveHeightPx}
          bottomWaveOffsetPx={kid.bottomWaveOffsetPx}
        />
      ) : variant === 'fullViewport' && fv ? (
        <HeroFullViewport
          title={fv.title}
          subtitle={fv.subtitle}
          ctaText={fv.ctaText}
          ctaHref={fv.ctaHref}
          background={fv.background}
          className={fv.className}
          innerClassName={fv.innerClassName}
          minHeightClassName={fv.minHeightClassName}
          mediaSlotMinHeightClassName={fv.mediaSlotMinHeightClassName}
          showMediaSlot={fv.showMediaSlot ?? true}
        />
      ) : (
        <HeroBannerSlider
          slides={tunerConfig.slides ?? config.slides}
          autoplay={tunerConfig.options?.autoplay ?? config.options?.autoplay ?? true}
          autoplayDelayMs={tunerConfig.options?.autoplayDelayMs ?? config.options?.autoplayDelayMs ?? 5000}
          showDots={tunerConfig.options?.showDots ?? config.options?.showDots ?? true}
          showArrows={tunerConfig.options?.showArrows ?? config.options?.showArrows ?? true}
          className={tunerConfig.options?.className ?? config.options?.className}
          heightClassName={tunerConfig.options?.heightClassName ?? config.options?.heightClassName}
          loop={tunerConfig.options?.loop ?? config.options?.loop ?? true}
        />
      )}

      {showTuner && (
        <HeroTunerPanel config={tunerConfig} setConfig={setTunerConfig} onReset={resetTuner} />
      )}
    </>
  );
}
