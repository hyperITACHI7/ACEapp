import type { WidgetModule } from "../types";
import { CoutureEditorialExperienceTimelineComponent } from "./CoutureEditorialExperienceTimelineComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialExperienceTimelineComponent,
};
export default widgetModule;
