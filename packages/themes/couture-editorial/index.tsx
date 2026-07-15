import type { ThemeModule } from "../types";
import { CoutureEditorialComponent } from "./CoutureEditorialComponent";
import manifest from "./manifest.json";
import { palettes } from "./palettes";
import { blueprint } from "./blueprint";

const themeModule: ThemeModule = { manifest, Component: CoutureEditorialComponent, palettes, blueprint };
export default themeModule;
