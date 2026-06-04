import { cn } from "@/lib/utils";

/**
 * `<Skeleton />` — shimmer placeholder Stitch Quiet-Luxury. Puro CSS, 0 JS.
 * Respeta `prefers-reduced-motion` (sin shimmer, solo color sólido).
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl bg-[var(--color-surface-3)]",
        "animate-[shimmer_1.5s_ease-in-out_infinite]",
        "motion-reduce:animate-none",
        className,
      )}
    />
  );
}

/** Card-shaped skeleton for cleaner cards in the grid. */
export function CleanerCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-white)] p-6 shadow-[var(--shadow-ambient)]">
      <div className="flex items-start gap-3.5">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
      <div className="mt-4 flex gap-1.5">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-[var(--color-line)] pt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/** Grid of skeleton cards — matches the CleanersBrowser grid. */
export function CleanersGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <CleanerCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Profile page skeleton — identity + sidebar + sections. */
export function ProfileSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
