import { listWidgetsBySection } from "@portfolio/widgets";
import { Chip } from "@portfolio/ui-kit";
import { sectionIcon, sectionColor, sectionLabel } from "../editor/sectionMeta";

/** Every registered widget, grouped by section — always "Available" since widgets are never
 *  individually premium (only themes are purchasable). Reuses the same icon/color/label helpers
 *  as the editor's Widget Drawer/Outline Sidebar so a widget reads identically everywhere. */
export function AssetsWidgets() {
  const bySection = listWidgetsBySection();

  return (
    <div className="flex flex-col gap-5">
      {Object.entries(bySection).map(([section, widgets]) => {
        const Icon = sectionIcon(section);
        const color = sectionColor(section);
        return (
          <div key={section} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}22`, color }}
              >
                <Icon size={13} />
              </span>
              <span className="text-sm font-medium">{sectionLabel(section)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {widgets.map((w) => (
                <div
                  key={w.manifest.key}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between gap-2"
                >
                  <span className="text-sm truncate">{w.manifest.label}</span>
                  <Chip tone="positive">Available</Chip>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
