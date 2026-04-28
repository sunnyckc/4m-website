import * as React from 'react';

import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import type {
  HeroTextSizeOption,
  HomeHeroOrbitBannerJson,
  OrbitBannerItemJson,
  OrbitBannerKidPlacement,
  OrbitBannerOrbitLayout,
  OrbitBannerTitleBlockPlacement,
  OrbitDirection,
  OrbitItemDisplayMode,
  OrbitSpeedStyle,
} from '@/types/home-sections';

import { resolveKidPlacements, resolveOrbitLayouts, resolveTitleBlockOffsets } from './hero-orbit-layout';

const PANEL_SIDE_KEY = 'orbit-tuner-side';
type PanelSide = 'left' | 'right';
type TunerTab = 'text' | 'image' | 'product';

/** Matches orbit hero CSS breakpoints: `md` 768px, `lg` 1024px. */
export type OrbitViewportBp = 'mobile' | 'medium' | 'large';

function getOrbitViewportBp(): OrbitViewportBp {
  if (typeof window === 'undefined') return 'large';
  if (window.matchMedia('(min-width: 1024px)').matches) return 'large';
  if (window.matchMedia('(min-width: 768px)').matches) return 'medium';
  return 'mobile';
}

const viewportBpLabels: Record<OrbitViewportBp, string> = {
  large: 'Large (1024px+)',
  medium: 'Medium (768–1023px)',
  mobile: 'Mobile (under 768px)',
};

function useOrbitViewportBreakpoint(): OrbitViewportBp {
  const [bp, setBp] = React.useState<OrbitViewportBp>(getOrbitViewportBp);
  React.useEffect(() => {
    const mqL = window.matchMedia('(min-width: 1024px)');
    const mqM = window.matchMedia('(min-width: 768px)');
    const read = () => setBp(getOrbitViewportBp());
    read();
    mqL.addEventListener('change', read);
    mqM.addEventListener('change', read);
    return () => {
      mqL.removeEventListener('change', read);
      mqM.removeEventListener('change', read);
    };
  }, []);
  return bp;
}

function orbitConfigToCopyableJson(config: HomeHeroOrbitBannerJson): string {
  return `${JSON.stringify(config, null, 2)}\n`;
}

type FieldRowProps = { label: string; children: React.ReactNode };

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="grid gap-1">
      <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 10,
}: {
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
        if (raw === '') {
          onChange(undefined);
          return;
        }
        const next = Number(raw);
        onChange(Number.isFinite(next) ? next : undefined);
      }}
    />
  );
}

export type HeroOrbitTunerPanelProps = {
  draft: HomeHeroOrbitBannerJson;
  setDraft: React.Dispatch<React.SetStateAction<HomeHeroOrbitBannerJson>>;
  onReset: () => void;
};

const textSizeOptions: HeroTextSizeOption[] = ['sm', 'md', 'lg', 'xl'];
const itemDisplayModes: OrbitItemDisplayMode[] = ['transparent', 'rectangle', 'circleAccent'];

