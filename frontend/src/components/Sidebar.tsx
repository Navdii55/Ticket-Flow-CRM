import { Link, useLocation } from "react-router-dom";
import { FiGrid, FiPlusCircle, FiLifeBuoy, FiX } from "react-icons/fi";
import type { IconType } from "react-icons";

import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to: "/" | "/tickets/new";
  icon: IconType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: FiGrid },
  { label: "Create Ticket", to: "/tickets/new", icon: FiPlusCircle },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useLocation().pathname;

  return (
    <nav className="flex flex-col gap-1 p-3">
      <p className="px-3 pt-2 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        Workspace
      </p>
      {navItems.map(({ label, to, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <FiLifeBuoy className="size-5" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-bold tracking-tight">HelpDesk</p>
        <p className="text-xs text-muted-foreground">Support CRM</p>
      </div>
    </div>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <Brand />
        <NavLinks />
        <div className="mx-3 mt-4 rounded-xl bg-accent p-4">
          <p className="text-sm font-semibold text-accent-foreground">Need a hand?</p>
          <p className="mt-1 text-xs text-accent-foreground/80">
            Browse the agent playbook for response templates and SLA rules.
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={onClose} aria-hidden />
          <aside className="relative h-full w-72 border-r border-sidebar-border bg-sidebar">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute top-4 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
            >
              <FiX className="size-4" />
            </button>
            <Brand />
            <NavLinks onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  );
}
