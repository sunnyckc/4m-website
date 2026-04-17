import * as React from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/react/carousel';
import { cn } from '@/utils';
import type { CatalogSliderItem } from '@/components/organisms/home/types';
import { BatchChips } from '@/components/organisms/home/batch-chips';

function chunkItems<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function hasCatalogCaption(item: CatalogSliderItem): boolean {
  return (
    (item.batches?.length ?? 0) > 0 ||
    !!item.textPrimary?.trim() ||
    !!item.textSecondary?.trim()
  );
}

export type CatalogSliderProps = {
  items: CatalogSliderItem[];
  itemsPerSlide: number;
  initialSlideIndex?: number;
  showArrows?: boolean;
  showDots?: boolean;
  /** Tailwind classes for the inner product grid on each slide. */
  slideGridClassName?: string;
  isLoading?: boolean;
  className?: string;
  onSlideChange?: (slideIndex: number) => void;
};

export function CatalogSlider({
  items,
  itemsPerSlide,
  initialSlideIndex = 0,
  showArrows = true,
  showDots = true,
  slideGridClassName = 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4',
  isLoading = false,
  className,
  onSlideChange,
}: CatalogSliderProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selected, setSelected] = React.useState(initialSlideIndex);

  const slides = React.useMemo(
    () => chunkItems(items, itemsPerSlide),
    [items, itemsPerSlide],
  );

  React.useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    api.on('select', () => {
      const i = api.selectedScrollSnap();
      setSelected(i);
      onSlideChange?.(i);
    });
  }, [api, onSlideChange]);

  if (isLoading) {
    return (
      <div
        className={cn('flex min-h-[200px] items-center justify-center rounded-xl border border-dashed', className)}
        role="status"
      >
        <span className="text-muted-foreground">Loading…</span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <p className={cn('text-center text-muted-foreground', className)} role="status">
        No items to show.
      </p>
    );
  }

  return (
    <div className={cn('relative w-full', className)}>
      <Carousel
        className="w-full"
        setApi={setApi}
        opts={{
          align: 'start',
          loop: false,
          startIndex:
            slides.length === 0
              ? 0
              : Math.min(
                  Math.max(0, initialSlideIndex),
                  Math.max(0, slides.length - 1),
                ),
        }}
      >
        <CarouselContent>
          {slides.map((group, slideIdx) => (
            <CarouselItem key={slideIdx}>
              <div className={slideGridClassName}>
                {group.map((item) => {
                  const showCaption = hasCatalogCaption(item);
                  const cardClass =
                    'group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:shadow-md';

                  const imageBlock = (
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.imageAlt}
                          title={item.hoverText ?? undefined}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="flex h-full w-full items-center justify-center text-xs text-muted-foreground"
                          title={item.hoverText ?? undefined}
                        >
                          <span className="sr-only">{item.imageAlt}</span>
                          No image
                        </div>
                      )}
                    </div>
                  );

                  const captionBlock = showCaption ? (
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      {item.batches?.length ? (
                        <BatchChips batches={item.batches} />
                      ) : null}
                      {item.href ? (
                        item.textPrimary?.trim() ? (
                          <a
                            href={item.href}
                            className="font-semibold leading-snug text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                            title={item.hoverText ?? undefined}
                          >
                            {item.textPrimary}
                          </a>
                        ) : item.textSecondary?.trim() ? (
                          <a
                            href={item.href}
                            className="text-sm leading-snug text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                            title={item.hoverText ?? undefined}
                          >
                            {item.textSecondary}
                          </a>
                        ) : null
                      ) : (
                        <>
                          {item.textPrimary?.trim() ? (
                            <h3 className="font-semibold leading-snug">{item.textPrimary}</h3>
                          ) : null}
                          {item.textSecondary?.trim() ? (
                            <p className="text-sm text-muted-foreground">{item.textSecondary}</p>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null;

                  if (item.href && !showCaption) {
                    return (
                      <a
                        key={item.id}
                        href={item.href}
                        title={item.hoverText ?? undefined}
                        className={cn(
                          cardClass,
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        )}
                      >
                        {imageBlock}
                      </a>
                    );
                  }

                  return (
                    <article key={item.id} className={cardClass} title={item.hoverText ?? undefined}>
                      {imageBlock}
                      {captionBlock}
                    </article>
                  );
                })}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showArrows && slides.length > 1 ? (
          <>
            <CarouselPrevious
              type="button"
              className="left-0 top-1/2 z-10 -translate-y-1/2 md:-left-4"
            />
            <CarouselNext
              type="button"
              className="right-0 top-1/2 z-10 -translate-y-1/2 md:-right-4"
            />
          </>
        ) : null}
      </Carousel>
      {showDots && slides.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Catalog slides">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={selected === i}
              className={cn(
                'h-2 w-2 rounded-full transition-colors',
                selected === i ? 'bg-primary' : 'bg-muted-foreground/40 hover:bg-muted-foreground/60',
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
