'use client';

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
  return (
    <>
      {products.map((p) => {
        const imageRight = p.layout === 'right';
        const textureMap: Record<string, string> = {
          kidzlabs: `${base}/images/home/kidzlabs-texture.png`,
          'green-science': `${base}/images/home/green-science-texture.png`,
          'arts-crafts': `${base}/images/home/arts-crafts-texture.png`,
        };
        const textureSrc = textureMap[p.pillar];
        return (
          <div key={p.pillar} className={cn(
            'group flex flex-col w-full overflow-hidden transition-all duration-1000 ease-out',
            'lg:h-screen',
            imageRight ? 'lg:flex-row-reverse' : 'lg:flex-row',
            p.bgColor,
            'relative',
          )}>
            <img
              src={textureSrc}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
            />
            <div className={cn(
              'w-full lg:w-3/5 lg:group-hover:w-[58%] min-h-[40vh] lg:min-h-0 overflow-hidden transition-all duration-1000 ease-out relative z-[1]',
            )}>
              <img src={`${base}${p.image}`} alt={p.imageAlt} className="h-full w-full object-cover" />
            </div>
            <div className={cn(
              'w-full lg:w-2/5 lg:group-hover:w-[42%] flex items-center px-6 lg:px-16 py-14 lg:py-0 transition-all duration-1000 ease-out relative z-[1]',
            )}>
              <div className="max-w-lg">
                <h3 className="text-3xl md:text-4xl font-bold text-white">{p.title}</h3>
                <p className="text-lg text-white/85 leading-relaxed mt-4">{p.description}</p>
                <p className="text-lg pt-2 mt-2">
                  <a href={p.linkHref} className="inline-flex items-center gap-1 font-medium text-white underline decoration-white/70 underline-offset-[5px] hover:text-white/75 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm">{p.linkLabel} <span aria-hidden="true">→</span></a>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}
