import type { WidgetModule } from "../types";
import { CoutureEditorialContactComponent } from "./CoutureEditorialContactComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialContactComponent,
};
export default widgetModule;
