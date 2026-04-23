/** Site base path for links and asset URLs. */
export function getBase(): string {
  try {
    const base = import.meta.env.BASE_URL || '/';
    return base.endsWith('/') ? base.slice(0, -1) : base;
  } catch {
    return '';
  }
}
