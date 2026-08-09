export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <span className="size-8 animate-spin rounded-full border-2 border-border border-t-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ cards = 4 }: { cards?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-8 w-14 animate-pulse rounded-md bg-muted" />
            </div>
            <div className="size-10 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TicketDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="h-4 w-36 animate-pulse rounded bg-muted" />
      <div className="mt-5 space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-muted" />
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
