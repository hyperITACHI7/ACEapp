import type { WidgetModule } from "../types";
import { ContactCardsComponent } from "./ContactCardsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: ContactCardsComponent,
};
export default widgetModule;
