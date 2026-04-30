import * as React from 'react';

import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import type {
  HomeHeroKidzlabBannerJson,
  HomeHeroOrbitBannerJson,
  HomeHeroFullViewportJson,
  FloatingProductConfig,
} from '@/types/home-sections';
import type { HeroBannerSlide } from './types';

type HeroVariant = 'orbitBanner' | 'kidzlabBanner' | 'fullViewport' | 'slider';

export type HeroTunerConfig = {
  variant: HeroVariant;
  kidzlabBanner?: HomeHeroKidzlabBannerJson;
  orbitBanner?: HomeHeroOrbitBannerJson;
  fullViewport?: HomeHeroFullViewportJson;
  slides?: HeroBannerSlide[];
  options?: {
    autoplay?: boolean;
    autoplayDelayMs?: number;
    showDots?: boolean;
    showArrows?: boolean;
    className?: string;
    heightClassName?: string;
    loop?: boolean;
  };
};

export type HeroTunerPanelProps = {
  config: HeroTunerConfig;
  setConfig: React.Dispatch<React.SetStateAction<HeroTunerConfig>>;
  onReset: () => void;
};

const inputClass =
  'w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function NumberInput({ value, onChange, min, max, step = 5 }: {
  value: number | undefined;
  onChange: (next: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      step={step}
      min={min}
      max={max}
      className={inputClass}
      value={value ?? ''}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === '') { onChange(undefined); return; }
        const next = Number(raw);
        onChange(Number.isFinite(next) ? next : undefined);
      }}
    />
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const variantLabels: Record<HeroVariant, string> = {
  orbitBanner: 'Orbit Banner',
  kidzlabBanner: 'KidzLab Style',
  fullViewport: 'Full Viewport',
  slider: 'Slider',
};

export function HeroTunerPanel({ config, setConfig, onReset }: HeroTunerPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const variant = config.variant;

  const kid = config.kidzlabBanner;
  const orb = config.orbitBanner;
  const fv = config.fullViewport;

  const copyJson = React.useCallback(async () => {
    const text = JSON.stringify(config, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this JSON:', text);
    }
  }, [config]);

  const patchKid = (partial: Partial<HomeHeroKidzlabBannerJson>) =>
    setConfig((prev) => {
      if (!prev.kidzlabBanner) return prev;
      return { ...prev, kidzlabBanner: { ...prev.kidzlabBanner, ...partial } };
    });

  const patchOrb = (partial: Partial<HomeHeroOrbitBannerJson>) =>
    setConfig((prev) => {
      if (!prev.orbitBanner) return prev;
      return { ...prev, orbitBanner: { ...prev.orbitBanner, ...partial } };
    });

  const patchOrbKid = (partial: Partial<HomeHeroOrbitBannerJson['kid']>) =>
    setConfig((prev) => {
      if (!prev.orbitBanner) return prev;
      return { ...prev, orbitBanner: { ...prev.orbitBanner, kid: { ...prev.orbitBanner.kid, ...partial } } };
    });

  const patchFv = (partial: Partial<HomeHeroFullViewportJson>) =>
    setConfig((prev) => {
      if (!prev.fullViewport) return prev;
      return { ...prev, fullViewport: { ...prev.fullViewport, ...partial } };
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-3 right-3 z-[200] rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'pointer-events-none opacity-0',
        )}
      >
        Hero tuner
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[199] bg-black/20 md:bg-black/10"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed bottom-0 right-0 top-0 z-[200] flex w-full max-w-[320px] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-200 md:bottom-4 md:right-4 md:top-4 md:max-h-[calc(100vh-2rem)] md:rounded-l-lg md:border',
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none',
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-xs font-semibold">Hero tuner — {variantLabels[variant]}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close tuner"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <p className="mb-3 text-[11px] text-muted-foreground">
            Adjust values for live preview. Copy JSON and replace the relevant section in{' '}
            <code className="rounded bg-muted px-1">public/data/home/hero.json</code> to save.
          </p>

          <div className="flex flex-col gap-3 text-xs">
            {variant === 'kidzlabBanner' && kid ? (
              <KidzlabControls draft={kid} patch={patchKid} />
            ) : null}

            {variant === 'orbitBanner' && orb ? (
              <OrbitControls draft={orb} patch={patchOrb} patchKid={patchOrbKid} />
            ) : null}

            {variant === 'fullViewport' && fv ? (
              <FullViewportControls draft={fv} patch={patchFv} />
            ) : null}

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Actions</legend>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" onClick={copyJson}>
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onReset}>
                  Reset
                </Button>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="border-t border-border px-3 py-2">
          <Button type="button" className="w-full" onClick={copyJson}>
            {copied ? 'Copied JSON' : 'Copy JSON'}
          </Button>
        </div>
      </aside>
    </>
  );
}

