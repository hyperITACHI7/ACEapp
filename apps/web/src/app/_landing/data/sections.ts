export type Feature = {
  title: string;
  body: string;
};

export type Section = {
  id: string;
  eyebrow: string;
  title: string;
  tagline: string;
  image: string;
  /** Tailwind gradient classes for the reveal panel below the visual. */
  accent: string;
  headline: string;
  copy: string;
  cta: string;
  features: Feature[];
};

export const sections: Section[] = [
  {
    id: "design",
    eyebrow: "01",
    title: "Design",
    tagline: "A canvas that keeps up with your taste",
    image: "/assets/panel-design.jpg",
    accent: "from-[#ff8c78] to-[#ff5f9e]",
    headline: "Drag, drop, done.",
    copy: "Start from a designer-made template or a blank canvas. Every block snaps into a responsive grid, so it looks intentional on any screen — no code, no compromises.",
    cta: "Explore templates",
    features: [
      {
        title: "120+ living templates",
        body: "Editorial, minimal, brutalist, motion-first — hand-crafted starting points that never look like a template.",
      },
      {
        title: "Real typography controls",
        body: "Variable fonts, optical sizing, and kerning that respects your work instead of flattening it.",
      },
      {
        title: "Motion, built in",
        body: "Add scroll reveals, parallax, and hover states with a toggle. Tasteful defaults, infinite control.",
      },
    ],
  },
  {
    id: "publish",
    eyebrow: "02",
    title: "Publish",
    tagline: "One click. Live everywhere.",
    image: "/assets/panel-publish.jpg",
    accent: "from-[#22d3ee] to-[#3b82f6]",
    headline: "Ship it in a click.",
    copy: "Connect a custom domain, hit publish, and your portfolio goes live on a global edge network. Fast everywhere, secure by default, indexed and shareable in seconds.",
    cta: "Set up a domain",
    features: [
      {
        title: "Free custom domain",
        body: "Bring your own or grab a fresh one at checkout. SSL is automatic, always.",
      },
      {
        title: "Blazing edge delivery",
        body: "Assets are optimized and cached across 300+ locations for sub-second loads worldwide.",
      },
      {
        title: "Share-ready everywhere",
        body: "Rich link previews for every page, tuned for LinkedIn, X, and the group chat.",
      },
    ],
  },
  {
    id: "showcase",
    eyebrow: "03",
    title: "Showcase",
    tagline: "Let the work speak — loudly",
    image: "/assets/panel-showcase.jpg",
    accent: "from-[#f7b267] to-[#f4845f]",
    headline: "Your best work, framed.",
    copy: "Case studies, galleries, reels, and interactive embeds live side by side. Tell the story behind the pixels with layouts made for depth, not just thumbnails.",
    cta: "See a live portfolio",
    features: [
      {
        title: "Immersive case studies",
        body: "Long-form layouts with sticky media, before/after sliders, and process timelines.",
      },
      {
        title: "Embed anything",
        body: "Figma, YouTube, CodePen, Spotify, 3D models — drop a link and it just works.",
      },
      {
        title: "Password-protected work",
        body: "Share NDA projects with a private link that expires when you say so.",
      },
    ],
  },
  {
    id: "grow",
    eyebrow: "04",
    title: "Grow",
    tagline: "Know who's watching",
    image: "/assets/panel-grow.jpg",
    accent: "from-[#34d399] to-[#10b981]",
    headline: "Insights that get you hired.",
    copy: "See which projects land, where visitors come from, and when recruiters return. Privacy-first analytics with zero cookie banners and zero creepiness.",
    cta: "View the dashboard",
    features: [
      {
        title: "Project-level analytics",
        body: "Track views, dwell time, and click-throughs per case study to learn what resonates.",
      },
      {
        title: "Lead capture",
        body: "Contact forms and inquiry routing that drop straight into your inbox or CRM.",
      },
      {
        title: "Privacy-first by design",
        body: "No third-party trackers, GDPR-friendly, and cookie-banner-free out of the box.",
      },
    ],
  },
  {
    id: "ai",
    eyebrow: "05",
    title: "AI",
    tagline: "A creative director in your pocket",
    image: "/assets/panel-ai.jpg",
    accent: "from-[#a78bfa] to-[#ec4899]",
    headline: "Write, layout, refine — with AI.",
    copy: "Describe the vibe and ACEapp drafts your copy, suggests layouts, and rewrites case studies in your voice. You stay the artist; the busywork disappears.",
    cta: "Try the assistant",
    features: [
      {
        title: "Copy in your voice",
        body: "Generate project write-ups and bios, then tune the tone from playful to prestige.",
      },
      {
        title: "Smart layout suggestions",
        body: "Upload a set of images and get balanced, on-brand arrangements instantly.",
      },
      {
        title: "Alt text, automatically",
        body: "Accessible descriptions written for every asset so your work reaches everyone.",
      },
    ],
  },
];
