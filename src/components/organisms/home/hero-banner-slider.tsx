import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/react/carousel';
import { cn } from '@/utils';
import type { HeroBannerSlide } from '@/components/organisms/home/types';

export type HeroBannerSliderProps = {
  slides: HeroBannerSlide[];
  autoplay?: boolean;
  autoplayDelayMs?: number;
  loop?: boolean;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
  /** Min height for the hero region (Tailwind class). */
  heightClassName?: string;
};

export function HeroBannerSlider({
  slides,
  autoplay = true,
  autoplayDelayMs = 5000,
  loop = true,
  showDots = true,
  showArrows = true,
  className,
  heightClassName = 'min-h-[370px] h-[370px]',
}: HeroBannerSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(0);

  const plugin = React.useMemo(
    () =>
      Autoplay({
        delay: autoplayDelayMs,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    [autoplayDelayMs],
  );

  React.useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    api.on('select', () => {
      setSelected(api.selectedScrollSnap());
    });
  }, [api]);

  if (!slides.length) {
    return null;
  }

  return (
    <div className={cn('relative mb-8 w-full', className)}>
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{ align: 'start', loop }}
        plugins={autoplay ? [plugin] : []}
      >
        <CarouselContent className="ml-0">
          {slides.map((slide) => (
            <CarouselItem key={slide.id} className="pl-0">
              <div
                className={cn(
                  'relative w-full overflow-hidden rounded-xl',
                  heightClassName,
                )}
                title={slide.hoverText ?? undefined}
              >
                {slide.media.type === 'video' ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover object-left"
                    src={slide.media.src}
                    poster={slide.media.posterUrl ?? undefined}
                    muted={slide.media.muted ?? true}
                    loop={slide.media.loop ?? true}
                    playsInline={slide.media.playsInline ?? true}
                    autoPlay
                    aria-label={slide.imageAlt}
                  />
                ) : (
                  <img
                    src={slide.media.src}
                    alt={slide.imageAlt}
                    title={slide.hoverText ?? undefined}
                    className="absolute inset-0 h-full w-full object-cover object-left"
                    loading="lazy"
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      slide.overlay?.gradient ??
                      'linear-gradient(to top, rgba(0,0,0,0.65), transparent 55%)',
                    opacity: slide.overlay?.opacity ?? 1,
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                  <div className="max-w-xl space-y-3 text-white drop-shadow-md">
                    <h2 className="text-2xl font-bold md:text-4xl">
                      {slide.textPrimary}
                    </h2>
                    {slide.textSecondary ? (
                      <p className="text-sm md:text-lg text-white/90">
                        {slide.textSecondary}
                      </p>
                    ) : null}
                    {slide.href && slide.ctaLabel ? (
                      <a
                        href={slide.href}
                        title={slide.hoverText ?? undefined}
                        className="inline-flex w-fit rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {slide.ctaLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showArrows && slides.length > 1 ? (
          <>
            <CarouselPrevious
              type="button"
              className="left-4 top-1/2 z-10 -translate-y-1/2 border-white/40 bg-background/80 text-foreground hover:bg-background"
            />
            <CarouselNext
              type="button"
              className="right-4 top-1/2 z-10 -translate-y-1/2 border-white/40 bg-background/80 text-foreground hover:bg-background"
            />
          </>
        ) : null}
      </Carousel>
      {showDots && slides.length > 1 ? (
        <div
          className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2"
          role="tablist"
          aria-label="Hero slides"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={selected === i}
              className={cn(
                'h-2.5 w-2.5 rounded-full transition-colors',
                selected === i ? 'bg-white' : 'bg-white/50 hover:bg-white/80',
              )}
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
