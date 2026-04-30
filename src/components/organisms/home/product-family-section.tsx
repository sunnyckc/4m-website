'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils';
import { MagmaParticles } from './magma-particles';
import { WaterParticles } from './water-particles';

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
  const [kidzLabsOverride, setKidzLabsOverride] = useState<string | null>('/images/home/kidzlabs-child.png');
  const [showMagma, setShowMagma] = useState(true);
  const [magmaX, setMagmaX] = useState(41);
  const [magmaY, setMagmaY] = useState(60);
  const [showWater, setShowWater] = useState(true);
  const [waterX, setWaterX] = useState(64);
  const [waterY, setWaterY] = useState(48);

  const emitState = useCallback(() => {
    window.dispatchEvent(new CustomEvent('productfamily:stateChange', {
      detail: { mode, kidzLabsImage: kidzLabsOverride ?? '/images/home/kidzlabs.jpg', magmaX, magmaY, showMagma },
    }));
  }, [mode, kidzLabsOverride, magmaX, magmaY, showMagma]);

  useEffect(() => {
    const onSetMode = (e: Event) => {
      const { mode: newMode } = (e as CustomEvent).detail;
      if (newMode === 'default' || newMode === 'fullBleed') setMode(newMode);
    };
    const onSetImage = (e: Event) => {
      const { pillar, image } = (e as CustomEvent).detail;
      if (pillar === 'kidzlabs') setKidzLabsOverride(image);
    };
    window.addEventListener('productfamily:setMode', onSetMode);
    window.addEventListener('productfamily:setImage', onSetImage);
    return () => {
      window.removeEventListener('productfamily:setMode', onSetMode);
      window.removeEventListener('productfamily:setImage', onSetImage);
    };
  }, []);

  useEffect(() => { emitState(); }, [emitState]);

  const resolvedProducts = products.map((p) => {
    if (p.pillar === 'kidzlabs' && kidzLabsOverride) {
      return { ...p, image: kidzLabsOverride, imageAlt: 'Child close-up with science experiment' };
    }
    return p;
  });

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 rounded-lg border border-border bg-background p-3 shadow-lg max-w-[280px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Layout:</span>
          <button onClick={() => setMode('default')} className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === 'default' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Default</button>
          <button onClick={() => setMode('fullBleed')} className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === 'fullBleed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>Bleed</button>
        </div>
        <div className="flex items-center gap-2 border-t border-border/60 pt-2">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">KidzLabs:</span>
          <button onClick={() => setKidzLabsOverride(kidzLabsOverride ? null : '/images/home/kidzlabs-child.png')} className="rounded-md px-2 py-1 text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">{kidzLabsOverride ? 'Original' : 'Close-up'}</button>
        </div>
        <div className="border-t border-border/60 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Magma:</span>
            <button onClick={() => setShowMagma(!showMagma)} className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${showMagma ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{showMagma ? 'ON' : 'OFF'}</button>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>X:</span>
            <input type="range" min="0" max="100" value={magmaX} onChange={(e) => setMagmaX(Number(e.target.value))} className="w-16 h-3" />
            <span>{magmaX}%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Y:</span>
            <input type="range" min="0" max="100" value={magmaY} onChange={(e) => setMagmaY(Number(e.target.value))} className="w-16 h-3" />
            <span>{magmaY}%</span>
          </div>
        </div>
        <div className="border-t border-border/60 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Water:</span>
            <button onClick={() => setShowWater(!showWater)} className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${showWater ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{showWater ? 'ON' : 'OFF'}</button>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>X:</span>
            <input type="range" min="0" max="100" value={waterX} onChange={(e) => setWaterX(Number(e.target.value))} className="w-16 h-3" />
            <span>{waterX}%</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>Y:</span>
            <input type="range" min="0" max="100" value={waterY} onChange={(e) => setWaterY(Number(e.target.value))} className="w-16 h-3" />
            <span>{waterY}%</span>
          </div>
        </div>
      </div>

      {mode === 'fullBleed' ? (
        <>
          {resolvedProducts.map((p) => {
            const imageRight = p.layout === 'right';
            const isKidzLabs = p.pillar === 'kidzlabs';
            const isGreenScience = p.pillar === 'green-science';
            return (
              <div key={p.pillar} className={cn(
                'group flex flex-col w-full overflow-hidden transition-all duration-1000 ease-out',
                isKidzLabs ? 'lg:h-screen' : 'lg:h-[70vh]',
                imageRight ? 'lg:flex-row-reverse' : 'lg:flex-row',
                isKidzLabs && p.bgColor,
                (isKidzLabs || isGreenScience) && 'relative',
              )}>
                {isKidzLabs && (
                  <img
                    src={`${base}/images/home/kidzlabs-texture.png`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none z-0"
                  />
                )}
                <div className={cn(
                  'w-full lg:w-3/5 lg:group-hover:w-[58%] min-h-[40vh] lg:min-h-0 overflow-hidden transition-all duration-1000 ease-out relative z-[1]',
                  isKidzLabs && 'p-3',
                )}>
                  <img src={`${base}${p.image}`} alt={p.imageAlt} className="h-full w-full object-cover" />
                </div>
                <div className={cn(
                  'w-full lg:w-2/5 lg:group-hover:w-[42%] flex items-center px-6 lg:px-16 py-14 lg:py-0 transition-all duration-1000 ease-out relative z-[1]',
                  !isKidzLabs && p.bgColor,
                )}>
                  <div className="max-w-lg">
                    <h3 className="text-3xl md:text-4xl font-bold text-white">{p.title}</h3>
                    <p className="text-lg text-white/85 leading-relaxed mt-4">{p.description}</p>
                    <p className="text-lg pt-2 mt-2">
                      <a href={p.linkHref} className="inline-flex items-center gap-1 font-medium text-white underline decoration-white/70 underline-offset-[5px] hover:text-white/75 hover:decoration-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm">{p.linkLabel} <span aria-hidden="true">→</span></a>
                    </p>
                  </div>
                </div>
                {isKidzLabs && (
                  <MagmaParticles
                    sourceX={magmaX}
                    sourceY={magmaY}
                    rate={35}
                    active={showMagma}
                  />
                )}
                {isGreenScience && (
                  <WaterParticles
                    sourceX={waterX}
                    sourceY={waterY}
                    rate={50}
                    active={showWater}
                  />
                )}
              </div>
            );
          })}
        </>
      ) : (
        <>
          {resolvedProducts.map((p) => {
            const imageLeft = p.layout === 'left';
            const rotClass = imageLeft ? '-rotate-[3deg]' : 'rotate-[2deg]';
            return (
              <div key={p.pillar} className={cn('w-full py-14 lg:py-20', p.bgColor)}>
                <div className="container-custom">
                  <article className="home-pillar-row grid lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-20 items-center" data-pillar={p.pillar}>
                    <div className={cn(
                      'home-pillar-visual aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 shadow-md scale-95 transition-transform duration-300 ease-out hover:scale-100 hover:rotate-0',
                      rotClass, imageLeft ? '' : 'order-1 lg:order-2',
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
                        <a href={p.linkHref} className={linkClass}>{p.linkLabel} <span aria-hidden="true">→</span></a>
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
