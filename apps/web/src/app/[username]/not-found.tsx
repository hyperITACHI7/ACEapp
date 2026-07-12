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
        className="mt-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
      >
        Create your own portfolio
      </Link>
    </div>
  );
}
