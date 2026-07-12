import type { WidgetModule } from "../types";
import { AboutAnimatedComponent } from "./AboutAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: AboutAnimatedComponent,
};
export default widgetModule;
