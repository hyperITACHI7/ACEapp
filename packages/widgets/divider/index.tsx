import type { WidgetModule } from "../types";
import { DividerComponent } from "./DividerComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: DividerComponent };
export default widgetModule;
