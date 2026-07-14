import Link from "next/link";

export default function PortfolioNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-2xl font-bold">Portfolio not found</h1>
      <p className="text-sm font-body text-muted-foreground mt-2 max-w-sm">
        This portfolio doesn&apos;t exist, isn&apos;t published yet, or the link is wrong.
      </p>
      <Link
        href="/signup"
        className="mt-6 inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.98]"
      >
        Create your own portfolio
      </Link>
    </div>
  );
}
