'use client';

import { getBase } from '@/config';
import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import { MagmaParticles } from './magma-particles';

const TITLE_LINE2_RAINBOW_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(90deg, #e11d48, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6, #d946ef, #e11d48)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  display: 'inline-block',
  lineHeight: 1.22,
  paddingBottom: '0.18em',
  WebkitBoxDecorationBreak: 'clone',
  boxDecorationBreak: 'clone',
};

export interface HeroKidzlabStyleProps {
  titleLine1: string;
  titleLine2?: string;
  titleLine2RainbowGradient?: boolean;
  subtitle?: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  image: string;
  imageAlt?: string;
  bgColor?: string;
  texture?: string;
  showMagma?: boolean;
  magmaX?: number;
  magmaY?: number;
  imageWidthPx?: number;
  imageHeightPx?: number;
  imageRightPct?: number;
  imageBottomPct?: number;
  logo?: string;
  logoHeightPx?: number;
  className?: string;
  minHeightClassName?: string;
}

export function HeroKidzlabStyle({
  titleLine1,
  titleLine2,
  titleLine2RainbowGradient,
  subtitle,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  image,
  imageAlt = '',
  bgColor = 'bg-gradient-to-r from-[#64b5f6] to-[#90caf9]',
  texture,
  showMagma = true,
  magmaX = 41,
  magmaY = 60,
  imageWidthPx = 500,
  imageHeightPx,
  imageRightPct = 0,
  imageBottomPct,
  logo,
  logoHeightPx = 56,
  className,
  minHeightClassName = 'lg:h-screen',
}: HeroKidzlabStyleProps) {
  const base = getBase();
  const textureSrc = texture ?? '/images/home/kidzlabs-texture.png';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        minHeightClassName,
        bgColor,
        className,
      )}
    >
      {textureSrc && (
        <img
          src={`${base}${textureSrc}`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
        />
      )}
      {image && (
        <img
          src={`${base}${image}`}
          alt={imageAlt}
          className="absolute z-[1] h-auto object-contain pointer-events-none"
          style={{
            right: `${imageRightPct}%`,
            bottom: imageBottomPct != null ? `${imageBottomPct}%` : '0',
            width: `${imageWidthPx}px`,
            height: imageHeightPx != null ? `${imageHeightPx}px` : 'auto',
          }}
        />
      )}
      <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/85 via-background/40 to-transparent md:from-background/80 md:via-background/25" />
      <div className="relative z-[3] flex items-center h-full w-full px-6 lg:px-16 xl:px-24 py-14">
        <div className="max-w-xl">
          {logo && (
            <img
              src={`${base}${logo}`}
              alt="4M Industrial Development Limited"
              className="h-auto w-auto max-w-none object-contain mb-4"
              style={{ height: `${logoHeightPx}px`, width: 'auto' }}
              loading="eager"
              decoding="async"
            />
          )}
          {titleLine1 && (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              <span className="block">{titleLine1}</span>
              {titleLine2 && (
                <span
                  className="block"
                  style={titleLine2RainbowGradient ? TITLE_LINE2_RAINBOW_STYLE : undefined}
                >
                  {titleLine2}
                </span>
              )}
            </h1>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-4">{subtitle}</p>
          )}
          <div className="flex flex-wrap gap-3 pt-6">
            {ctaText && ctaHref && (
              <Button asChild size="lg" className="font-fredoka btn-bouncy rounded-xl px-8 text-base">
                <a href={ctaHref}>{ctaText}</a>
              </Button>
            )}
            {secondaryCtaText && secondaryCtaHref && (
              <Button asChild size="lg" variant="outline" className="font-fredoka btn-bouncy rounded-xl px-8 text-base shadow-md">
                <a href={secondaryCtaHref}>{secondaryCtaText}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
      {showMagma && (
        <MagmaParticles
          sourceX={magmaX ?? 41}
          sourceY={magmaY ?? 60}
          rate={35}
          active={true}
        />
      )}
    </section>
  );
}
