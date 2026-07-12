import type { WidgetModule } from "../types";
import { ContactComponent } from "./ContactComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: ContactComponent };
export default widgetModule;
