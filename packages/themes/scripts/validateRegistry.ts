import { listThemes } from "../registry";

try {
  const themes = listThemes();
  console.log(`themes registry OK: ${themes.map((t) => t.manifest.id).join(", ")}`);
  process.exit(0);
} catch (err) {
  console.error("themes registry validation FAILED:", err);
  process.exit(1);
}
