import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiPlus, FiAlertCircle } from "react-icons/fi";

import { StatisticsCards } from "@/components/StatisticsCards";
import { SearchBar } from "@/components/SearchBar";
import { StatusFilter, type StatusFilterValue } from "@/components/StatusFilter";
import { TicketTable } from "@/components/TicketTable";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { TableSkeleton, StatsSkeleton } from "@/components/Loader";
import { toast } from "@/components/Toast";
import { getTickets } from "@/services/api";
import { usePageMeta } from "@/hooks/usePageMeta";
import type { TicketStats } from "@/types";

const PAGE_SIZE = 8;



function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function Dashboard() {
  const navigate = useNavigate();
  usePageMeta(
    "Support Dashboard — HelpDesk CRM",
    "Track, filter and resolve customer support tickets from one clean dashboard.",
  );
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilterValue>("all");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounced(search);

  useEffect(() => setPage(1), [debouncedSearch, status]);

  const listQuery = useQuery({
    queryKey: ["tickets", { search: debouncedSearch, status, page }],
    queryFn: () =>
      getTickets({ search: debouncedSearch, status, page, pageSize: PAGE_SIZE }),
  });

  const allQuery = useQuery({
    queryKey: ["tickets", "all"],
    queryFn: () => getTickets({page: 1, pageSize: 100 }),
  });

  useEffect(() => {
    if (listQuery.isError) {
      toast.error("Could not load tickets", (listQuery.error as Error)?.message);
    }
  }, [listQuery.isError, listQuery.error]);


  const stats: TicketStats = useMemo(() => {
    const rows = allQuery.data?.data ?? [];
    return {
      total: allQuery.data?.total ?? 0,
      open: rows.filter((t) => t.status === "open").length,
      inProgress: rows.filter((t) => t.status === "in_progress").length,
      closed: rows.filter((t) => t.status === "closed").length,
    };
  }, [allQuery.data]);

  const tickets = listQuery.data?.data ?? [];
  const total = listQuery.data?.total ?? 0;
  const filtering = debouncedSearch.trim() !== "" || status !== "all";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Customer Support CRM Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage, monitor and resolve customer support tickets efficiently.
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="hidden h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-card transition hover:bg-primary/90 sm:inline-flex"
        >
          <FiPlus className="size-4" />
          Create Ticket
        </Link>
      </section>

      <section className="mt-6">
        {allQuery.isLoading ? (
          <StatsSkeleton />
        ) : (
          <StatisticsCards stats={stats} activeFilter={status} onSelect={setStatus} />
        )}
      </section>

      <section className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="lg:max-w-md lg:flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search Ticket ID, Customer Name, Email or Subject..."
          />
        </div>
        <div className="lg:ml-auto">
          <StatusFilter value={status} onChange={setStatus} />
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {listQuery.isLoading ? (
          <TableSkeleton rows={6} />
        ) : listQuery.isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <FiAlertCircle className="size-8 text-destructive" />
            <p className="text-sm font-semibold">We couldn't load your tickets</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {(listQuery.error as Error).message}
            </p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="mt-2 h-10 rounded-lg border border-border px-4 text-sm font-medium transition hover:bg-muted"
            >
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            variant={filtering ? "search" : "inbox"}
            title="No tickets found"
            description={
              filtering
                ? "Try changing your search or filters."
                : "Once customers reach out, their tickets will show up here."
            }
            action={
              filtering ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                  }}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/tickets/new")}
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  Create your first ticket
                </button>
              )
            }
          />

        ) : (
          <>
            <TicketTable tickets={tickets} />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
