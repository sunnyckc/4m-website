import { cn } from '@/utils';
import type { GalleryGridItem } from '@/components/organisms/home/types';
import { BatchChips } from '@/components/organisms/home/batch-chips';

const COL: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
};

const ROW: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
  5: 'row-span-5',
  6: 'row-span-6',
};

function spanClass(item: GalleryGridItem): string {
  const s = item.span;
  if (!s) {
    return 'col-span-1 row-span-1';
  }
  const parts: string[] = [];
  const order: Array<keyof NonNullable<GalleryGridItem['span']>> = [
    'default',
    'sm',
    'md',
    'lg',
    'xl',
  ];
  for (const bp of order) {
    const cell = s[bp];
    if (!cell) continue;
    const c = COL[cell.col] ?? 'col-span-1';
    const r = ROW[cell.row] ?? 'row-span-1';
    if (bp === 'default') {
      parts.push(c, r);
    } else {
      parts.push(`${bp}:${c}`, `${bp}:${r}`);
    }
  }
  if (parts.length === 0) {
    return 'col-span-1 row-span-1';
  }
  return parts.join(' ');
}

function hasGalleryCaption(item: GalleryGridItem): boolean {
  return (
    (item.batches?.length ?? 0) > 0 ||
    !!item.textPrimary?.trim() ||
    !!item.textSecondary?.trim()
  );
}

export type GalleryGridProps = {
  items: GalleryGridItem[];
  /** Tailwind grid column counts per breakpoint, e.g. `grid-cols-2 md:grid-cols-4`. */
  gridClassName?: string;
  gapClassName?: string;
  emptyMessage?: string;
  className?: string;
};

export function GalleryGrid({
  items,
  gridClassName = 'grid-cols-2 md:grid-cols-4',
  gapClassName = 'gap-4',
  emptyMessage = 'No items to show.',
  className,
}: GalleryGridProps) {
  if (!items.length) {
    return (
      <p className="text-center text-muted-foreground" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      className={cn('grid auto-rows-[minmax(120px,auto)]', gridClassName, gapClassName, className)}
    >
      {items.map((item) => {
        const showCaption = hasGalleryCaption(item);
        const inner = (
          <>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.imageAlt}
                  title={item.hoverText ?? undefined}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-muted-foreground"
                  title={item.hoverText ?? undefined}
                >
                  <span className="sr-only">{item.imageAlt}</span>
                  No image
                </div>
              )}
            </div>
            {showCaption ? (
              <div className="space-y-2 p-4">
                {item.batches?.length ? (
                  <BatchChips batches={item.batches} />
                ) : null}
                {item.textPrimary?.trim() ? (
                  <h3 className="text-lg font-semibold leading-tight">
                    {item.textPrimary}
                  </h3>
                ) : null}
                {item.textSecondary?.trim() ? (
                  <p className="text-sm text-muted-foreground">{item.textSecondary}</p>
                ) : null}
              </div>
            ) : null}
          </>
        );

        const cardClass =
          'group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:shadow-md';

        return (
          <div key={item.id} className={cn(spanClass(item))}>
            {item.href ? (
              <a
                href={item.href}
                title={item.hoverText ?? undefined}
                className={cn(cardClass, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring')}
              >
                {inner}
              </a>
            ) : (
              <article className={cardClass} title={item.hoverText ?? undefined}>
                {inner}
              </article>
            )}
          </div>
        );
      })}
    </div>
  );
}
