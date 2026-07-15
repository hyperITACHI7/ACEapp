import type { WidgetModule } from "../types";
import { CoutureEditorialAwardsComponent } from "./CoutureEditorialAwardsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialAwardsComponent,
};
export default widgetModule;
