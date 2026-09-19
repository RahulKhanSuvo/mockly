"use client";

import { useCanvasStore, TextElement } from "@/store/canvasStore";
import { TypographyControls } from "./text/TypographyControls";
import { TextStyleControls } from "./text/TextStyleControls";
import { TextAlignmentControls } from "./text/TextAlignmentControls";

interface TextPropertiesPanelProps {
  frameId: string;
  text: TextElement;
}

export function TextPropertiesPanel({ frameId, text }: TextPropertiesPanelProps) {
  const { updateTextElement, deleteTextElement } = useCanvasStore();

  const handleUpdate = (updates: Partial<TextElement>) => {
    updateTextElement(frameId, text.id, updates);
  };

  return (
    <div className="space-y-4">
      {/* Content Textarea */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Content
        </label>
        <textarea
          value={text.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          rows={3}
          placeholder="Enter text..."
          className="w-full px-2.5 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm resize-none"
        />
      </div>

      {/* Typography (Font family, weight, size, line height) */}
      <TypographyControls element={text} onUpdate={handleUpdate} />

      {/* Style & Decoration (Bold, Italic, Underline, Strikethrough) */}
      <TextStyleControls element={text} onUpdate={handleUpdate} />

      {/* Alignment (Left, Center, Right, Justify) */}
      <TextAlignmentControls element={text} onUpdate={handleUpdate} />

      {/* Font Color */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Color
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={text.fontColor}
            onChange={(e) => handleUpdate({ fontColor: e.target.value })}
            className="w-9 h-9 rounded-md border border-neutral-200 cursor-pointer shrink-0 shadow-sm p-0.5 bg-white"
          />
          <input
            type="text"
            value={text.fontColor}
            onChange={(e) => handleUpdate({ fontColor: e.target.value })}
            className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-neutral-800 uppercase transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Width */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Width (px)
        </label>
        <input
          type="number"
          min={50}
          value={text.width}
          onChange={(e) => handleUpdate({ width: Math.max(50, Number(e.target.value)) })}
          className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
        />
      </div>

      {/* Rotation */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Rotation
          </label>
          <span className="text-xs font-mono text-neutral-400">{text.rotation || 0}°</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={text.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: Number(e.target.value) })}
            className="flex-1 accent-blue-600"
          />
          <input
            type="number"
            min={0}
            max={360}
            value={text.rotation || 0}
            onChange={(e) => handleUpdate({ rotation: Math.min(360, Math.max(0, Number(e.target.value))) })}
            className="w-16 px-2 py-1 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-neutral-800 shadow-sm"
          />
        </div>
      </div>

      {/* Delete Action */}
      <div className="pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => deleteTextElement(frameId, text.id)}
          className="w-full px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-md transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Text Element
        </button>
      </div>
    </div>
  );
}
