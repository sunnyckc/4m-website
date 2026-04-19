import * as React from 'react';

import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';

export type HeroFullViewportProps = {
  title: string;
  subtitle?: string | null;
  ctaText: string;
  ctaHref: string;
  /** Reserved region for a future carousel or other media (PNG strip, etc.). */
  children?: React.ReactNode;
  className?: string;
  innerClassName?: string;
  /** Optional CSS `background` (overrides default light blue). */
  background?: string;
  /** Min height for the hero block (Tailwind). */
  minHeightClassName?: string;
  /** Min height for the optional media slot below the CTA. */
  mediaSlotMinHeightClassName?: string;
  /** When false, the media slot is not rendered. */
  showMediaSlot?: boolean;
};

export function HeroFullViewport({
  title,
  subtitle,
  ctaText,
  ctaHref,
  children,
  className,
  innerClassName,
  background,
  minHeightClassName = 'min-h-[100dvh]',
  mediaSlotMinHeightClassName = 'min-h-[min(35vh,260px)]',
  showMediaSlot = true,
}: HeroFullViewportProps) {
  return (
    <section
      className={cn(
        'relative flex w-full flex-col overflow-hidden',
        !background && 'bg-sky-100',
        minHeightClassName,
        className,
      )}
      style={background ? { background } : undefined}
    >
      {/* Main copy + CTA: vertically centered in remaining space above the media slot */}
      <div
        className={cn(
          'container-custom flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:py-12',
          innerClassName,
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 md:gap-5">
          <h1 className="text-4xl font-bold tracking-tight text-fun md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="max-w-2xl text-lg text-muted-foreground text-comic md:text-xl">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-8 md:mt-10">
          <Button
            asChild
            size="lg"
            className="font-fredoka btn-bouncy rounded-xl px-8 text-base"
          >
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        </div>
      </div>

      {showMediaSlot ? (
        <div
          className={cn(
            'container-custom flex w-full max-w-5xl flex-shrink-0 flex-col items-center px-4 pb-10 md:pb-12',
            mediaSlotMinHeightClassName,
          )}
          data-slot="hero-media"
          aria-hidden={children == null ? true : undefined}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
