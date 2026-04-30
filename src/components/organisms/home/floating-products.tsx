'use client';

import * as React from 'react';
import { getBase } from '@/config';
import type { FloatingProductConfig } from '@/types/home-sections';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function useRandomTilts(count: number): number[] {
  return React.useMemo(() => {
    const maxTilt = 8;
    const minTilt = 2;
    const tilts: number[] = [];
    for (let i = 0; i < count; i++) {
      const t = maxTilt - (i / Math.max(count - 1, 1)) * (maxTilt - minTilt);
      tilts.push(Math.round(t * 10) / 10);
    }
    return tilts;
  }, [count]);
}

export type FloatingProductsProps = {
  products: FloatingProductConfig[];
};

export function FloatingProducts({ products }: FloatingProductsProps) {
  const base = getBase();
  const tilts = useRandomTilts(products.length);

  return (
    <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
      {products.map((p, i) => (
        <img
          key={i}
          src={`${base}${p.image}`}
          alt=""
          className="absolute h-auto object-contain"
          style={{
            left: `${p.x}px`,
            bottom: `${p.y}px`,
            width: `${p.size}px`,
            transform: `rotate(${p.tilt ?? tilts[i]}deg)`,
          }}
        />
      ))}
    </div>
  );
}
