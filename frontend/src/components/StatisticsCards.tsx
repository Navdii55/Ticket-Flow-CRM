import { FiInbox, FiClock, FiCheckCircle, FiLayers } from "react-icons/fi";
import type { IconType } from "react-icons";

import type { TicketStats } from "@/types";
import type { StatusFilterValue } from "@/components/StatusFilter";
import { cn } from "@/lib/utils";

interface StatItem {
  key: keyof TicketStats;
  label: string;
  icon: IconType;
  tone: string;
  filter: StatusFilterValue;
}

const items: StatItem[] = [
  {
    key: "total",
    label: "Total Tickets",
    icon: FiLayers,
    tone: "bg-accent text-accent-foreground",
    filter: "all",
  },
  {
    key: "open",
    label: "Open",
    icon: FiInbox,
    tone: "bg-info text-info-foreground",
    filter: "open",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: FiClock,
    tone: "bg-warning text-warning-foreground",
    filter: "in_progress",
  },
  {
    key: "closed",
    label: "Closed",
    icon: FiCheckCircle,
    tone: "bg-success text-success-foreground",
    filter: "closed",
  },
];

export function StatisticsCards({
  stats,
  loading,
  activeFilter,
  onSelect,
}: {
  stats: TicketStats;
  loading?: boolean;
  activeFilter?: StatusFilterValue;
  onSelect?: (filter: StatusFilterValue) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ key, label, icon: Icon, tone, filter }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect?.(filter)}
          aria-pressed={activeFilter === filter}
          className={cn(
            "rounded-2xl border border-border bg-card p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            activeFilter === filter && "border-primary ring-1 ring-primary/30",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              {loading ? (
                <div className="mt-3 h-8 w-14 animate-pulse rounded-md bg-muted" />
              ) : (
                <p className="mt-1.5 text-3xl font-bold tracking-tight tabular-nums">
                  {stats[key]}
                </p>
              )}
            </div>
            <span className={cn("grid size-10 place-items-center rounded-xl", tone)}>
              <Icon className="size-5" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
