import type { WidgetModule } from "../types";
import { EducationComponent } from "./EducationComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: EducationComponent };
export default widgetModule;
