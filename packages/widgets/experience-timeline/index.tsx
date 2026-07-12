import type { WidgetModule } from "../types";
import { ExperienceTimelineComponent } from "./ExperienceTimelineComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: ExperienceTimelineComponent,
};
export default widgetModule;
