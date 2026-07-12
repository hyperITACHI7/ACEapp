import { listWidgets } from "../registry";

try {
  const widgets = listWidgets();
  for (const { manifest } of widgets) {
    if (typeof manifest.section !== "string" || manifest.section.trim() === "") {
      throw new Error(`Widget "${manifest.key}" is missing a non-empty manifest.section`);
    }
  }
  console.log(`widgets registry OK: ${widgets.map((w) => `${w.manifest.key} (section: ${w.manifest.section})`).join(", ")}`);
  process.exit(0);
} catch (err) {
  console.error("widgets registry validation FAILED:", err);
  process.exit(1);
}
