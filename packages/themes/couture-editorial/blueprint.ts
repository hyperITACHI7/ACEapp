import type { TemplateBlueprint } from "../types";

// PortfolioDataSchema requires profile.photoUrl and project.images[] to be full absolute URLs
// (z.string().url()) — a bare "/templates/..." path fails validation. Config fields (backgrounds,
// mood-board images, process-step images) are `z.record(z.any())` and have no such constraint,
// so those stay as plain relative paths. Mirrors the same APP_BASE_URL pattern used by
// apps/web/src/server/storage/local.ts for user-uploaded files.
const BASE = process.env.APP_BASE_URL ?? "http://localhost:3000";
const asset = (file: string) => `${BASE}/templates/couture-editorial/${file}`;
const assetPath = (file: string) => `/templates/couture-editorial/${file}`;

// Every widget belongs to a group — groups the reference's nav doesn't link to (Intro,
// Spotlight) exist purely so the Outline sidebar shows contiguous, gap-free sections
// (`showInNav: false` keeps them out of the theme header). Widgets that share a grid row
// (Awards ∥ Skills at y=11) MUST share a group, or the sidebar's per-group mini-grids can't
// display the pairing. Grid `h` values are the reference's measured section heights in ~330px
// rows (hero ≈ 660px → h:2, about ≈ 1320px → h:4, ...), so the sidebar's cards are proportional
// to what actually renders.
export const blueprint: TemplateBlueprint = {
  navGroups: [
    { id: "intro", name: "Intro", order: 0, showInNav: false },
    { id: "collections", name: "Collections", order: 1, showInNav: true },
    { id: "mood-board", name: "Mood Board", order: 2, showInNav: true },
    { id: "awards", name: "Awards", order: 3, showInNav: true },
    { id: "journey", name: "Journey", order: 4, showInNav: true },
    { id: "spotlight", name: "Spotlight", order: 5, showInNav: false },
    { id: "contact", name: "Contact", order: 6, showInNav: true },
  ],

  widgets: [
    {
      key: "couture-editorial-hero",
      order: 0,
      visible: true,
      groupId: "intro",
      grid: { x: 0, y: 0, w: 2, h: 2 },
      config: {
        eyebrow: "Portfolio — Lifetime Digital Archive",
        primaryCtaLabel: "View Collections",
        secondaryCtaLabel: "My Journey",
        backgroundImage: assetPath("hero-bg.jpg"),
        stats: [
          { value: "6", label: "Collections" },
          { value: "119", label: "Pieces Designed" },
          { value: "6", label: "Awards Won" },
          { value: "5+", label: "Years of Study" },
          { value: "3", label: "International Shows" },
          { value: "2", label: "Published Editorials" },
        ],
      },
    },
    {
      key: "couture-editorial-about",
      order: 1,
      visible: true,
      groupId: "intro",
      grid: { x: 0, y: 2, w: 2, h: 4 },
      config: {
        eyebrow: "About the Designer",
        heading: "Crafting Identity\nThrough Cloth",
        badge: "MA / CSM London",
        ctaLabel: "Download Portfolio PDF",
        infoItems: [
          { label: "Based in", value: "London & Paris" },
          { label: "Education", value: "CSM · Parsons" },
          { label: "Specialisation", value: "Haute Couture" },
          { label: "Label Founded", value: "2024" },
        ],
        processSteps: [
          {
            title: "Pattern & Construction",
            description:
              "Every pattern is drafted by hand before being translated to toile. Construction is meticulous — French seams, hand-picked stitching, weighted hems for perfect fall.",
            image: assetPath("atelier-01.jpg"),
          },
          {
            title: "Textile Selection",
            description:
              "Fabrics are sourced from Italian mills and Japanese merchants — silk duchesse, Japanese denim, French wool crêpe, and heritage brocade woven to custom specifications.",
            image: assetPath("atelier-02.jpg"),
          },
          {
            title: "Embellishment & Detail",
            description:
              "Hand-sewn embellishments — Swarovski crystals, seed pearls, couture-grade guipure lace. Each piece takes between 40 and 200 hours to reach final form.",
            image: assetPath("mood-03.jpg"),
          },
        ],
      },
    },
    {
      key: "couture-editorial-gallery",
      order: 2,
      visible: true,
      groupId: "collections",
      grid: { x: 0, y: 6, w: 2, h: 3 },
      config: {
        eyebrow: "Design Work",
        heading: "Collections\nArchive",
        yearFilterEnabled: true,
      },
    },
    {
      key: "couture-editorial-mood-board",
      order: 3,
      visible: true,
      groupId: "mood-board",
      grid: { x: 0, y: 9, w: 2, h: 2 },
      config: {
        eyebrow: "Visual Research",
        heading: "Mood\nBoard",
        images: [
          { url: assetPath("mood-01.jpg"), alt: "Runway model in floral dress", tall: true },
          { url: assetPath("mood-02.jpg"), alt: "Tape measure and scissors" },
          { url: assetPath("mood-03.jpg"), alt: "Colorful spools of thread" },
          { url: assetPath("banner-bg.jpg"), alt: "Models walking on runway", wide: true },
          { url: assetPath("about-portrait.jpg"), alt: "Two designers discuss in workshop", tall: true },
          { url: assetPath("mood-06.jpg"), alt: "Woman in bomber jacket on stage", wide: true },
        ],
        themes: ["Austere Minimalism", "Craftsmanship & Heritage", "Femme Architecture", "Post-Colonial Textiles"],
      },
    },
    {
      key: "couture-editorial-awards",
      order: 4,
      visible: true,
      groupId: "awards",
      grid: { x: 0, y: 11, w: 1, h: 2 },
      config: {
        eyebrow: "Recognition",
        heading: "Awards &\nHonours",
        intro:
          "Six years of recognition from the industry's most prestigious institutions — from Fédération de la Haute Couture to the LVMH Prize.",
        items: [
          { year: "2024", title: "Prix du Design Émergent", org: "Fédération de la Haute Couture et de la Mode, Paris", category: "Emerging Designer" },
          { year: "2024", title: "Silver Needle Award", org: "International Fashion Institute, Milan", category: "Sustainable Design" },
          { year: "2023", title: "Golden Thread Recognition", org: "LVMH Prize — Semi-Finalist", category: "Young Designer" },
          { year: "2023", title: "Best Collection of the Year", org: "Central Saint Martins Graduate Show", category: "MA Fashion" },
          { year: "2022", title: "Textile Innovation Grant", org: "Arts & Crafts Foundation, London", category: "Research" },
          { year: "2021", title: "Dean's Medal in Fashion Arts", org: "Parsons School of Design, New York", category: "Academic Excellence" },
        ],
      },
    },
    {
      key: "couture-editorial-skills",
      order: 5,
      visible: true,
      groupId: "awards",
      grid: { x: 1, y: 11, w: 1, h: 2 },
      config: {
        eyebrow: "Expertise",
        heading: "Skills &\nDisciplines",
        progressBars: [
          { label: "Couture Craft", percent: 95 },
          { label: "Textile & Material Knowledge", percent: 90 },
          { label: "Pattern Drafting", percent: 88 },
          { label: "Fashion Illustration", percent: 87 },
          { label: "Sustainable Design", percent: 82 },
          { label: "Digital Design (CLO 3D)", percent: 74 },
        ],
      },
    },
    {
      key: "couture-editorial-experience-timeline",
      order: 6,
      visible: true,
      groupId: "journey",
      grid: { x: 0, y: 13, w: 2, h: 3 },
      config: {
        eyebrow: "Career Path",
        heading: "The\nJourney",
      },
    },
    {
      key: "couture-editorial-quote",
      order: 7,
      visible: true,
      groupId: "spotlight",
      grid: { x: 0, y: 16, w: 2, h: 1 },
      config: {
        eyebrow: "Voices",
        heading: "What They\nSay",
        testimonials: [
          {
            quote:
              "Isabelle possesses a rare quality — she designs not just garments but narratives. Her couture work shows a mastery that takes most designers a decade to achieve.",
            name: "Professor Élise Moreau",
            role: "Head of MA Fashion, Central Saint Martins",
          },
          {
            quote:
              "Working with Isabelle on the Valentino Atelier collections was a privilege. Her precision, patience, and instinct for proportion set her apart from her contemporaries.",
            name: "Marco Russo",
            role: "Master Artisan, Valentino Haute Couture, Rome",
          },
          {
            quote: "Her debut at LFW Graduate was the most arresting work in the show. Conceptual rigour and extraordinary craft — a designer to watch closely.",
            name: "Charlotte Wren",
            role: "Fashion Editor, AnOther Magazine",
          },
        ],
      },
    },
    {
      key: "couture-editorial-banner",
      order: 8,
      visible: true,
      groupId: "spotlight",
      grid: { x: 0, y: 17, w: 2, h: 1 },
      config: {
        eyebrow: "Latest Show",
        heading: "London Fashion Week\nGraduate Showcase",
        copy:
          "Autumn/Winter 2023. 24 looks. Standing ovation. The Noir Éternité collection was described by Vogue as 'the most assured debut in recent memory.'",
        ctaLabel: "See Full Collection",
        backgroundImage: assetPath("banner-bg.jpg"),
      },
    },
    {
      key: "couture-editorial-contact",
      order: 9,
      visible: true,
      groupId: "contact",
      grid: { x: 0, y: 18, w: 2, h: 1 },
      config: {
        eyebrow: "Get in Touch",
        heading: "Collaborate.\nCommission. Connect.",
        copy: "Available for bespoke commissions, editorial collaborations, brand consulting, and speaking engagements. Inquiries are responded to within 48 hours.",
        studio: "Shoreditch, London E1",
        stockists: "Dover Street Market — London · Tokyo · New York",
      },
    },
  ],

  profile: {
    name: "Isabelle Fontaine",
    headline: "Clothing is the body's most intimate architecture — I build cathedrals.",
    bio: "Isabelle Fontaine is a Paris-born, London-educated fashion designer whose practice sits at the intersection of haute couture craft and conceptual fashion research. Trained at Parsons New York and Central Saint Martins, she brings rigorous technical skill to deeply personal narratives. Her work investigates the politics of dress, the memory embedded in textiles, and the future of slow luxury. Her independent label SYLVAINE is stocked at Dover Street Market globally.",
    photoUrl: asset("about-portrait.jpg"),
    domain: "Fashion Design",
    location: "London & Paris",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/sylvaine" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/isabelle-fontaine" },
      { platform: "Vogue", url: "https://vogue.com" },
    ],
  },

  skills: [
    "Haute Couture Techniques",
    "Pattern Drafting",
    "Draping & Toile",
    "Garment Construction",
    "Textile Sourcing",
    "Sustainable Design",
    "Adobe Illustrator",
    "CLO 3D",
    "Hand Embroidery",
    "Bespoke Tailoring",
    "Knitwear Design",
    "Print & Surface Design",
    "Fashion Illustration",
    "Collection Planning",
    "Trend Forecasting",
    "Lookbook Direction",
  ],

  experience: [
    {
      role: "Enrolled at Parsons School of Design",
      org: "Parsons School of Design",
      dates: "2019",
      description: "BFA Fashion Design — foundational studies in garment construction, draping, and textile theory. New York City.",
      source: "manual",
      tags: [],
    },
    {
      role: "Internship — Valentino Atelier, Rome",
      org: "Valentino",
      dates: "2020",
      description: "Couture workroom apprenticeship; mastered hand-beading and Italian tailoring under Master Artisan Marco Russo.",
      source: "manual",
      tags: [],
    },
    {
      role: "First Solo Collection — 'Chrysalis'",
      org: "Parsons School of Design",
      dates: "2021",
      description: "Debuted 8-piece womenswear collection at Parsons Spring Showcase. Two pieces acquired by private collectors.",
      source: "manual",
      tags: [],
    },
    {
      role: "Transfer — Central Saint Martins, London",
      org: "Central Saint Martins",
      dates: "2022",
      description: "MA Fashion Design. Research-led practice exploring post-colonial textile heritage and sustainable luxury.",
      source: "manual",
      tags: [],
    },
    {
      role: "Graduate Collection — 'Noir Éternité'",
      org: "Central Saint Martins",
      dates: "2023",
      description: "MA graduation show. 24-piece collection at London Fashion Week Graduate Showcase. Standing ovation.",
      source: "manual",
      tags: [],
    },
    {
      role: "Independent Label Launch — SYLVAINE",
      org: "SYLVAINE",
      dates: "2024",
      description: "Founded independent luxury label. Stocked at Dover Street Market in London, Tokyo and New York.",
      source: "manual",
      tags: [],
    },
  ],

  projects: [
    {
      id: "collection-noir-eternite",
      title: "Noir Éternité",
      description: "24 pieces",
      images: [asset("hero-bg.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Haute Couture"],
      date: "Autumn/Winter 2024",
    },
    {
      id: "collection-lumiere-doree",
      title: "Lumière Dorée",
      description: "18 pieces",
      images: [asset("collection-02.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Ready-to-Wear"],
      date: "Spring/Summer 2024",
    },
    {
      id: "collection-velours-rouge",
      title: "Velours Rouge",
      description: "20 pieces",
      images: [asset("collection-03.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Couture"],
      date: "Autumn/Winter 2023",
    },
    {
      id: "collection-fantome-blanc",
      title: "Fantôme Blanc",
      description: "16 pieces",
      images: [asset("collection-04.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Resort"],
      date: "Resort 2023",
    },
    {
      id: "collection-ombres-de-paris",
      title: "Ombres de Paris",
      description: "22 pieces",
      images: [asset("collection-05.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Prêt-à-Porter"],
      date: "Autumn/Winter 2022",
    },
    {
      id: "collection-larchitecte",
      title: "L'Architecte",
      description: "19 pieces",
      images: [asset("collection-06.jpg")],
      links: [],
      source: "manual",
      editedFields: [],
      sourceUnavailable: false,
      tags: ["Concept"],
      date: "Spring/Summer 2022",
    },
  ],
};
