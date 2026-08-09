import { FiInbox, FiClock, FiCheckCircle } from "react-icons/fi";
import type { IconType } from "react-icons";

import { STATUS_LABELS, type TicketStatus } from "@/types";
import { cn } from "@/lib/utils";

const styles: Record<TicketStatus, string> = {
  open: "bg-info text-info-foreground",
  in_progress: "bg-warning text-warning-foreground",
  closed: "bg-success text-success-foreground",
};

const icons: Record<TicketStatus, IconType> = {
  open: FiInbox,
  in_progress: FiClock,
  closed: FiCheckCircle,
};

export function StatusBadge({
  status,
  className,
}: {
  status: TicketStatus;
  className?: string;
}) {
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}
