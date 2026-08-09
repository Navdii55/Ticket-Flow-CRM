import { FiSearch, FiX } from "react-icons/fi";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search by ID, customer, email or subject…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full">
      <FiSearch className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search tickets"
        className="h-11 w-full rounded-xl border border-border bg-card pr-10 pl-10 text-sm shadow-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/25 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <FiX className="size-4" />
        </button>
      )}
    </div>
  );
}
