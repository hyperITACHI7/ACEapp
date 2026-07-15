import type { WidgetModule } from "../types";
import { CoutureEditorialMoodBoardComponent } from "./CoutureEditorialMoodBoardComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = {
  manifest: manifest as WidgetModule["manifest"],
  Component: CoutureEditorialMoodBoardComponent,
};
export default widgetModule;
