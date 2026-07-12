import type { WidgetModule } from "../types";
import { StatsComponent } from "./StatsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: StatsComponent };
export default widgetModule;
