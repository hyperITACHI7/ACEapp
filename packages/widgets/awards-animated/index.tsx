import type { WidgetModule } from "../types";
import { AwardsAnimatedComponent } from "./AwardsAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: AwardsAnimatedComponent,
};
export default widgetModule;
