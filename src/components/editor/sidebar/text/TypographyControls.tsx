"use client";

import { TextElement } from "@/store/canvasStore";

interface TypographyControlsProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export const FONT_FAMILIES = [
  { name: "Inter", value: "Inter" },
  { name: "Roboto", value: "Roboto" },
  { name: "Georgia", value: "Georgia" },
  { name: "Courier New", value: "Courier New" },
  { name: "Impact", value: "Impact" },
  { name: "Arial", value: "Arial" },
  { name: "Verdana", value: "Verdana" },
  { name: "Trebuchet MS", value: "Trebuchet MS" },
  { name: "Times New Roman", value: "Times New Roman" },
];

export const FONT_WEIGHTS = [
  { label: "Normal (400)", value: "normal" },
  { label: "Medium (500)", value: "500" },
  { label: "Semi Bold (600)", value: "600" },
  { label: "Bold (700)", value: "bold" },
  { label: "Extra Bold (800)", value: "800" },
];

export function TypographyControls({ element, onUpdate }: TypographyControlsProps) {
  const currentWeight = element.fontWeight || (element.fontStyle?.includes("bold") ? "bold" : "normal");

  const handleWeightChange = (newWeight: string) => {
    const isBold = newWeight === "bold" || newWeight === "800" || newWeight === "600";
    const isItalic = element.fontStyle === "italic" || element.fontStyle === "bold italic";
    
    let newFontStyle: TextElement["fontStyle"] = "normal";
    if (isBold && isItalic) newFontStyle = "bold italic";
    else if (isBold) newFontStyle = "bold";
    else if (isItalic) newFontStyle = "italic";

    onUpdate({
      fontWeight: newWeight,
      fontStyle: newFontStyle,
    });
  };

  return (
    <div className="space-y-3">
      {/* Font Family */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Font Family
        </label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-neutral-800 transition-all shadow-sm"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Font Weight
        </label>
        <select
          value={currentWeight}
          onChange={(e) => handleWeightChange(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-neutral-800 transition-all shadow-sm"
        >
          {FONT_WEIGHTS.map((w) => (
            <option key={w.value} value={w.value}>
              {w.label}
            </option>
          ))}
        </select>
      </div>

      {/* Size and Line Height */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Size (px)
          </label>
          <input
            type="number"
            min={8}
            max={800}
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: Math.max(8, Number(e.target.value)) })}
            className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Line Height
          </label>
          <input
            type="number"
            min={0.5}
            max={4}
            step={0.1}
            value={element.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
          />
        </div>
      </div>
    </div>
  );
}
