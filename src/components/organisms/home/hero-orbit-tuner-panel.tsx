import * as React from 'react';

import { Button } from '@/components/ui/react/button';
import { cn } from '@/utils';
import type {
  HeroTextSizeOption,
  HomeHeroOrbitBannerJson,
  OrbitBannerItemJson,
  OrbitDirection,
  OrbitItemDisplayMode,
  OrbitSpeedStyle,
} from '@/types/home-sections';

const PANEL_SIDE_KEY = 'orbit-tuner-side';
type PanelSide = 'left' | 'right';
type TunerTab = 'text' | 'image' | 'product';

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

  const patchKidDesktop = React.useCallback(
    (partial: Partial<HomeHeroOrbitBannerJson['kid']['desktop']>) => {
      setDraft((prev) => ({
        ...prev,
        kid: {
          ...prev.kid,
          desktop: { ...prev.kid.desktop, ...partial },
        },
      }));
    },
    [setDraft],
  );

  const patchKidMobile = React.useCallback(
    (partial: Partial<NonNullable<HomeHeroOrbitBannerJson['kid']['mobile']>>) => {
      setDraft((prev) => ({
        ...prev,
        kid: {
          ...prev.kid,
          mobile: { ...(prev.kid.mobile ?? prev.kid.desktop), ...partial },
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

  const mobile = draft.kid.mobile ?? draft.kid.desktop;
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
            <code className="rounded bg-muted px-1">public/data/home/hero.json</code>.
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
              <p className="text-[11px] font-medium text-muted-foreground">Desktop anchor</p>
              <div className="grid grid-cols-3 gap-1.5">
                <FieldRow label="X %">
                  <NumberInput
                    value={draft.kid.desktop.xPercent}
                    onChange={(next) => patchKidDesktop({ xPercent: next })}
                  />
                </FieldRow>
                <FieldRow label="Y %">
                  <NumberInput
                    value={draft.kid.desktop.yPercent}
                    onChange={(next) => patchKidDesktop({ yPercent: next })}
                  />
                </FieldRow>
                <FieldRow label="Width px">
                  <NumberInput
                    value={draft.kid.desktop.widthPx}
                    onChange={(next) => patchKidDesktop({ widthPx: next })}
                  />
                </FieldRow>
              </div>
              <p className="text-[11px] font-medium text-muted-foreground">Mobile anchor</p>
              <div className="grid grid-cols-3 gap-1.5">
                <FieldRow label="X %">
                  <NumberInput
                    value={mobile.xPercent}
                    onChange={(next) => patchKidMobile({ xPercent: next })}
                  />
                </FieldRow>
                <FieldRow label="Y %">
                  <NumberInput
                    value={mobile.yPercent}
                    onChange={(next) => patchKidMobile({ yPercent: next })}
                  />
                </FieldRow>
                <FieldRow label="Width px">
                  <NumberInput
                    value={mobile.widthPx}
                    onChange={(next) => patchKidMobile({ widthPx: next })}
                  />
                </FieldRow>
              </div>
            </fieldset>
              </>
            ) : null}

            {activeTab === 'product' ? (
              <>
            <fieldset className="space-y-2 rounded-md border border-border p-2">
              <legend className="px-1 text-[10px] font-semibold uppercase tracking-wide">Orbit</legend>
              <FieldRow label="Radius (px)">
                <NumberInput
                  value={draft.orbit.radiusPx}
                  onChange={(next) => patchOrbit({ radiusPx: next })}
                />
              </FieldRow>
              <div className="grid grid-cols-2 gap-1.5">
                <FieldRow label="Center offset X (px)">
                  <NumberInput
                    value={draft.orbit.centerOffsetXPx}
                    onChange={(next) => patchOrbit({ centerOffsetXPx: next })}
                  />
                </FieldRow>
                <FieldRow label="Center offset Y (px)">
                  <NumberInput
                    value={draft.orbit.centerOffsetYPx}
                    onChange={(next) => patchOrbit({ centerOffsetYPx: next })}
                  />
                </FieldRow>
              </div>
              <FieldRow label="Default item size (px)">
                <NumberInput
                  value={draft.orbit.itemSizePx}
                  onChange={(next) => patchOrbit({ itemSizePx: next })}
                />
              </FieldRow>
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
              {globalItemDisplayMode === 'circleAccent' ? (
                <FieldRow label="Circle size (px, all items)">
                  <NumberInput
                    value={draft.orbit.itemCircleSizePx}
                    min={4}
                    step={5}
                    onChange={(next) =>
                      patchOrbit({ itemCircleSizePx: next != null && next > 0 ? next : undefined })
                    }
                  />
                </FieldRow>
              ) : null}
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
