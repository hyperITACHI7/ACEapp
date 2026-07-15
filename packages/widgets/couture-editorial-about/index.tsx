import type { WidgetModule } from "../types";
import { CoutureEditorialAboutComponent } from "./CoutureEditorialAboutComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialAboutComponent,
};
export default widgetModule;
