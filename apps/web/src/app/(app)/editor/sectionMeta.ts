import {
  User,
  Sparkles,
  Images,
  Briefcase,
  BarChart3,
  Phone,
  Quote,
  GraduationCap,
  Award,
  LayoutGrid,
  Minus,
  Crown,
  Image,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

/** Shared label/icon/color metadata for a content section, used by both the left outline
 *  sidebar and the right widget picker so a section reads identically in both places. */
export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  gallery: "Gallery",
  "mood-board": "Mood Board",
  "experience-timeline": "Work Experience",
  stats: "Stats",
  contact: "Contact",
  quote: "Quote",
  education: "Education",
  awards: "Awards",
  banner: "Banner",
  divider: "Divider",
};

export const SECTION_ICONS: Record<string, LucideIcon> = {
  hero: Crown,
  about: User,
  skills: Sparkles,
  gallery: Images,
  "mood-board": Image,
  "experience-timeline": Briefcase,
  stats: BarChart3,
  contact: Phone,
  quote: Quote,
  education: GraduationCap,
  awards: Award,
  banner: Megaphone,
  divider: Minus,
};

export const SECTION_COLORS: Record<string, string> = {
  hero: "#f59e0b",
  about: "#a855f7",
  skills: "#06b6d4",
  gallery: "#f97316",
  "mood-board": "#0ea5e9",
  "experience-timeline": "#22c55e",
  stats: "#eab308",
  contact: "#ec4899",
  quote: "#6366f1",
  education: "#14b8a6",
  awards: "#f43f5e",
  banner: "#8b5cf6",
  divider: "#7878a0",
};

export function sectionLabel(section: string): string {
  return SECTION_LABELS[section] ?? section;
}

export function sectionIcon(section: string): LucideIcon {
  return SECTION_ICONS[section] ?? LayoutGrid;
}

export function sectionColor(section: string): string {
  return SECTION_COLORS[section] ?? "#7878a0";
}
