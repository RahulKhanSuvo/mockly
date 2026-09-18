"use client";

import { useCanvasStore, Frame } from "@/store/canvasStore";
import { BackgroundPicker } from "./BackgroundPicker";
import { ExportPanel } from "./ExportPanel";

interface FramePropertiesPanelProps {
  frame: Frame;
}

export function FramePropertiesPanel({ frame }: FramePropertiesPanelProps) {
  const { updateFrame, deleteFrame } = useCanvasStore();

  return (
    <div className="space-y-4">
      {/* Frame Name */}
      <div>
        <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
          Frame Name
        </label>
        <input
          type="text"
          value={frame.name}
          onChange={(e) => updateFrame(frame.id, { name: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
        />
      </div>

      {/* Frame Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Width (px)
          </label>
          <input
            type="number"
            value={Math.round(frame.width)}
            onChange={(e) => updateFrame(frame.id, { width: Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            Height (px)
          </label>
          <input
            type="number"
            value={Math.round(frame.height)}
            onChange={(e) => updateFrame(frame.id, { height: Number(e.target.value) })}
            className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-neutral-800 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Frame Background Picker */}
      <BackgroundPicker frameId={frame.id} />

      {/* Export Controls */}
      <ExportPanel frameId={frame.id} />

      {/* Delete Frame Action */}
      <div className="pt-2 border-t border-neutral-100">
        <button
          type="button"
          onClick={() => deleteFrame(frame.id)}
          className="w-full px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-md transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Frame
        </button>
      </div>
    </div>
  );
}
