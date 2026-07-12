"use client";

import type { PortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { Dialog, DialogContent, DialogTitle } from "@portfolio/ui-kit";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { PalettePicker } from "./PalettePicker";
import { BuyThemeButton } from "./BuyThemeButton";
import { GithubImportModal } from "./GithubImportModal";
import { ResumeImportPanel } from "./ResumeImportPanel";

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-400/60 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.15)] transition-all";
const labelClass = "block text-sm font-medium text-muted-foreground mb-1.5";

interface SettingsModalProps {
  portfolioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: PortfolioData;
  updateDraft: (updater: (prev: PortfolioData) => PortfolioData) => void;
  uploadingPhoto: boolean;
  onUploadPhoto: (file: File) => void;
  pendingPurchaseThemeId: string | null;
  onRequestThemeChange: (themeId: string) => void;
  onApplyThemeId: (themeId: string) => void;
  onPurchaseDone: () => void;
  onSyncGithub: () => void;
}

/**
 * Houses everything that isn't per-section canvas content: Theme/Palette, GitHub import, and
 * top-level profile fields (name/headline/photo — bio stays inline-editable on canvas since
 * it's About-section content). All handlers are owned by EditorClient and passed in unchanged.
 */
export function SettingsModal({
  portfolioId,
  open,
  onOpenChange,
  draft,
  updateDraft,
  uploadingPhoto,
  onUploadPhoto,
  pendingPurchaseThemeId,
  onRequestThemeChange,
  onApplyThemeId,
  onPurchaseDone,
  onSyncGithub,
}: SettingsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Settings</DialogTitle>
        <div className="flex flex-col gap-6">
          {/* Theme first — this is the most common reason to open this modal mid-edit. */}
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Theme</h3>
            <ThemeSwitcher themeId={draft.themeId} onChange={onRequestThemeChange} />
            {pendingPurchaseThemeId && (
              <div className="rounded-xl border border-purple-400/20 bg-purple-500/5 p-4 flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
                  This is a premium theme — purchase it to switch your portfolio to it.
                </p>
                <BuyThemeButton
                  themeId={pendingPurchaseThemeId}
                  priceInPaise={getTheme(pendingPurchaseThemeId)!.manifest.priceInPaise}
                  onPurchased={() => {
                    onApplyThemeId(pendingPurchaseThemeId);
                    onPurchaseDone();
                  }}
                />
              </div>
            )}
            <PalettePicker
              themeId={draft.themeId}
              palette={draft.palette}
              onChange={(palette) => updateDraft((prev) => ({ ...prev, palette }))}
            />
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile</h3>
            <div>
              <label className={labelClass}>Name</label>
              <input
                className={fieldClass}
                value={draft.profile.name}
                onChange={(e) => updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, name: e.target.value } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Headline</label>
              <input
                className={fieldClass}
                value={draft.profile.headline}
                onChange={(e) =>
                  updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, headline: e.target.value } }))
                }
              />
            </div>
            <div>
              <label className={labelClass}>Profile photo</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploadingPhoto}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-foreground file:text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadPhoto(file);
                }}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Resume</h3>
            <ResumeImportPanel draft={draft} updateDraft={updateDraft} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">GitHub</h3>
            <GithubImportModal
              portfolioId={portfolioId}
              github={draft.integrations.github}
              onConnected={() => window.location.reload()}
              onImported={() => window.location.reload()}
            />
            {draft.integrations.github && (
              <button
                onClick={onSyncGithub}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
              >
                Re-sync pinned repos
              </button>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
