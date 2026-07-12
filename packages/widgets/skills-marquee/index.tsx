import type { WidgetModule } from "../types";
import { SkillsMarqueeComponent } from "./SkillsMarqueeComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: SkillsMarqueeComponent,
};
export default widgetModule;
