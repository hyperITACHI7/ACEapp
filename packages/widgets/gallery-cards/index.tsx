import type { WidgetModule } from "../types";
import { GalleryCardsComponent } from "./GalleryCardsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: GalleryCardsComponent,
};
export default widgetModule;
