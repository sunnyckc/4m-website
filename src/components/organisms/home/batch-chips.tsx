import type { Batch } from '@/components/organisms/home/types';
import { cn } from '@/utils';

export function BatchChips({
  batches,
  className,
}: {
  batches: Batch[];
  className?: string;
}) {
  if (!batches.length) return null;

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {batches.map((b, i) => {
        const key = `${b.label}-${i}`;
        const pill = (
          <span className="inline-flex rounded-md border border-border bg-background/90 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
            {b.label}
          </span>
        );
        if (b.href) {
          return (
            <a key={key} href={b.href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
              {pill}
            </a>
          );
        }
        return <span key={key}>{pill}</span>;
      })}
    </div>
  );
}
