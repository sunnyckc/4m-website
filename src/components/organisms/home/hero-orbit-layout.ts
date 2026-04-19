import type { HomeHeroOrbitBannerJson } from '@/types/home-sections';

export type KidPlacementResolved = { xPercent: number; yPercent: number; widthPx: number };

export function resolveKidPlacements(kid: HomeHeroOrbitBannerJson['kid']): {
  large: KidPlacementResolved;
  medium: KidPlacementResolved;
  mobile: KidPlacementResolved;
} {
  const defaults: KidPlacementResolved = { xPercent: 76, yPercent: 100, widthPx: 700 };
  const largeRaw = kid.large ?? kid.desktop ?? {};
  const large: KidPlacementResolved = {
    xPercent: largeRaw.xPercent ?? defaults.xPercent,
    yPercent: largeRaw.yPercent ?? defaults.yPercent,
    widthPx: largeRaw.widthPx ?? defaults.widthPx,
  };
  const mediumRaw = kid.medium ?? {};
  const medium: KidPlacementResolved = {
    xPercent: mediumRaw.xPercent ?? large.xPercent,
    yPercent: mediumRaw.yPercent ?? large.yPercent,
    widthPx: mediumRaw.widthPx ?? large.widthPx,
  };
  const mobileRaw = kid.mobile ?? {};
  const mobile: KidPlacementResolved = {
    xPercent: mobileRaw.xPercent ?? medium.xPercent,
    yPercent: mobileRaw.yPercent ?? medium.yPercent,
    widthPx: mobileRaw.widthPx ?? medium.widthPx,
  };
  return { large, medium, mobile };
}

export type OrbitLayoutResolved = {
  radiusPx: number;
  centerOffsetXPx: number;
  centerOffsetYPx: number;
  itemSizePx: number;
  itemCircleSizePx: number;
};

export function resolveOrbitLayouts(orbit: HomeHeroOrbitBannerJson['orbit']): {
  large: OrbitLayoutResolved;
  medium: OrbitLayoutResolved;
  mobile: OrbitLayoutResolved;
} {
  const seed = {
    radiusPx: orbit.radiusPx ?? 250,
    centerOffsetXPx: orbit.centerOffsetXPx ?? -180,
    centerOffsetYPx: orbit.centerOffsetYPx ?? -300,
    itemSizePx: orbit.itemSizePx ?? 72,
    itemCircleSizePx: orbit.itemCircleSizePx,
  };
  const largeP = { ...seed, ...orbit.large };
  const mediumP = { ...largeP, ...orbit.medium };
  const mobileP = { ...mediumP, ...orbit.mobile };

  const finalize = (p: typeof largeP): OrbitLayoutResolved => {
    const itemSizePx = p.itemSizePx!;
    return {
      radiusPx: p.radiusPx!,
      centerOffsetXPx: p.centerOffsetXPx!,
      centerOffsetYPx: p.centerOffsetYPx!,
      itemSizePx,
      itemCircleSizePx: Math.max(4, p.itemCircleSizePx ?? Math.round(itemSizePx * 0.62)),
    };
  };

  return {
    large: finalize(largeP),
    medium: finalize(mediumP),
    mobile: finalize(mobileP),
  };
}

export function resolveTitleBlockOffsets(
  titleBlock: HomeHeroOrbitBannerJson['titleBlock'] | undefined,
): { large: number; medium: number; mobile: number } {
  const large = titleBlock?.large?.offsetYPx ?? 0;
  const medium = titleBlock?.medium?.offsetYPx ?? large;
  const mobile = titleBlock?.mobile?.offsetYPx ?? medium;
  return { large, medium, mobile };
}
