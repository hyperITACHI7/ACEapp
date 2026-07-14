"use client";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Colocated here (not in packages/ui-kit) to avoid that package's Tailwind-content-scanning
 *  gotcha for a brand-new class combination — see Dialog.tsx's comment for the full story. */
export function Switch({ checked, onChange, disabled, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        checked ? "bg-foreground" : "bg-white/10"
      }`}
      {...rest}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
          checked ? "translate-x-6 bg-background" : "translate-x-1 bg-foreground"
        }`}
      />
    </button>
  );
}
