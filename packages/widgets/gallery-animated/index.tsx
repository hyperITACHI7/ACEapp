import type { WidgetModule } from "../types";
import { GalleryAnimatedComponent } from "./GalleryAnimatedComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: GalleryAnimatedComponent,
};
export default widgetModule;
