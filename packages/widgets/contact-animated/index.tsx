import type { WidgetModule } from "../types";
import { ContactAnimatedComponent } from "./ContactAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: ContactAnimatedComponent,
};
export default widgetModule;
