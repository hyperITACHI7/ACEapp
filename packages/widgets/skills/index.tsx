import type { WidgetModule } from "../types";
import { SkillsComponent } from "./SkillsComponent";
import manifest from "./manifest.json";

const widgetModule: WidgetModule = { manifest: manifest as WidgetModule["manifest"], Component: SkillsComponent };
export default widgetModule;
