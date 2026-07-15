import type { WidgetModule } from "../types";
import { CoutureEditorialGalleryComponent } from "./CoutureEditorialGalleryComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialGalleryComponent,
};
export default widgetModule;
