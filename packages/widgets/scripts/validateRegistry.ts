import { listWidgets } from "../registry";

// "WxH": width 1|2, height 1..12 (mirrors GridPlacementSchema's h cap).
const SIZE_PATTERN = /^[12]x(1[0-2]|[1-9])$/;

try {
  const widgets = listWidgets();
  for (const { manifest } of widgets) {
    if (typeof manifest.section !== "string" || manifest.section.trim() === "") {
      throw new Error(`Widget "${manifest.key}" is missing a non-empty manifest.section`);
    }
    if (manifest.sizes !== undefined) {
      if (manifest.sizes.length === 0) {
        throw new Error(`Widget "${manifest.key}" has an empty manifest.sizes — omit the field entirely to allow all footprints`);
      }
      for (const size of manifest.sizes) {
        if (!SIZE_PATTERN.test(size)) {
          throw new Error(`Widget "${manifest.key}" has an invalid size "${size}" in manifest.sizes — must be "WxH" with W in {1,2} and H in 1..12`);
        }
      }
      // Only the native/reference footprint may exceed 2 rows — alternates stay within 2x2, so
      // a second tall entry is an authoring mistake (see WidgetManifest.sizes doc comment).
      const tall = manifest.sizes.filter((s) => Number(s.split("x")[1]) > 2);
      if (tall.length > 1) {
        throw new Error(
          `Widget "${manifest.key}" declares ${tall.length} sizes taller than 2 rows (${tall.join(", ")}) — only the single native footprint may exceed 2x2`
        );
      }
    }
  }
  console.log(`widgets registry OK: ${widgets.map((w) => `${w.manifest.key} (section: ${w.manifest.section})`).join(", ")}`);
  process.exit(0);
} catch (err) {
  console.error("widgets registry validation FAILED:", err);
  process.exit(1);
}
