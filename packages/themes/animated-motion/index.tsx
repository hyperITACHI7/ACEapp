import type { ThemeModule } from "../types";
import { AnimatedMotionComponent } from "./AnimatedMotionComponent";
import manifest from "./manifest.json";
import { palettes } from "./palettes";

const themeModule: ThemeModule = { manifest, Component: AnimatedMotionComponent, palettes };
export default themeModule;
