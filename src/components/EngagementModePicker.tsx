"use client";

import {
  APPLY_PICKER_MODES,
  MODE_DESCRIPTIONS,
  MODE_LABELS,
  type EngagementMode,
} from "@/lib/engagement-modes";

export default function EngagementModePicker({
  value,
  onChange,
}: {
  value?: EngagementMode;
  onChange: (mode: EngagementMode) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {APPLY_PICKER_MODES.map((mode) => {
        const selected = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={`text-left rounded-xl border p-4 transition-all ${
              selected
                ? "border-[var(--ipp-accent)] bg-[var(--ipp-accent)]/10"
                : "border-[var(--ipp-primary)]/15 bg-white hover:border-[var(--ipp-primary)]/30"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`font-semibold ${
                  selected ? "text-[var(--ipp-primary)]" : "text-[var(--ipp-text)]"
                }`}
              >
                {MODE_LABELS[mode]}
              </span>
              {selected && (
                <span className="text-xs font-medium text-[var(--ipp-accent)] bg-[var(--ipp-accent)]/15 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--ipp-secondary)] mt-1.5 leading-relaxed">
              {MODE_DESCRIPTIONS[mode]}
            </p>
          </button>
        );
      })}
    </div>
  );
}
