"use client";

import { TextAlign, TextElement } from "@/store/canvasStore";

interface TextAlignmentControlsProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

const ALIGN_OPTIONS: { value: TextAlign; label: string; icon: React.ReactNode }[] = [
  {
    value: "left",
    label: "Align Left",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
  },
  {
    value: "center",
    label: "Align Center",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M4 6h16M7 12h10M5 18h14" />
      </svg>
    ),
  },
  {
    value: "right",
    label: "Align Right",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M4 6h16M10 12h10M6 18h14" />
      </svg>
    ),
  },
  {
    value: "justify",
    label: "Justify",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
];

export function TextAlignmentControls({ element, onUpdate }: TextAlignmentControlsProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
        Alignment
      </label>
      <div className="flex bg-neutral-100/70 p-1 rounded-lg border border-neutral-200/80 gap-1">
        {ALIGN_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            title={opt.label}
            onClick={() => onUpdate({ align: opt.value })}
            className={`flex-1 h-8 rounded-md flex items-center justify-center transition-all ${
              element.align === opt.value
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200/50"
            }`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
