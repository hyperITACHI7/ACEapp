import type { WidgetModule } from "./types";
import about from "./about";
import skills from "./skills";
import gallery from "./gallery";
import experienceTimeline from "./experience-timeline";
import stats from "./stats";
import quote from "./quote";
import contact from "./contact";
import education from "./education";
import awards from "./awards";
import skillsBars from "./skills-bars";
import galleryCards from "./gallery-cards";
import contactCards from "./contact-cards";
import aboutAnimated from "./about-animated";
import galleryAnimated from "./gallery-animated";
import experienceTimelineAnimated from "./experience-timeline-animated";
import educationAnimated from "./education-animated";
import awardsAnimated from "./awards-animated";
import skillsMarquee from "./skills-marquee";
import contactAnimated from "./contact-animated";
import divider from "./divider";

const registry = new Map<string, WidgetModule>();

function register(mod: WidgetModule) {
  if (registry.has(mod.manifest.key)) {
    throw new Error(
      `Duplicate widget key "${mod.manifest.key}" registered in packages/widgets/registry.ts`
    );
  }
  registry.set(mod.manifest.key, mod);
}

register(about);
register(skills);
register(gallery);
register(experienceTimeline);
register(stats);
register(quote);
register(contact);
register(education);
register(awards);
register(skillsBars);
register(galleryCards);
register(contactCards);
register(aboutAnimated);
register(galleryAnimated);
register(experienceTimelineAnimated);
register(educationAnimated);
register(awardsAnimated);
register(skillsMarquee);
register(contactAnimated);
register(divider);

/**
 * Returns undefined on an unknown/removed key. Callers decide the fallback: the editor shows
 * an "unavailable" placeholder, the public renderer just skips the slot with a console.warn —
 * this registry never throws at lookup time (edge_case.md §2/§9).
 */
export function getWidget(key: string): WidgetModule | undefined {
  return registry.get(key);
}

export function listWidgets(): WidgetModule[] {
  return [...registry.values()];
}

/**
 * Groups registered widgets by manifest.section, preserving registration order within
 * each group. Used by the editor's sectioned widget picker and outline sidebar.
 */
export function listWidgetsBySection(): Record<string, WidgetModule[]> {
  const grouped: Record<string, WidgetModule[]> = {};
  for (const mod of registry.values()) {
    const section = mod.manifest.section;
    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(mod);
  }
  return grouped;
}

export type { WidgetManifest, WidgetModule, WidgetProps, WidgetConfigField } from "./types";
