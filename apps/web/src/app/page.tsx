import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.25) 0%, transparent 70%)" }}
      />
      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6 tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Portfolio Builder
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight">
          Build your portfolio{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            in minutes.
          </span>
        </h1>
        <p className="mt-4 font-body text-[#9090b0] max-w-md mx-auto">
          Pick a theme, pull in your GitHub projects, and publish a portfolio at your own URL.
        </p>
        <div className="mt-8 flex gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-bold text-white bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-400 hover:brightness-110 shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98]"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-foreground bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-[0.98]"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
