import type { WidgetModule } from "../types";
import { EducationAnimatedComponent } from "./EducationAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: EducationAnimatedComponent,
};
export default widgetModule;