export function HeroOrbitTunerPanel({ draft, setDraft, onReset }: HeroOrbitTunerPanelProps) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [panelSide, setPanelSide] = React.useState<PanelSide>('right');
  const [activeTab, setActiveTab] = React.useState<TunerTab>('text');
  const viewportBp = useOrbitViewportBreakpoint();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(PANEL_SIDE_KEY);
    if (stored === 'left' || stored === 'right') setPanelSide(stored);
  }, []);

  const onPanelSideChange = React.useCallback((next: PanelSide) => {
    setPanelSide(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(PANEL_SIDE_KEY, next);
  }, []);

  const patch = React.useCallback(
    (partial: Partial<HomeHeroOrbitBannerJson>) => {
      setDraft((prev) => ({ ...prev, ...partial }));
    },
    [setDraft],
  );

  const patchKidLarge = React.useCallback(
    (partial: Partial<OrbitBannerKidPlacement>) => {
      setDraft((prev) => ({
        ...prev,
        kid: {
          ...prev.kid,
          large: { ...(prev.kid.large ?? prev.kid.desktop ?? {}), ...partial },
          desktop: undefined,
        },
      }));
    },
    [setDraft],
  );

  const patchKidMedium = React.useCallback(
    (partial: Partial<OrbitBannerKidPlacement>) => {
      setDraft((prev) => ({
        ...prev,
        kid: {
          ...prev.kid,
          medium: { ...prev.kid.medium, ...partial },
        },
      }));
    },
    [setDraft],
  );

  const patchKidMobile = React.useCallback(
    (partial: Partial<OrbitBannerKidPlacement>) => {
      setDraft((prev) => ({
        ...prev,
        kid: {
          ...prev.kid,
          mobile: { ...prev.kid.mobile, ...partial },
        },
      }));
    },
    [setDraft],
  );

  const patchOrbit = React.useCallback(
    (partial: Partial<HomeHeroOrbitBannerJson['orbit']>) => {
      setDraft((prev) => ({
        ...prev,
        orbit: { ...prev.orbit, ...partial },
      }));
    },
    [setDraft],
  );

  const patchOrbitLayoutBp = React.useCallback(
    (bp: 'large' | 'medium' | 'mobile', partial: Partial<OrbitBannerOrbitLayout>) => {
      setDraft((prev) => {
        const nextBucket = { ...(prev.orbit[bp] ?? {}), ...partial };
        const nextOrbit: HomeHeroOrbitBannerJson['orbit'] = {
          ...prev.orbit,
          [bp]: nextBucket,
        };
        if (bp === 'large') {
          if (partial.radiusPx !== undefined) nextOrbit.radiusPx = partial.radiusPx;
          if (partial.centerOffsetXPx !== undefined) nextOrbit.centerOffsetXPx = partial.centerOffsetXPx;
          if (partial.centerOffsetYPx !== undefined) nextOrbit.centerOffsetYPx = partial.centerOffsetYPx;
          if (partial.itemSizePx !== undefined) nextOrbit.itemSizePx = partial.itemSizePx;
          if (partial.itemCircleSizePx !== undefined) nextOrbit.itemCircleSizePx = partial.itemCircleSizePx;
        }
        return { ...prev, orbit: nextOrbit };
      });
    },
    [setDraft],
  );

  const patchTitleBlock = React.useCallback(
    (bp: 'large' | 'medium' | 'mobile', partial: Partial<OrbitBannerTitleBlockPlacement>) => {
      setDraft((prev) => ({
        ...prev,
        titleBlock: {
          ...(prev.titleBlock ?? {}),
          [bp]: { ...(prev.titleBlock?.[bp] ?? {}), ...partial },
        },
      }));
    },
    [setDraft],
  );

  const patchBg = React.useCallback(
    (partial: Partial<NonNullable<HomeHeroOrbitBannerJson['background']>>) => {
      setDraft((prev) => ({
        ...prev,
        background: { ...(prev.background ?? {}), ...partial },
      }));
    },
    [setDraft],
  );

  const patchItem = React.useCallback(
    (index: number, partial: Partial<OrbitBannerItemJson>) => {
      setDraft((prev) => {
        const items = [...prev.items];
        items[index] = { ...items[index], ...partial };
        return { ...prev, items };
      });
    },
    [setDraft],
  );

  const addItem = React.useCallback(() => {
    setDraft((prev) => ({
      ...prev,
      items: [...prev.items, { image: '', href: '/products' }],
    }));
  }, [setDraft]);

  const removeItem = React.useCallback(
    (index: number) => {
      setDraft((prev) => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    },
    [setDraft],
  );

  const copyJson = React.useCallback(async () => {
    const text = orbitConfigToCopyableJson(draft);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this JSON:', text);
    }
  }, [draft]);

  const reshuffleTilts = React.useCallback(() => {
    patchOrbit({
      randomizeItemTilt: true,
      itemTiltSeed: (draft.orbit.itemTiltSeed ?? 1) + 1,
    });
  }, [draft.orbit.itemTiltSeed, patchOrbit]);

  const kidEff = resolveKidPlacements(draft.kid);
  const orbitEff = resolveOrbitLayouts(draft.orbit);
  const titleBlockEff = resolveTitleBlockOffsets(draft.titleBlock);
  const overlayPct = Math.round(((draft.background?.overlayWhiteOpacity ?? 0) * 100 + Number.EPSILON) * 10) / 10;
  const globalItemDisplayMode: OrbitItemDisplayMode =
    draft.orbit.itemDisplayMode ??
    (draft.orbit.itemWhiteRect != null ? (draft.orbit.itemWhiteRect ? 'rectangle' : 'transparent') : 'rectangle');

  const openButtonPos = panelSide === 'left' ? 'left-3 md:left-4' : 'right-3 md:right-4';
  const panelSideClass =
    panelSide === 'left'
      ? 'left-0 border-r md:left-4 md:rounded-r-lg'
      : 'right-0 border-l md:right-4 md:rounded-l-lg';
  const closedTranslateClass = panelSide === 'left' ? '-translate-x-full' : 'translate-x-full';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-3 z-[200] rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          openButtonPos,
          open && 'pointer-events-none opacity-0',
        )}
      >
        Orbit tuner
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
          'fixed bottom-0 top-0 z-[200] flex w-full max-w-[320px] flex-col border-border bg-card shadow-2xl transition-transform duration-200 md:bottom-4 md:top-4 md:max-h-[calc(100vh-2rem)] md:border',
          panelSideClass,
          open ? 'translate-x-0' : `${closedTranslateClass} pointer-events-none`,
        )}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <h2 className="text-xs font-semibold">Orbit hero tuner</h2>
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
            Copy JSON and replace <code className="rounded bg-muted px-1">orbitBanner</code> in{' '}
            <code className="rounded bg-muted px-1">public/data/home/hero.json</code>. Copy always includes{' '}
            <strong>all</strong> breakpoints; kid / orbit layout / title nudge fields below follow your current
            window width ({viewportBpLabels[viewportBp]}).
          </p>

          <div className="flex flex-col gap-3 text-xs">
            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Panel</legend>
              <FieldRow label="Panel side">
                <select
                  className={inputClass}
                  value={panelSide}
                  onChange={(e) => onPanelSideChange(e.target.value as PanelSide)}
                >
                  <option value="right">right</option>
                  <option value="left">left</option>
                </select>
              </FieldRow>
              <div className="flex flex-wrap gap-1.5">
                <Button type="button" size="sm" onClick={copyJson}>
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={onReset}>
                  Reset
                </Button>
              </div>
            </fieldset>

            <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-muted/30 p-1">
              <button
                type="button"
                className={cn(
                  'rounded px-2 py-1 text-[11px] font-medium',
                  activeTab === 'text' ? 'bg-background shadow-sm' : 'text-muted-foreground',
                )}
                onClick={() => setActiveTab('text')}
              >
                Text
              </button>
              <button
                type="button"
                className={cn(
                  'rounded px-2 py-1 text-[11px] font-medium',
                  activeTab === 'image' ? 'bg-background shadow-sm' : 'text-muted-foreground',
                )}
                onClick={() => setActiveTab('image')}
              >
                Image
              </button>
              <button
                type="button"
                className={cn(
                  'rounded px-2 py-1 text-[11px] font-medium',
                  activeTab === 'product' ? 'bg-background shadow-sm' : 'text-muted-foreground',
                )}
                onClick={() => setActiveTab('product')}
              >
                Product
              </button>
            </div>

            {activeTab === 'text' ? (
              <>
            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Content</legend>
              <FieldRow label="Title line 1 (below orbit)">
                <input
                  className={inputClass}
                  value={draft.titleLine1 ?? ''}
                  onChange={(e) =>
                    patch({
                      titleLine1: e.target.value || undefined,
                    })
                  }
                />
              </FieldRow>
              <FieldRow label="Title line 2 (above orbit)">
                <input
                  className={inputClass}
                  value={draft.titleLine2 ?? ''}
                  onChange={(e) =>
                    patch({
                      titleLine2: e.target.value || undefined,
                    })
                  }
                />
              </FieldRow>
              <label className="flex cursor-pointer items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.titleLine2RainbowGradient === true}
                  onChange={(e) =>
                    patch({
                      titleLine2RainbowGradient: e.target.checked ? true : undefined,
                    })
                  }
                />
                Rainbow gradient on title line 2 (split title only)
              </label>
              <FieldRow label="Title (single line fallback)">
                <input
                  className={inputClass}
                  placeholder="Used if both lines above are empty"
                  value={draft.title ?? ''}
                  onChange={(e) => patch({ title: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Title size">
                <select
                  className={inputClass}
                  value={draft.titleSize ?? 'md'}
                  onChange={(e) => patch({ titleSize: e.target.value as HeroTextSizeOption })}
                >
                  {textSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Subtitle">
                <input
                  className={inputClass}
                  value={draft.subtitle ?? ''}
                  onChange={(e) => patch({ subtitle: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Subtitle size">
                <select
                  className={inputClass}
                  value={draft.subtitleSize ?? 'md'}
                  onChange={(e) => patch({ subtitleSize: e.target.value as HeroTextSizeOption })}
                >
                  {textSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Logo height (px)">
                <NumberInput
                  value={draft.logoHeightPx}
                  min={20}
                  step={5}
                  onChange={(next) => patch({ logoHeightPx: next })}
                />
              </FieldRow>
            </fieldset>

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">
                Title block position
              </legend>
              <p className="text-[10px] text-muted-foreground">
                Nudges the logo + title + subtitle + CTA column vertically (px). Negative moves up, positive
                moves down. Editing <strong>{viewportBpLabels[viewportBp]}</strong>; omitted values inherit from
                the next larger size.
              </p>
              <FieldRow label={`Offset Y (px) — ${viewportBpLabels[viewportBp]}`}>
                <NumberInput
                  step={5}
                  value={
                    draft.titleBlock?.[viewportBp]?.offsetYPx ?? titleBlockEff[viewportBp]
                  }
                  onChange={(next) => patchTitleBlock(viewportBp, { offsetYPx: next })}
                />
              </FieldRow>
            </fieldset>

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Layout</legend>
              <FieldRow label="Section className (Tailwind)">
                <input
                  className={inputClass}
                  value={draft.className ?? ''}
                  onChange={(e) => patch({ className: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="minHeightClassName">
                <input
                  className={inputClass}
                  value={draft.minHeightClassName ?? ''}
                  onChange={(e) => patch({ minHeightClassName: e.target.value || undefined })}
                />
              </FieldRow>
            </fieldset>

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Buttons</legend>
              <FieldRow label="Primary text">
                <input
                  className={inputClass}
                  value={draft.ctaText ?? ''}
                  onChange={(e) => patch({ ctaText: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Primary href">
                <input
                  className={inputClass}
                  value={draft.ctaHref ?? ''}
                  onChange={(e) => patch({ ctaHref: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Secondary text">
                <input
                  className={inputClass}
                  value={draft.secondaryCtaText ?? ''}
                  onChange={(e) => patch({ secondaryCtaText: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Secondary href">
                <input
                  className={inputClass}
                  value={draft.secondaryCtaHref ?? ''}
                  onChange={(e) => patch({ secondaryCtaHref: e.target.value || undefined })}
                />
              </FieldRow>
            </fieldset>
              </>
            ) : null}

            {activeTab === 'image' ? (
              <>
            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Background</legend>
              <FieldRow label="Image URL / path">
                <input
                  className={inputClass}
                  value={draft.background?.image ?? ''}
                  onChange={(e) => patchBg({ image: e.target.value || undefined })}
                />
              </FieldRow>
              {draft.background?.variants != null && draft.background.variants.length > 0 ? (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Variant</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {draft.background.variants.map((_, i) => {
                      const active = (draft.background?.variantIndex ?? 0) === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => patchBg({ variantIndex: i })}
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium transition',
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <FieldRow label="Alt">
                <input
                  className={inputClass}
                  value={draft.background?.alt ?? ''}
                  onChange={(e) => patchBg({ alt: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label="Fallback color">
                <input
                  className={inputClass}
                  value={draft.background?.fallbackColor ?? ''}
                  onChange={(e) => patchBg({ fallbackColor: e.target.value || undefined })}
                />
              </FieldRow>
              <FieldRow label={`White overlay (${overlayPct}%)`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={Math.round((draft.background?.overlayWhiteOpacity ?? 0) * 100)}
                  onChange={(e) =>
                    patchBg({ overlayWhiteOpacity: Number(e.target.value) / 100 })
                  }
                />
              </FieldRow>
            </fieldset>

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Kid</legend>
              <FieldRow label="Image URL / path">
                <input
                  className={inputClass}
                  value={draft.kid.image ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      kid: { ...prev.kid, image: e.target.value || undefined },
                    }))
                  }
                />
              </FieldRow>
              {draft.kid.variants != null && draft.kid.variants.length > 0 ? (
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Variant</label>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {draft.kid.variants.map((_, i) => {
                      const active = (draft.kid.variantIndex ?? 0) === i;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              kid: { ...prev.kid, variantIndex: i },
                            }))
                          }
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-md border text-xs font-medium transition',
                            active
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border bg-background text-muted-foreground hover:border-primary/50',
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              <FieldRow label="Alt">
                <input
                  className={inputClass}
                  value={draft.kid.alt ?? ''}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      kid: { ...prev.kid, alt: e.target.value || undefined },
                    }))
                  }
                />
              </FieldRow>
              <p className="text-[10px] text-muted-foreground">
                Anchor position (%) and width (px). Editing <strong>{viewportBpLabels[viewportBp]}</strong>;
                resize the window to tune other breakpoints. Omitted fields inherit from the next larger size.
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">{viewportBpLabels[viewportBp]}</p>
              <div className="grid grid-cols-3 gap-1.5">
                <FieldRow label="X %">
                  <NumberInput
                    value={
                      viewportBp === 'large'
                        ? (draft.kid.large?.xPercent ??
                            draft.kid.desktop?.xPercent ??
                            kidEff.large.xPercent)
                        : viewportBp === 'medium'
                          ? (draft.kid.medium?.xPercent ?? kidEff.medium.xPercent)
                          : (draft.kid.mobile?.xPercent ?? kidEff.mobile.xPercent)
                    }
                    onChange={(next) =>
                      (viewportBp === 'large'
                        ? patchKidLarge
                        : viewportBp === 'medium'
                          ? patchKidMedium
                          : patchKidMobile)({ xPercent: next })
                    }
                  />
                </FieldRow>
                <FieldRow label="Y %">
                  <NumberInput
                    value={
                      viewportBp === 'large'
                        ? (draft.kid.large?.yPercent ??
                            draft.kid.desktop?.yPercent ??
                            kidEff.large.yPercent)
                        : viewportBp === 'medium'
                          ? (draft.kid.medium?.yPercent ?? kidEff.medium.yPercent)
                          : (draft.kid.mobile?.yPercent ?? kidEff.mobile.yPercent)
                    }
                    onChange={(next) =>
                      (viewportBp === 'large'
                        ? patchKidLarge
                        : viewportBp === 'medium'
                          ? patchKidMedium
                          : patchKidMobile)({ yPercent: next })
                    }
                  />
                </FieldRow>
                <FieldRow label="Width px">
                  <NumberInput
                    value={
                      viewportBp === 'large'
                        ? (draft.kid.large?.widthPx ??
                            draft.kid.desktop?.widthPx ??
                            kidEff.large.widthPx)
                        : viewportBp === 'medium'
                          ? (draft.kid.medium?.widthPx ?? kidEff.medium.widthPx)
                          : (draft.kid.mobile?.widthPx ?? kidEff.mobile.widthPx)
                    }
                    onChange={(next) =>
                      (viewportBp === 'large'
                        ? patchKidLarge
                        : viewportBp === 'medium'
                          ? patchKidMedium
                          : patchKidMobile)({ widthPx: next })
                    }
                  />
                </FieldRow>
              </div>
            </fieldset>
              </>
            ) : null}

            {activeTab === 'product' ? (
              <>
            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Orbit layout</legend>
              <p className="text-[10px] text-muted-foreground">
                Radius, center offset, default item size, and circle accent (circleAccent mode). Editing{' '}
                <strong>{viewportBpLabels[viewportBp]}</strong>; resize the window to tune other breakpoints.
                Omitted fields inherit from the next larger size.
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">{viewportBpLabels[viewportBp]}</p>
              <FieldRow label="Radius (px)">
                <NumberInput
                  value={orbitEff[viewportBp].radiusPx}
                  onChange={(next) => patchOrbitLayoutBp(viewportBp, { radiusPx: next })}
                />
              </FieldRow>
              <div className="grid grid-cols-2 gap-1.5">
                <FieldRow label="Center offset X (px)">
                  <NumberInput
                    value={orbitEff[viewportBp].centerOffsetXPx}
                    onChange={(next) => patchOrbitLayoutBp(viewportBp, { centerOffsetXPx: next })}
                  />
                </FieldRow>
                <FieldRow label="Center offset Y (px)">
                  <NumberInput
                    value={orbitEff[viewportBp].centerOffsetYPx}
                    onChange={(next) => patchOrbitLayoutBp(viewportBp, { centerOffsetYPx: next })}
                  />
                </FieldRow>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <FieldRow label="Default item size (px)">
                  <NumberInput
                    value={orbitEff[viewportBp].itemSizePx}
                    onChange={(next) => patchOrbitLayoutBp(viewportBp, { itemSizePx: next })}
                  />
                </FieldRow>
                {globalItemDisplayMode === 'circleAccent' ? (
                  <FieldRow label="Circle size (px)">
                    <NumberInput
                      value={orbitEff[viewportBp].itemCircleSizePx}
                      min={4}
                      step={5}
                      onChange={(next) =>
                        patchOrbitLayoutBp(viewportBp, {
                          itemCircleSizePx: next != null && next > 0 ? next : undefined,
                        })
                      }
                    />
                  </FieldRow>
                ) : null}
              </div>
              <FieldRow label="Item display mode (all items)">
                <select
                  className={inputClass}
                  value={globalItemDisplayMode}
                  onChange={(e) => {
                    const nextMode = e.target.value as OrbitItemDisplayMode;
                    patchOrbit({
                      itemDisplayMode: nextMode,
                      itemWhiteRect:
                        nextMode === 'rectangle' ? true : nextMode === 'transparent' ? false : undefined,
                    });
                  }}
                >
                  {itemDisplayModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {mode}
                    </option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Direction">
                <select
                  className={inputClass}
                  value={draft.orbit.direction ?? 'clockwise'}
                  onChange={(e) => patchOrbit({ direction: e.target.value as OrbitDirection })}
                >
                  <option value="clockwise">clockwise</option>
                  <option value="counterClockwise">counterClockwise</option>
                </select>
              </FieldRow>
              <FieldRow label="Speed style">
                <select
                  className={inputClass}
                  value={draft.orbit.speedStyle ?? 'linear'}
                  onChange={(e) => patchOrbit({ speedStyle: e.target.value as OrbitSpeedStyle })}
                >
                  <option value="linear">linear</option>
                  <option value="oscillating">oscillating</option>
                </select>
              </FieldRow>
              <div className="grid grid-cols-2 gap-1.5">
                <FieldRow label="Oscillation height (%)">
                  <NumberInput
                    value={draft.orbit.oscillationHeight}
                    min={0}
                    max={95}
                    step={5}
                    onChange={(next) => patchOrbit({ oscillationHeight: next })}
                  />
                </FieldRow>
                <FieldRow label="Oscillation frequency">
                  <NumberInput
                    value={draft.orbit.oscillationFrequency}
                    min={0.25}
                    step={0.25}
                    onChange={(next) => patchOrbit({ oscillationFrequency: next })}
                  />
                </FieldRow>
              </div>
              <FieldRow label="Speed (seconds / revolution)">
                <NumberInput
                  value={draft.orbit.speedSeconds}
                  min={1}
                  onChange={(next) => patchOrbit({ speedSeconds: next })}
                />
              </FieldRow>
              <FieldRow label="Start angle (deg)">
                <NumberInput
                  value={draft.orbit.startAngleDeg}
                  onChange={(next) => patchOrbit({ startAngleDeg: next })}
                />
              </FieldRow>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.orbit.keepItemsUpright ?? true}
                  onChange={(e) => patchOrbit({ keepItemsUpright: e.target.checked })}
                />
                Keep products upright (no spin)
              </label>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.orbit.randomizeItemTilt ?? false}
                  onChange={(e) => patchOrbit({ randomizeItemTilt: e.target.checked })}
                />
                Randomize per-item tilt
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <FieldRow label="Tilt min deg">
                  <NumberInput
                    value={draft.orbit.itemTiltMinDeg}
                    min={0}
                    step={1}
                    onChange={(next) => patchOrbit({ itemTiltMinDeg: next })}
                  />
                </FieldRow>
                <FieldRow label="Tilt max deg">
                  <NumberInput
                    value={draft.orbit.itemTiltMaxDeg}
                    min={0}
                    step={1}
                    onChange={(next) => patchOrbit({ itemTiltMaxDeg: next })}
                  />
                </FieldRow>
                <FieldRow label="Tilt seed">
                  <NumberInput
                    value={draft.orbit.itemTiltSeed}
                    step={1}
                    onChange={(next) => patchOrbit({ itemTiltSeed: next })}
                  />
                </FieldRow>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={reshuffleTilts}>
                Reshuffle item tilts
              </Button>
              <label className="flex items-center gap-2 text-[11px]">
                <input
                  type="checkbox"
                  checked={draft.orbit.showCenterPoint ?? true}
                  onChange={(e) => patchOrbit({ showCenterPoint: e.target.checked })}
                />
                Show orbit center point
              </label>
            </fieldset>

            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Orbit items</legend>
              {draft.items.map((item, i) => {
                return (
                <div key={i} className="space-y-2 rounded-md bg-muted/40 p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">Item {i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(i)}>
                      Remove
                    </Button>
                  </div>
                  <FieldRow label="Image">
                    <input
                      className={inputClass}
                      value={item.image ?? ''}
                      onChange={(e) => patchItem(i, { image: e.target.value || undefined })}
                    />
                  </FieldRow>
                  <FieldRow label="Href">
                    <input
                      className={inputClass}
                      value={item.href ?? ''}
                      onChange={(e) => patchItem(i, { href: e.target.value || undefined })}
                    />
                  </FieldRow>
                  {globalItemDisplayMode === 'rectangle' ? (
                    <FieldRow label="Rectangle bg hex (e.g. #ffffff)">
                      <input
                        className={inputClass}
                        value={item.backgroundColorHex ?? ''}
                        onChange={(e) =>
                          patchItem(i, {
                            backgroundColorHex: e.target.value || undefined,
                          })
                        }
                      />
                    </FieldRow>
                  ) : null}
                  {globalItemDisplayMode === 'circleAccent' ? (
                    <>
                      <FieldRow label="Circle color hex (e.g. #22d3ee)">
                        <input
                          className={inputClass}
                          value={item.circleColorHex ?? ''}
                          onChange={(e) =>
                            patchItem(i, {
                              circleColorHex: e.target.value || undefined,
                            })
                          }
                        />
                      </FieldRow>
                    </>
                  ) : null}
                  <FieldRow label="Size override (px)">
                    <NumberInput
                      value={item.sizePx}
                      onChange={(next) => {
                        patchItem(i, { sizePx: next != null && next > 0 ? next : undefined });
                      }}
                    />
                  </FieldRow>
                  <label className="flex items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={item.placeholder === true}
                      onChange={(e) =>
                        patchItem(i, { placeholder: e.target.checked ? true : undefined })
                      }
                    />
                    Force placeholder (gray block)
                  </label>
                </div>
                );
              })}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                Add item
              </Button>
            </fieldset>
              </>
            ) : null}
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
