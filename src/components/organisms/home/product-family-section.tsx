'use client';

import { useState } from 'react';
import { cn } from '@/utils';

interface ProductData {
  pillar: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  linkHref: string;
  linkLabel: string;
  bgColor: string;
  layout: 'left' | 'right';
}

interface ProductFamilySectionProps {
  products: ProductData[];
  base: string;
}

const linkClass =
  'inline-flex items-center gap-1 font-medium text-blue-600 underline decoration-blue-600/80 underline-offset-[5px] hover:text-blue-800 hover:decoration-blue-800 dark:text-blue-400 dark:decoration-blue-400/70 dark:hover:text-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm';

export function ProductFamilySection({ products, base }: ProductFamilySectionProps) {
  const [mode, setMode] = useState<'default' | 'fullBleed'>('fullBleed');

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-lg">
        <span className="text-xs font-medium text-muted-foreground">Product Display:</span>
        <button
          onClick={() => setMode('default')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'default'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Default
        </button>
        <button
          onClick={() => setMode('fullBleed')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'fullBleed'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          Full Bleed
        </button>
      </div>

      {mode === 'fullBleed' ? (
        <>
          {products.map((p) => {
            const imageRight = p.layout === 'right';
            return (
              <div
                key={p.pillar}
                className={cn(
                  'group flex flex-col lg:h-[70vh] w-full overflow-hidden transition-all duration-1000 ease-out',
                  imageRight ? 'lg:flex-row-reverse' : 'lg:flex-row',
                )}
              >
                <div className="w-full lg:w-3/5 lg:group-hover:w-[58%] min-h-[40vh] lg:min-h-0 overflow-hidden transition-all duration-1000 ease-out">
                  <img
                    src={`${base}${p.image}`}
                    alt={p.imageAlt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div
                  className={cn(
                    'w-full lg:w-2/5 lg:group-hover:w-[42%] flex items-center px-6 lg:px-16 py-14 lg:py-0 transition-all duration-1000 ease-out',
                    p.bgColor,
                  )}
                >
                  <div className="max-w-lg">
                    <h3 className="text-3xl md:text-4xl font-bold text-fun">{p.title}</h3>
                    <p className="text-lg text-muted-foreground text-comic leading-relaxed mt-4">
                      {p.description}
                    </p>
                    <p className="text-lg pt-2 mt-2">
                      <a href={p.linkHref} className={linkClass}>
                        {p.linkLabel} <span aria-hidden="true">→</span>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <>
          {products.map((p) => {
            const imageLeft = p.layout === 'left';
            const rotClass = imageLeft ? '-rotate-[3deg]' : 'rotate-[2deg]';
            return (
              <div key={p.pillar} className={cn('w-full py-14 lg:py-20', p.bgColor)}>
                <div className="container-custom">
                  <article className="home-pillar-row grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center" data-pillar={p.pillar}>
                    <div className={cn(
                      'home-pillar-visual aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 shadow-md scale-95 transition-transform duration-300 ease-out hover:scale-100 hover:rotate-0',
                      rotClass,
                      imageLeft ? '' : 'order-1 lg:order-2',
                    )}>
                      <img src={`${base}${p.image}`} alt={p.imageAlt} className="h-full w-full object-cover" />
                    </div>
                    <div className={cn(
                      'space-y-5 lg:max-w-xl text-center lg:text-left',
                      imageLeft ? 'lg:justify-self-end' : 'order-2 lg:order-1',
                    )}>
                      <h3 className="text-2xl md:text-3xl font-bold text-fun">{p.title}</h3>
                      <p className="text-lg text-muted-foreground text-comic leading-relaxed">{p.description}</p>
                      <p className="text-lg pt-2">
                        <a href={p.linkHref} className={linkClass}>
                          {p.linkLabel} <span aria-hidden="true">→</span>
                        </a>
                      </p>
                    </div>
                  </article>
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
