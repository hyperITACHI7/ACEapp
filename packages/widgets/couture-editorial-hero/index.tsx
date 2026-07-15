import type { WidgetModule } from "../types";
import { CoutureEditorialHeroComponent } from "./CoutureEditorialHeroComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialHeroComponent,
};
export default widgetModule;
