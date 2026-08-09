import { Link } from "react-router-dom";
import { FiMenu, FiBell, FiPlus, FiShield } from "react-icons/fi";

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted lg:hidden"
      >
        <FiMenu className="size-4" />
      </button>

      <Link to="/" className="text-sm font-bold tracking-tight lg:hidden">
        HelpDesk
      </Link>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <Link
          to="/tickets/new"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:hidden"
        >
          <FiPlus className="size-4" />
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted"
        >
          <FiBell className="size-4" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>
        <div className="flex items-center gap-2.5 rounded-lg border border-border py-1 pr-3 pl-1">
          <span className="grid size-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <FiShield className="size-4" aria-hidden />
          </span>
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold">Administrator</p>
            <p className="text-[11px] text-muted-foreground">Support Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
