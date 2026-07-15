import type { WidgetModule } from "../types";
import { CoutureEditorialQuoteComponent } from "./CoutureEditorialQuoteComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialQuoteComponent,
};
export default widgetModule;
