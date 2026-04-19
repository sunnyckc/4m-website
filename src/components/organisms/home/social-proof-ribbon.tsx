import { cn } from '@/utils';
import type { HomeSocialProofItemJson, HomeSocialProofJson } from '@/types/home-sections';

export type SocialProofRibbonProps = {
  config: HomeSocialProofJson;
};

/** Uniform logo box; emphasized partners scale up slightly. */
const LOGO_MAX_W = 'max-w-[min(160px,28vw)]';

function SocialProofItem({
  item,
}: {
  item: HomeSocialProofItemJson;
}) {
  const emphasis = item.emphasis === true;
  const logoMaxHeightClassName = emphasis
    ? 'max-h-11 sm:max-h-12 md:max-h-[3.35rem]'
    : 'max-h-8 sm:max-h-9 md:max-h-10';

  const inner = (
    <>
      {item.logo ? (
        <img
          src={item.logo}
          alt={item.name}
          className={cn(
            'h-auto w-auto object-contain transition duration-300 filter-none',
            LOGO_MAX_W,
            logoMaxHeightClassName,
          )}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className={cn(
            'block max-w-[200px] text-center font-fredoka text-sm font-semibold tracking-tight text-fun/90',
            'sm:text-base md:max-w-[220px]',
            emphasis && 'text-base sm:text-lg',
          )}
        >
          {item.name}
        </span>
      )}
    </>
  );

  const shell = cn(
    'flex min-h-[3rem] w-full shrink-0 items-center justify-center px-3 py-2 sm:px-4',
    emphasis && 'md:min-h-[3.5rem]',
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        className={cn(
          shell,
          'outline-none ring-offset-background transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.name}
      >
        {inner}
      </a>
    );
  }

  return <div className={shell}>{inner}</div>;
}

export function SocialProofRibbon({ config }: SocialProofRibbonProps) {
  const { title, subtitle, items, className } = config;
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'border-y border-border/60 bg-muted/30 py-6 md:py-8',
        className,
      )}
      aria-labelledby="social-proof-heading"
    >
      <div className="container-custom">
        <div className="mb-6 text-center md:mb-8">
          <h2
            id="social-proof-heading"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl mx-auto text-sm text-muted-foreground text-comic md:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-10 md:gap-x-8">
          {items.map((item) => (
            <SocialProofItem key={item.id ?? item.name} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
