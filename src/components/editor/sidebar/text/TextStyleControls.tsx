"use client";

import { TextElement } from "@/store/canvasStore";

interface TextStyleControlsProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
}

export function TextStyleControls({ element, onUpdate }: TextStyleControlsProps) {
  const isBold = element.fontStyle === "bold" || element.fontStyle === "bold italic" || element.fontWeight === "bold" || element.fontWeight === "700" || element.fontWeight === "800";
  const isItalic = element.fontStyle === "italic" || element.fontStyle === "bold italic";
  
  const currentDecoration = element.textDecoration || "";
  const isUnderline = currentDecoration.includes("underline");
  const isStrikethrough = currentDecoration.includes("line-through");

  // Toggle Bold
  const toggleBold = () => {
    const nextBold = !isBold;
    let nextFontStyle: TextElement["fontStyle"] = "normal";
    if (nextBold && isItalic) nextFontStyle = "bold italic";
    else if (nextBold) nextFontStyle = "bold";
    else if (isItalic) nextFontStyle = "italic";

    onUpdate({
      fontStyle: nextFontStyle,
      fontWeight: nextBold ? "bold" : "normal",
    });
  };

  // Toggle Italic
  const toggleItalic = () => {
    const nextItalic = !isItalic;
    let nextFontStyle: TextElement["fontStyle"] = "normal";
    if (isBold && nextItalic) nextFontStyle = "bold italic";
    else if (isBold) nextFontStyle = "bold";
    else if (nextItalic) nextFontStyle = "italic";

    onUpdate({ fontStyle: nextFontStyle });
  };

  // Toggle Underline
  const toggleUnderline = () => {
    const nextUnderline = !isUnderline;
    let newDec = "";
    if (nextUnderline && isStrikethrough) newDec = "underline line-through";
    else if (nextUnderline) newDec = "underline";
    else if (isStrikethrough) newDec = "line-through";

    onUpdate({ textDecoration: newDec });
  };

  // Toggle Strikethrough (Center line / Line-through)
  const toggleStrikethrough = () => {
    const nextStrike = !isStrikethrough;
    let newDec = "";
    if (isUnderline && nextStrike) newDec = "underline line-through";
    else if (nextStrike) newDec = "line-through";
    else if (isUnderline) newDec = "underline";

    onUpdate({ textDecoration: newDec });
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
        Text Style & Decoration
      </label>
      <div className="grid grid-cols-4 gap-1.5 bg-neutral-100/70 p-1 rounded-lg border border-neutral-200/80">
        {/* Bold */}
        <button
          type="button"
          title="Bold"
          onClick={toggleBold}
          className={`h-8 rounded-md font-bold text-sm transition-all flex items-center justify-center ${
            isBold
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/50"
          }`}
        >
          B
        </button>

        {/* Italic */}
        <button
          type="button"
          title="Italic"
          onClick={toggleItalic}
          className={`h-8 rounded-md italic font-serif text-sm transition-all flex items-center justify-center ${
            isItalic
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/50"
          }`}
        >
          I
        </button>

        {/* Underline */}
        <button
          type="button"
          title="Underline"
          onClick={toggleUnderline}
          className={`h-8 rounded-md underline text-sm transition-all flex items-center justify-center ${
            isUnderline
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/50"
          }`}
        >
          U
        </button>

        {/* Strikethrough (Center Line / Line-Through) */}
        <button
          type="button"
          title="Strikethrough (Center Line)"
          onClick={toggleStrikethrough}
          className={`h-8 rounded-md line-through text-sm transition-all flex items-center justify-center ${
            isStrikethrough
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200/50"
          }`}
        >
          S
        </button>
      </div>
    </div>
  );
}
