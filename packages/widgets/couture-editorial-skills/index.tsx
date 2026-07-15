import type { WidgetModule } from "../types";
import { CoutureEditorialSkillsComponent } from "./CoutureEditorialSkillsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialSkillsComponent,
};
export default widgetModule;
