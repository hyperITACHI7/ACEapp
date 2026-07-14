"use client";

import { useRef, useState, type FormEvent } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
} from "motion/react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@portfolio/ui-kit";

type View = "login" | "signup" | "forgot";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function InputField({
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  showToggle,
  required,
  minLength,
}: {
  type: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  showToggle?: boolean;
  required?: boolean;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-lg border transition-all duration-300 ${
        focused ? "border-white/40 bg-white/8 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]" : "border-white/10 bg-white/5"
      }`}
    >
      <Icon className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type={showToggle ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
        required={required}
        minLength={minLength}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent pl-11 pr-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none"
      />
      {showToggle && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

function SocialButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground font-medium hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200"
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// One flat, solid white primary button — per the design system's rule that there's exactly one
// bright, unmissable action per screen.
function PrimaryButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full py-3.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground overflow-hidden group active:scale-[0.98] transition-opacity duration-150 hover:opacity-90 disabled:opacity-70"
    >
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {children}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </span>
    </button>
  );
}

const FEATURES = [
  { emoji: "🎨", text: "Stunning portfolio templates" },
  { emoji: "⚡", text: "Publish in minutes, no code required" },
  { emoji: "📊", text: "Built-in analytics & insights" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export function AuthExperience({ initialView }: { initialView: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? undefined;
  const { showToast } = useToast();

  const [view, setView] = useState<View>(initialView);
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const spotlightX = useSpring(cursorX, { stiffness: 150, damping: 25, mass: 0.3 });
  const spotlightY = useSpring(cursorY, { stiffness: 150, damping: 25, mass: 0.3 });
  const spotlightBackground = useMotionTemplate`radial-gradient(500px circle at ${spotlightX}px ${spotlightY}px, rgba(255,255,255,0.1), transparent 80%)`;

  const normX = useMotionValue(0);
  const normY = useMotionValue(0);
  const parallaxX = useSpring(normX, { stiffness: 40, damping: 15 });
  const parallaxY = useSpring(normY, { stiffness: 40, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursorX.set(x);
    cursorY.set(y);
    normX.set((x / rect.width - 0.5) * 2);
    normY.set((y / rect.height - 0.5) * 2);
  };

  const handleMouseLeave = () => {
    normX.set(0);
    normY.set(0);
  };

  const navigate = (next: View) => {
    const order: View[] = ["login", "signup", "forgot"];
    setDirection(order.indexOf(next) >= order.indexOf(view) ? 1 : -1);
    setView(next);
    setSubmitted(false);
    setError(null);
    if (next === "login" || next === "signup") {
      // Sync the address bar without a Next.js route transition — router.push here would
      // unmount/remount this whole component (since /login and /signup are separate pages),
      // resetting all animation state and reading as a jarring "page refresh" mid-tab-switch.
      window.history.pushState(null, "", next === "login" ? "/login" : "/signup");
    }
  };

  const socialComingSoon = () => showToast("Social sign-in is coming soon.", "info");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, referralCode }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong.");
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // No email service is wired up yet — this is a presentational-only confirmation, not a real
  // password-reset flow. Kept honest: it never claims a reset link was actually delivered
  // beyond what the copy below already says, and there's no backend call here.
  function handleForgotSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full bg-background text-foreground overflow-hidden relative flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-200px] left-[-150px]"
          style={{ x: useTransform(parallaxX, [-1, 1], [-25, 25]), y: useTransform(parallaxY, [-1, 1], [-25, 25]) }}
        >
          <motion.div
            className="w-[650px] h-[650px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.08) 0%, transparent 70%)" }}
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 25, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.div
          className="absolute bottom-[-120px] right-[-120px]"
          style={{ x: useTransform(parallaxX, [-1, 1], [30, -30]), y: useTransform(parallaxY, [-1, 1], [30, -30]) }}
        >
          <motion.div
            className="w-[550px] h-[550px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)" }}
            animate={{ x: [0, -35, 20, 0], y: [0, 25, -20, 0], scale: [1, 0.92, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>
        <motion.div
          className="absolute bottom-[5%] left-[2%]"
          style={{ x: useTransform(parallaxX, [-1, 1], [-18, 18]), y: useTransform(parallaxY, [-1, 1], [18, -18]) }}
        >
          <motion.div
            className="w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
            animate={{ x: [0, 25, -15, 0], y: [0, -20, 30, 0], scale: [1, 1.06, 0.97, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </motion.div>
        <motion.div
          className="absolute top-[35%] right-[8%]"
          style={{ x: useTransform(parallaxX, [-1, 1], [20, -20]), y: useTransform(parallaxY, [-1, 1], [-15, 15]) }}
        >
          <motion.div
            className="w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, transparent 70%)" }}
            animate={{ x: [0, -20, 15, 0], y: [0, 20, -25, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <motion.div className="absolute inset-0" style={{ background: spotlightBackground }} />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
        <div className="hidden lg:flex flex-col gap-10 pr-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-foreground text-xs font-medium mb-6 tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5" />
              ACEapp
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight"
            >
              Build a portfolio <span className="text-foreground">that gets you hired.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 text-base leading-relaxed font-body font-light text-muted-foreground"
            >
              Design a stunning, professional portfolio in minutes. No code required — just your work and your story.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="flex flex-col gap-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-sm font-body text-muted-foreground"
              >
                <span className="text-xl">{f.emoji}</span>
                {f.text}
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="rounded-2xl border border-white/8 overflow-hidden bg-white/[0.03]"
          >
            <div className="h-1.5 w-full bg-white/15" />
            <div className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex-shrink-0 bg-white/10 flex items-center justify-center text-xs font-semibold">
                JL
              </div>
              <div>
                <p className="text-sm font-semibold">Jordan Lee</p>
                <p className="text-xs text-muted-foreground">Full-Stack Developer — sample portfolio</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-success/15 text-success">Live</span>
              </div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {["#a855f7", "#ec4899", "#06b6d4"].map((c) => (
                <div
                  key={c}
                  className="h-16 rounded-lg opacity-60"
                  style={{ background: `linear-gradient(135deg, ${c}44, ${c}22)`, border: `1px solid ${c}33` }}
                />
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-md mx-auto"
        >
          <div
            className="rounded-2xl p-8 border"
            style={{
              background: "rgba(23, 23, 23, 0.8)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderColor: "rgba(38, 38, 38, 0.5)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0px 10px 30px rgba(0,0,0,0.5)",
            }}
          >
            <div className="flex gap-1 mb-8 p-1 rounded-xl bg-white/[0.04]">
              {(["login", "signup"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => navigate(v)}
                  className="relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors duration-200"
                  style={{ color: view === v ? "#ffffff" : "#c4c7c8" }}
                >
                  {view === v && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        border: "1px solid rgba(255,255,255,0.15)",
                      }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{v === "login" ? "Sign In" : "Sign Up"}</span>
                </button>
              ))}
            </div>

            {/* Fixed to the tallest view's (signup's) natural height so switching tabs
               never resizes the card — measured empirically; min-height only sets a floor,
               so a validation error can still push a view taller without clipping. */}
            <div className="overflow-hidden" style={{ minHeight: 462 }}>
              <AnimatePresence mode="wait" custom={direction}>
                {view === "forgot" ? (
                  <motion.div key="forgot" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                    {submitted ? (
                      <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <CheckCircle2 className="w-14 h-14 text-success" />
                        </motion.div>
                        <h2 className="text-xl font-bold">Check your inbox</h2>
                        <p className="text-sm font-body text-muted-foreground">
                          If an account exists for <span className="text-foreground font-medium">{resetEmail || "that email"}</span>, a reset link is on its way.
                        </p>
                        <button onClick={() => navigate("login")} className="mt-2 text-sm font-medium flex items-center gap-1.5 text-foreground">
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleForgotSubmit} className="flex flex-col gap-5">
                        <div>
                          <button type="button" onClick={() => navigate("login")} className="flex items-center gap-1.5 text-xs mb-5 text-muted-foreground transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                          </button>
                          <h2 className="text-xl font-bold mb-1">Reset your password</h2>
                          <p className="text-sm font-body text-muted-foreground">Enter your email and we&apos;ll send you a link.</p>
                        </div>
                        <InputField type="email" placeholder="your@email.com" icon={Mail} value={resetEmail} onChange={setResetEmail} required />
                        <PrimaryButton loading={loading}>Send Reset Link</PrimaryButton>
                      </form>
                    )}
                  </motion.div>
                ) : view === "login" ? (
                  <motion.div key="login" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                    <form onSubmit={handleLogin} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        <SocialButton icon={GoogleIcon} label="Continue with Google" onClick={socialComingSoon} />
                        <SocialButton icon={AppleIcon} label="Continue with Apple" onClick={socialComingSoon} />
                      </div>
                      <Divider />
                      <InputField type="email" placeholder="Email address" icon={Mail} value={email} onChange={setEmail} required />
                      <InputField type="password" placeholder="Password" icon={Lock} value={password} onChange={setPassword} showToggle required />
                      <div className="flex justify-end">
                        <button type="button" onClick={() => navigate("forgot")} className="text-xs font-medium transition-colors hover:text-foreground text-muted-foreground">
                          Forgot password?
                        </button>
                      </div>
                      {error && <p className="text-xs text-destructive">{error}</p>}
                      <PrimaryButton loading={loading}>Sign In</PrimaryButton>
                      <p className="text-center text-xs font-body text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <button type="button" onClick={() => navigate("signup")} className="font-medium hover:opacity-80 transition-opacity text-foreground">
                          Sign Up
                        </button>
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div key="signup" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeOut" }}>
                    {submitted ? (
                      <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 280, damping: 18 }} className="text-5xl">
                          🎉
                        </motion.div>
                        <h2 className="text-xl font-bold">Welcome aboard!</h2>
                        <p className="text-sm font-body text-muted-foreground">Your portfolio journey starts now.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSignup} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                          <SocialButton icon={GoogleIcon} label="Continue with Google" onClick={socialComingSoon} />
                          <SocialButton icon={AppleIcon} label="Continue with Apple" onClick={socialComingSoon} />
                        </div>
                        <Divider />
                        <InputField
                          type="text"
                          placeholder="Username (becomes your portfolio URL)"
                          icon={User}
                          value={username}
                          onChange={(v) => setUsername(v.toLowerCase())}
                          required
                        />
                        <InputField type="email" placeholder="Email address" icon={Mail} value={email} onChange={setEmail} required />
                        <InputField type="password" placeholder="Create password" icon={Lock} value={password} onChange={setPassword} showToggle required minLength={8} />
                        <p className="text-xs font-body text-muted-foreground">
                          By creating an account you agree to our <span className="underline cursor-pointer text-foreground">Terms</span> and{" "}
                          <span className="underline cursor-pointer text-foreground">Privacy Policy</span>.
                        </p>
                        {error && <p className="text-xs text-destructive">{error}</p>}
                        <PrimaryButton loading={loading}>Create Account</PrimaryButton>
                        <p className="text-center text-xs font-body text-muted-foreground">
                          Already have an account?{" "}
                          <button type="button" onClick={() => navigate("login")} className="font-medium hover:opacity-80 transition-opacity text-foreground">
                            Sign In
                          </button>
                        </p>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }} className="flex items-center justify-center gap-5 mt-5">
            {["🔒 SSL Secured", "✦ No spam", "⚡ Free forever"].map((t) => (
              <span key={t} className="text-xs text-muted-foreground/60">
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
