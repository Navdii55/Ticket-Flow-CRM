import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { FiCompass } from "react-icons/fi";



function NotFoundPage() {
  usePageMeta(
    "Page Not Found — HelpDesk CRM",
    "The page you're looking for doesn't exist.",
  );
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <FiCompass className="size-6" />
        </span>
        <p className="mt-6 text-6xl font-bold tracking-tight text-primary">404</p>
        <h1 className="mt-2 text-xl font-semibold">This page took a wrong turn</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
