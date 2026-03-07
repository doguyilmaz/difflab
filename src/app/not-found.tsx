import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 font-sans">
      <h1 className="text-6xl font-bold text-text-muted">404</h1>
      <p className="text-text-secondary">Page not found.</p>
      <Link
        href="/"
        className="rounded-md border border-border bg-bg-surface px-4 py-2 text-sm text-text-secondary transition-colors hover:border-border-focus hover:text-text"
      >
        Back to DiffLab
      </Link>
    </div>
  );
}
