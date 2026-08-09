import { STATUS_LABELS, type TicketStatus } from "@/types";
import { cn } from "@/lib/utils";

export type StatusFilterValue = TicketStatus | "all";

const options: { value: StatusFilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: STATUS_LABELS.open },
  { value: "in_progress", label: STATUS_LABELS.in_progress },
  { value: "closed", label: STATUS_LABELS.closed },
];

export function StatusFilter({
  value,
  onChange,
}: {
  value: StatusFilterValue;
  onChange: (value: StatusFilterValue) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter tickets by status"
      className="flex w-full gap-1 rounded-xl border border-border bg-card p-1 shadow-xs sm:w-auto"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition sm:flex-none",
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
