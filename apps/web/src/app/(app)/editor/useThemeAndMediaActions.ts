import { useCallback, useState } from "react";
import type { PortfolioData } from "@portfolio/schema";
import { getTheme } from "@portfolio/themes";
import { useToast } from "@portfolio/ui-kit";

type UpdateDraft = (updater: (prev: PortfolioData) => PortfolioData) => void;

/** Handlers for theme switching (including the premium-purchase gate) and anything that talks to
 *  an external service: image upload, profile photo upload, and GitHub re-sync. Owns the two
 *  bits of state those flows need (`uploadingPhoto`, `pendingPurchaseThemeId`). */
export function useThemeAndMediaActions(portfolioId: string, updateDraft: UpdateDraft) {
  const { showToast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [pendingPurchaseThemeId, setPendingPurchaseThemeId] = useState<string | null>(null);

  const applyThemeId = useCallback(
    (themeId: string) => {
      const theme = getTheme(themeId);
      if (!theme) return;
      updateDraft((prev) => ({
        ...prev,
        themeId,
        palette: theme.manifest.palettes.includes(prev.palette) ? prev.palette : theme.manifest.defaultPalette,
      }));
    },
    [updateDraft]
  );

  const requestThemeChange = useCallback(
    async (themeId: string) => {
      const theme = getTheme(themeId);
      if (!theme) return;
      if (!theme.manifest.isPremium) {
        setPendingPurchaseThemeId(null);
        applyThemeId(themeId);
        return;
      }
      const res = await fetch(`/api/payments/status?themeId=${themeId}`);
      const body = await res.json();
      if (body.owned) {
        setPendingPurchaseThemeId(null);
        applyThemeId(themeId);
      } else {
        // Premium theme not yet owned — surface the buy flow instead of switching immediately.
        setPendingPurchaseThemeId(themeId);
      }
    },
    [applyThemeId]
  );

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/images/upload", { method: "POST", body: formData });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Upload failed.");
    return body.url as string;
  }, []);

  const updateWidgetConfig = useCallback(
    (key: string, patch: Record<string, unknown>) => {
      updateDraft((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => (w.key === key ? { ...w, config: { ...w.config, ...patch } } : w)),
      }));
    },
    [updateDraft]
  );

  const uploadPhoto = useCallback(
    async (file: File) => {
      setUploadingPhoto(true);
      try {
        const url = await uploadImage(file);
        updateDraft((prev) => ({ ...prev, profile: { ...prev.profile, photoUrl: url } }));
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Upload failed.", "error");
      } finally {
        setUploadingPhoto(false);
      }
    },
    [uploadImage, updateDraft, showToast]
  );

  const syncGithub = useCallback(async () => {
    const res = await fetch("/api/github/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ portfolioId }),
    });
    const body = await res.json();
    showToast(body.message ?? (res.ok ? "Synced." : "Sync failed."), res.ok ? "success" : "error");
    if (res.ok) window.location.reload();
  }, [portfolioId, showToast]);

  return {
    uploadingPhoto,
    pendingPurchaseThemeId,
    setPendingPurchaseThemeId,
    applyThemeId,
    requestThemeChange,
    uploadImage,
    updateWidgetConfig,
    uploadPhoto,
    syncGithub,
  };
}
