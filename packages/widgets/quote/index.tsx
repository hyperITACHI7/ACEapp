import type { WidgetModule } from "../types";
import { QuoteComponent } from "./QuoteComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: QuoteComponent };
export default widgetModule;
