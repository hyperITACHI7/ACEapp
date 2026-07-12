import type { WidgetModule } from "../types";
import { AwardsComponent } from "./AwardsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: AwardsComponent };
export default widgetModule;
