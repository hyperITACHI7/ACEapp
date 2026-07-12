import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";

type View = "login" | "signup" | "forgot";

const GRADIENT_ORBS = [
  { color: "from-purple-600/40 to-violet-900/0", size: "w-[600px] h-[600px]", position: "top-[-200px] left-[-100px]", duration: 18 },
  { color: "from-cyan-500/30 to-blue-900/0", size: "w-[500px] h-[500px]", position: "bottom-[-100px] right-[-100px]", duration: 22 },
  { color: "from-pink-500/25 to-rose-900/0", size: "w-[400px] h-[400px]", position: "bottom-[10%] left-[5%]", duration: 15 },
  { color: "from-amber-500/15 to-orange-900/0", size: "w-[350px] h-[350px]", position: "top-[30%] right-[10%]", duration: 20 },
];

function FloatingOrb({ color, size, position, duration, index }: { color: string; size: string; position: string; duration: number; index: number }) {
  return (
    <motion.div
      className={`absolute rounded-full bg-radial-[ellipse_at_center] bg-gradient-to-br ${color} ${size} blur-3xl pointer-events-none`}
      style={{ position: "absolute", top: position.includes("top-") ? undefined : undefined }}
      animate={{
        x: [0, 30 * (index % 2 === 0 ? 1 : -1), -20, 0],
        y: [0, -25, 20, 0],
        scale: [1, 1.08, 0.95, 1],
      }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut", delay: index * 1.5 }}
    />
  );
}

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
}: {
  type: string;
  placeholder: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  showToggle?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`relative flex items-center rounded-xl border transition-all duration-300 ${
        focused
          ? "border-purple-400/60 bg-white/8 shadow-[0_0_0_3px_rgba(168,85,247,0.15)]"
          : "border-white/10 bg-white/5"
      }`}
    >
      <Icon className="absolute left-4 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        type={showToggle ? (show ? "text" : "password") : type}
        placeholder={placeholder}
        value={value}
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

