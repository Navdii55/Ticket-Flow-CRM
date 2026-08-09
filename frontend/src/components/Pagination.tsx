import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> tickets
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <FiChevronLeft className="size-4" />
        </button>
        {pages.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && p - (pages[i - 1] as number) > 1 && (
              <span className="px-1 text-muted-foreground">…</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "size-9 rounded-lg border text-sm font-medium transition",
                p === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {p}
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
        >
          <FiChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
