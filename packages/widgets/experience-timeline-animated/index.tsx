import type { WidgetModule } from "../types";
import { ExperienceTimelineAnimatedComponent } from "./ExperienceTimelineAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: ExperienceTimelineAnimatedComponent,
};
export default widgetModule;
