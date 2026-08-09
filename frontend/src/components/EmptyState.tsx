import type { ReactNode } from "react";
import { FiSearch, FiInbox } from "react-icons/fi";

export function EmptyState({
  title = "No tickets found",
  description = "Try changing your search or filters.",
  action,
  variant = "inbox",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "inbox" | "search";
}) {
  const Icon = variant === "search" ? FiSearch : FiInbox;
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="relative grid size-20 place-items-center rounded-3xl bg-accent text-accent-foreground">
        <span className="absolute inset-0 rounded-3xl bg-primary/5" />
        <Icon className="size-8" />
      </span>
      <h3 className="mt-5 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
