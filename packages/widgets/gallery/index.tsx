import type { WidgetModule } from "../types";
import { GalleryComponent } from "./GalleryComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: GalleryComponent };
export default widgetModule;