const FEATURES = [
  { emoji: "🎨", text: "Stunning portfolio templates" },
  { emoji: "⚡", text: "Deploy in under 60 seconds" },
  { emoji: "📊", text: "Built-in analytics & insights" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function App() {
  const [view, setView] = useState<View>("login");
  const [direction, setDirection] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw cursor position (px, relative to container) — drives the spotlight glow.
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const spotlightX = useSpring(cursorX, { stiffness: 150, damping: 25, mass: 0.3 });
  const spotlightY = useSpring(cursorY, { stiffness: 150, damping: 25, mass: 0.3 });
  const spotlightBackground = useMotionTemplate`radial-gradient(500px circle at ${spotlightX}px ${spotlightY}px, rgba(168,85,247,0.16), transparent 80%)`;

  // Normalized cursor offset (-1 to 1) — drives subtle parallax on the orbs.
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full bg-background text-foreground overflow-hidden relative flex items-center justify-center p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Gradient orbs — positioned absolutely within this container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-[-200px] left-[-150px]" style={{ x: useTransform(parallaxX, [-1, 1], [-25, 25]), y: useTransform(parallaxY, [-1, 1], [-25, 25]) }}>
          <motion.div
            className="w-[650px] h-[650px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, transparent 70%)" }}
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 25, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.div className="absolute bottom-[-120px] right-[-120px]" style={{ x: useTransform(parallaxX, [-1, 1], [30, -30]), y: useTransform(parallaxY, [-1, 1], [30, -30]) }}>
          <motion.div
            className="w-[550px] h-[550px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.28) 0%, transparent 70%)" }}
            animate={{ x: [0, -35, 20, 0], y: [0, 25, -20, 0], scale: [1, 0.92, 1.08, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </motion.div>
        <motion.div className="absolute bottom-[5%] left-[2%]" style={{ x: useTransform(parallaxX, [-1, 1], [-18, 18]), y: useTransform(parallaxY, [-1, 1], [18, -18]) }}>
          <motion.div
            className="w-[400px] h-[400px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(236,72,153,0.22) 0%, transparent 70%)" }}
            animate={{ x: [0, 25, -15, 0], y: [0, -20, 30, 0], scale: [1, 1.06, 0.97, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </motion.div>
        <motion.div className="absolute top-[35%] right-[8%]" style={{ x: useTransform(parallaxX, [-1, 1], [20, -20]), y: useTransform(parallaxY, [-1, 1], [-15, 15]) }}>
          <motion.div
            className="w-[300px] h-[300px] rounded-full blur-3xl"
            style={{ background: "radial-gradient(ellipse at center, rgba(251,146,60,0.18) 0%, transparent 70%)" }}
            animate={{ x: [0, -20, 15, 0], y: [0, 20, -25, 0], scale: [1, 1.05, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
        </motion.div>
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Cursor-reactive spotlight glow */}
        <motion.div className="absolute inset-0" style={{ background: spotlightBackground }} />
      </div>

      {/* Layout */}
      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">

        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col gap-10 pr-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6 tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Portfolio Builder
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl xl:text-6xl font-extrabold leading-[1.1] tracking-tight"
            >
              Build a portfolio{" "}
              <span
                className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
              >
                that gets you hired.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-5 text-base leading-relaxed"
              style={{ color: "#9090b0", fontFamily: "'Inter', sans-serif", fontWeight: 300 }}
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
                className="flex items-center gap-3 text-sm"
                style={{ color: "#b0b0d0", fontFamily: "'Inter', sans-serif" }}
              >
                <span className="text-xl">{f.emoji}</span>
                {f.text}
              </motion.div>
            ))}
          </motion.div>

          {/* Mini portfolio preview card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="rounded-2xl border border-white/8 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #a855f7, #ec4899, #06b6d4)" }} />
            <div className="p-4 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #a855f7, #06b6d4)" }}
              />
              <div>
                <p className="text-sm font-semibold">Jordan Lee</p>
                <p className="text-xs" style={{ color: "#7878a0" }}>Full-Stack Developer · 12k views this month</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(6,182,212,0.15)", color: "#06b6d4" }}>Live</span>
              </div>
            </div>
            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {["#a855f7", "#ec4899", "#06b6d4"].map((c, i) => (
                <div key={i} className="h-16 rounded-lg opacity-60" style={{ background: `linear-gradient(135deg, ${c}44, ${c}22)`, border: `1px solid ${c}33` }} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right panel — auth card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-md mx-auto"
        >
          <div
            className="rounded-2xl p-8 border"
            style={{
              background: "rgba(14, 14, 24, 0.8)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderColor: "rgba(168,85,247,0.15)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 40px 80px rgba(0,0,0,0.6)",
            }}
          >
            {/* Tab selector */}
            <div className="flex gap-1 mb-8 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
              {(["login", "signup"] as View[]).map((v) => (
                <button
                  key={v}
                  onClick={() => navigate(v)}
                  className="relative flex-1 py-2 text-sm font-semibold rounded-lg transition-colors duration-200"
                  style={{ color: view === v ? "#f0f0ff" : "#7878a0" }}
                >
                  {view === v && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.4), rgba(6,182,212,0.2))", border: "1px solid rgba(168,85,247,0.3)" }}
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{v === "login" ? "Sign In" : "Sign Up"}</span>
                </button>
              ))}
            </div>

            {/* Form area */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                {view === "forgot" ? (
                  <motion.div
                    key="forgot"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {submitted ? (
                      <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <CheckCircle2 className="w-14 h-14" style={{ color: "#06b6d4" }} />
                        </motion.div>
                        <h2 className="text-xl font-bold">Check your inbox</h2>
                        <p className="text-sm" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                          We sent a reset link to <span className="text-foreground font-medium">{email || "your email"}</span>
                        </p>
                        <button
                          onClick={() => navigate("login")}
                          className="mt-2 text-sm font-medium flex items-center gap-1.5"
                          style={{ color: "#a855f7" }}
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                          <button
                            type="button"
                            onClick={() => navigate("login")}
                            className="flex items-center gap-1.5 text-xs mb-5 transition-colors"
                            style={{ color: "#7878a0" }}
                          >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                          </button>
                          <h2 className="text-xl font-bold mb-1">Reset your password</h2>
                          <p className="text-sm" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                            Enter your email and we&apos;ll send you a link.
                          </p>
                        </div>
                        <InputField type="email" placeholder="your@email.com" icon={Mail} value={email} onChange={setEmail} />
                        <PrimaryButton loading={loading}>Send Reset Link</PrimaryButton>
                      </form>
                    )}
                  </motion.div>
                ) : view === "login" ? (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        <SocialButton icon={GoogleIcon} label="Continue with Google" onClick={() => {}} />
                        <SocialButton icon={AppleIcon} label="Continue with Apple" onClick={() => {}} />
                      </div>
                      <Divider />
                      <InputField type="email" placeholder="Email address" icon={Mail} value={email} onChange={setEmail} />
                      <InputField type="password" placeholder="Password" icon={Lock} value={password} onChange={setPassword} showToggle />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => navigate("forgot")}
                          className="text-xs font-medium transition-colors hover:text-purple-300"
                          style={{ color: "#7878a0" }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <PrimaryButton loading={loading}>Sign In</PrimaryButton>
                      <p className="text-center text-xs" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                        Don&apos;t have an account?{" "}
                        <button type="button" onClick={() => navigate("signup")} className="font-medium hover:text-purple-300 transition-colors" style={{ color: "#a855f7" }}>
                          Sign Up
                        </button>
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {submitted ? (
                      <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <motion.div
                          initial={{ scale: 0, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 280, damping: 18 }}
                          className="text-5xl"
                        >
                          🎉
                        </motion.div>
                        <h2 className="text-xl font-bold">Welcome aboard!</h2>
                        <p className="text-sm" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                          Your portfolio journey starts now.
                        </p>
                        <button
                          onClick={() => { setSubmitted(false); setView("login"); }}
                          className="mt-2 text-sm font-medium"
                          style={{ color: "#a855f7" }}
                        >
                          Go to Sign In →
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                          <SocialButton icon={GoogleIcon} label="Continue with Google" onClick={() => {}} />
                          <SocialButton icon={AppleIcon} label="Continue with Apple" onClick={() => {}} />
                        </div>
                        <Divider />
                        <InputField type="text" placeholder="Full name" icon={User} value={name} onChange={setName} />
                        <InputField type="email" placeholder="Email address" icon={Mail} value={email} onChange={setEmail} />
                        <InputField type="password" placeholder="Create password" icon={Lock} value={password} onChange={setPassword} showToggle />
                        <p className="text-xs" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                          By creating an account you agree to our{" "}
                          <span className="underline cursor-pointer" style={{ color: "#a855f7" }}>Terms</span> and{" "}
                          <span className="underline cursor-pointer" style={{ color: "#a855f7" }}>Privacy Policy</span>.
                        </p>
                        <PrimaryButton loading={loading}>Create Account</PrimaryButton>
                        <p className="text-center text-xs" style={{ color: "#7878a0", fontFamily: "'Inter', sans-serif" }}>
                          Already have an account?{" "}
                          <button type="button" onClick={() => navigate("login")} className="font-medium hover:text-purple-300 transition-colors" style={{ color: "#a855f7" }}>
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

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center gap-5 mt-5"
          >
            {["🔒 SSL Secured", "✦ No spam", "⚡ Free forever"].map((t) => (
              <span key={t} className="text-xs" style={{ color: "#4a4a6a" }}>
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function PrimaryButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative w-full py-3.5 rounded-xl text-sm font-bold text-white overflow-hidden group active:scale-[0.98] transition-transform duration-150 disabled:opacity-70"
      style={{
        background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #06b6d4 100%)",
        backgroundSize: "200% 200%",
      }}
    >
      <span
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(135deg, #9333ea 0%, #db2777 50%, #0891b2 100%)",
        }}
      />
      <span className="relative flex items-center justify-center gap-2">
        {loading ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
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
