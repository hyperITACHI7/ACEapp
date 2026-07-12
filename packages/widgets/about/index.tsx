import type { WidgetModule } from "../types";
import { AboutComponent } from "./AboutComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: AboutComponent };
export default widgetModule;