function KidzlabControls({ draft, patch }: {
  draft: HomeHeroKidzlabBannerJson;
  patch: (partial: Partial<HomeHeroKidzlabBannerJson>) => void;
}) {
  const fp = draft.floatingProducts ?? [];

  const setFloatingProducts = (next: FloatingProductConfig[]) =>
    patch({ floatingProducts: next });

  const updateFpItem = (idx: number, partial: Partial<FloatingProductConfig>) => {
    const next = [...fp];
    next[idx] = { ...next[idx], ...partial };
    setFloatingProducts(next);
  };

  const addFpItem = () =>
    setFloatingProducts([...fp, { image: '/images/hero/orbit/product-dinosaur.png', x: 50, y: 50, size: 80 }]);

  const removeFpItem = (idx: number) =>
    setFloatingProducts(fp.filter((_, i) => i !== idx));

  return (
    <>
      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Image</legend>
        <FieldRow label="Image URL">
          <input className={inputClass} value={draft.image ?? ''} onChange={(e) => patch({ image: e.target.value })} />
        </FieldRow>
        <FieldRow label="Alt text">
          <input className={inputClass} value={draft.imageAlt ?? ''} onChange={(e) => patch({ imageAlt: e.target.value })} />
        </FieldRow>
        <p className="text-[10px] text-muted-foreground">Position (px) and size (px).</p>
        <div className="grid grid-cols-2 gap-1.5">
          <FieldRow label="Right px">
            <NumberInput value={draft.imageRightPx} step={10} onChange={(next) => patch({ imageRightPx: next })} />
          </FieldRow>
          <FieldRow label="Bottom px">
            <NumberInput value={draft.imageBottomPx} step={10} onChange={(next) => patch({ imageBottomPx: next })} />
          </FieldRow>
          <FieldRow label="Width (px)">
            <NumberInput value={draft.imageWidthPx} min={50} step={10} onChange={(next) => patch({ imageWidthPx: next })} />
          </FieldRow>
          <FieldRow label="Height (px)">
            <NumberInput value={draft.imageHeightPx} min={50} step={10} onChange={(next) => patch({ imageHeightPx: next })} />
          </FieldRow>
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Magma</legend>
        <label className="flex cursor-pointer items-center gap-2 text-[11px]">
          <input type="checkbox" checked={draft.showMagma === true} onChange={(e) => patch({ showMagma: e.target.checked })} />
          Show magma particles
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          <FieldRow label="Right px">
            <NumberInput value={draft.magmaRightPx} step={10} onChange={(next) => patch({ magmaRightPx: next })} />
          </FieldRow>
          <FieldRow label="Bottom px">
            <NumberInput value={draft.magmaBottomPx} step={10} onChange={(next) => patch({ magmaBottomPx: next })} />
          </FieldRow>
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Bottom Wave</legend>
        <label className="flex cursor-pointer items-center gap-2 text-[11px]">
          <input type="checkbox" checked={draft.showBottomWave === true} onChange={(e) => patch({ showBottomWave: e.target.checked })} />
          Show bottom wave
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <FieldRow label="Opacity">
            <NumberInput value={draft.bottomWaveOpacity} min={0} max={1} step={0.01} onChange={(next) => patch({ bottomWaveOpacity: next })} />
          </FieldRow>
          <FieldRow label="Height px">
            <NumberInput value={draft.bottomWaveHeightPx} min={20} step={10} onChange={(next) => patch({ bottomWaveHeightPx: next })} />
          </FieldRow>
          <FieldRow label="Offset Y px">
            <NumberInput value={draft.bottomWaveOffsetPx} step={10} onChange={(next) => patch({ bottomWaveOffsetPx: next })} />
          </FieldRow>
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">
          Floating Products ({fp.length})
        </legend>
        <p className="text-[10px] text-muted-foreground">Background product images with tilt descending (first = most tilt).</p>
        {fp.map((item, i) => (
          <div key={i} className="rounded border border-border p-1.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium">Item {i + 1}</span>
              <button
                type="button"
                onClick={() => removeFpItem(i)}
                className="text-[10px] text-destructive hover:underline"
              >
                Remove
              </button>
            </div>
            <FieldRow label="Image URL">
              <input className={inputClass} value={item.image} onChange={(e) => updateFpItem(i, { image: e.target.value })} />
            </FieldRow>
            <div className="grid grid-cols-4 gap-1">
              <FieldRow label="X px (from left)">
                <NumberInput value={item.x} step={10} onChange={(next) => updateFpItem(i, { x: next ?? 50 })} />
              </FieldRow>
              <FieldRow label="Y px (from bottom)">
                <NumberInput value={item.y} step={10} onChange={(next) => updateFpItem(i, { y: next ?? 50 })} />
              </FieldRow>
              <FieldRow label="Size px">
                <NumberInput value={item.size} min={20} step={5} onChange={(next) => updateFpItem(i, { size: next ?? 80 })} />
              </FieldRow>
              <FieldRow label="Tilt deg">
                <NumberInput value={item.tilt} step={1} onChange={(next) => updateFpItem(i, { tilt: next })} />
              </FieldRow>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addFpItem}
          className="w-full rounded border border-dashed border-border py-1 text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          + Add floating product
        </button>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Content</legend>
        <FieldRow label="Title line 1">
          <input className={inputClass} value={draft.titleLine1 ?? ''} onChange={(e) => patch({ titleLine1: e.target.value })} />
        </FieldRow>
        <FieldRow label="Title line 2">
          <input className={inputClass} value={draft.titleLine2 ?? ''} onChange={(e) => patch({ titleLine2: e.target.value })} />
        </FieldRow>
        <label className="flex cursor-pointer items-center gap-2 text-[11px]">
          <input type="checkbox" checked={draft.titleLine2RainbowGradient === true} onChange={(e) => patch({ titleLine2RainbowGradient: e.target.checked })} />
          Rainbow gradient
        </label>
        <FieldRow label="Subtitle">
          <input className={inputClass} value={draft.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA text">
          <input className={inputClass} value={draft.ctaText ?? ''} onChange={(e) => patch({ ctaText: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA href">
          <input className={inputClass} value={draft.ctaHref ?? ''} onChange={(e) => patch({ ctaHref: e.target.value })} />
        </FieldRow>
        <FieldRow label="Secondary CTA text">
          <input className={inputClass} value={draft.secondaryCtaText ?? ''} onChange={(e) => patch({ secondaryCtaText: e.target.value })} />
        </FieldRow>
        <FieldRow label="Secondary CTA href">
          <input className={inputClass} value={draft.secondaryCtaHref ?? ''} onChange={(e) => patch({ secondaryCtaHref: e.target.value })} />
        </FieldRow>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Appearance</legend>
        <FieldRow label="BG color (Tailwind)">
          <input className={inputClass} value={draft.bgColor ?? ''} onChange={(e) => patch({ bgColor: e.target.value })} />
        </FieldRow>
        <FieldRow label="Logo height (px)">
          <NumberInput value={draft.logoHeightPx} min={20} step={5} onChange={(next) => patch({ logoHeightPx: next })} />
        </FieldRow>
        <FieldRow label="minHeightClassName">
          <input className={inputClass} value={draft.minHeightClassName ?? ''} onChange={(e) => patch({ minHeightClassName: e.target.value })} />
        </FieldRow>
      </fieldset>
    </>
  );
}

function OrbitControls({ draft, patch, patchKid }: {
  draft: HomeHeroOrbitBannerJson;
  patch: (partial: Partial<HomeHeroOrbitBannerJson>) => void;
  patchKid: (partial: Partial<HomeHeroOrbitBannerJson['kid']>) => void;
}) {
  return (
    <>
      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Kid</legend>
        <FieldRow label="Image URL">
          <input className={inputClass} value={draft.kid?.image ?? ''} onChange={(e) => patchKid({ image: e.target.value })} />
        </FieldRow>
        <FieldRow label="Alt text">
          <input className={inputClass} value={draft.kid?.alt ?? ''} onChange={(e) => patchKid({ alt: e.target.value })} />
        </FieldRow>
        <p className="text-[10px] text-muted-foreground">Large screen placement.</p>
        <div className="grid grid-cols-3 gap-1.5">
          <FieldRow label="X %">
            <NumberInput value={draft.kid?.large?.xPercent} step={1} onChange={(next) => patchKid({ large: { ...draft.kid?.large, xPercent: next } })} />
          </FieldRow>
          <FieldRow label="Y %">
            <NumberInput value={draft.kid?.large?.yPercent} step={1} onChange={(next) => patchKid({ large: { ...draft.kid?.large, yPercent: next } })} />
          </FieldRow>
          <FieldRow label="Width px">
            <NumberInput value={draft.kid?.large?.widthPx} min={50} step={10} onChange={(next) => patchKid({ large: { ...draft.kid?.large, widthPx: next } })} />
          </FieldRow>
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-md border border-border p-2">
        <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Content</legend>
        <FieldRow label="Title line 1">
          <input className={inputClass} value={draft.titleLine1 ?? ''} onChange={(e) => patch({ titleLine1: e.target.value })} />
        </FieldRow>
        <FieldRow label="Title line 2">
          <input className={inputClass} value={draft.titleLine2 ?? ''} onChange={(e) => patch({ titleLine2: e.target.value })} />
        </FieldRow>
        <FieldRow label="Subtitle">
          <input className={inputClass} value={draft.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA text">
          <input className={inputClass} value={draft.ctaText ?? ''} onChange={(e) => patch({ ctaText: e.target.value })} />
        </FieldRow>
        <FieldRow label="CTA href">
          <input className={inputClass} value={draft.ctaHref ?? ''} onChange={(e) => patch({ ctaHref: e.target.value })} />
        </FieldRow>
      </fieldset>
    </>
  );
}

function FullViewportControls({ draft, patch }: {
  draft: HomeHeroFullViewportJson;
  patch: (partial: Partial<HomeHeroFullViewportJson>) => void;
}) {
  return (
    <fieldset className="space-y-2 rounded-md border border-border p-2">
      <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Content</legend>
      <FieldRow label="Title">
        <input className={inputClass} value={draft.title ?? ''} onChange={(e) => patch({ title: e.target.value })} />
      </FieldRow>
      <FieldRow label="Subtitle">
        <input className={inputClass} value={draft.subtitle ?? ''} onChange={(e) => patch({ subtitle: e.target.value })} />
      </FieldRow>
      <FieldRow label="CTA text">
        <input className={inputClass} value={draft.ctaText ?? ''} onChange={(e) => patch({ ctaText: e.target.value })} />
      </FieldRow>
      <FieldRow label="CTA href">
        <input className={inputClass} value={draft.ctaHref ?? ''} onChange={(e) => patch({ ctaHref: e.target.value })} />
      </FieldRow>
      <FieldRow label="Background">
        <input className={inputClass} value={draft.background ?? ''} onChange={(e) => patch({ background: e.target.value })} />
      </FieldRow>
    </fieldset>
  );
}
