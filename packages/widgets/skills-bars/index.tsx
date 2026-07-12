import type { WidgetModule } from "../types";
import { SkillsBarsComponent } from "./SkillsBarsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: SkillsBarsComponent,
};
export default widgetModule;
