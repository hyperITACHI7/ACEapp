import type { WidgetModule } from "../types";
import { CoutureEditorialBannerComponent } from "./CoutureEditorialBannerComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialBannerComponent,
};
export default widgetModule;
