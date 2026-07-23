'use client';

import type { PartnershipType } from '@/lib/types';
import { PARTNERSHIP_LABELS, PARTNERSHIP_OPTIONS } from '@/lib/partnerships';

interface PartnershipTypePickerProps {
  value: PartnershipType;
  onChange: (type: PartnershipType) => void;
}

export default function PartnershipTypePicker({ value, onChange }: PartnershipTypePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      {PARTNERSHIP_OPTIONS.map((opt) => {
        const selected = value === opt.type;
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onChange(opt.type)}
            className={`text-left rounded-xl border p-4 transition-all ${
              selected
                ? 'border-[var(--ipp-accent)] bg-[var(--ipp-accent)]/10'
                : 'border-[var(--ipp-primary)]/15 bg-white hover:border-[var(--ipp-primary)]/30'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`font-semibold ${selected ? 'text-[var(--ipp-primary)]' : 'text-[var(--ipp-text)]'}`}>
                {PARTNERSHIP_LABELS[opt.type]}
              </span>
              {selected && (
                <span className="text-xs font-medium text-[var(--ipp-accent)] bg-[var(--ipp-accent)]/15 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--ipp-secondary)] mt-1.5 leading-relaxed">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
