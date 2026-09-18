"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { TextPropertiesPanel } from "./TextPropertiesPanel";
import { FramePropertiesPanel } from "./FramePropertiesPanel";

export default function RightSidebar() {
  const {
    selectedFrameId,
    selectedTextId,
    frames,
    canvasBgColor,
    setCanvasBgColor,
  } = useCanvasStore();

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);
  const selectedText = selectedFrame?.textElements?.find((t) => t.id === selectedTextId);

  return (
    <aside className="w-72 bg-white border-l border-neutral-200 flex flex-col h-full z-10 shadow-sm">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-200/80 bg-neutral-50/50">
        <h2 className="font-bold text-neutral-800 text-sm tracking-wide flex items-center justify-between">
          <span>{selectedText ? "Text Styling" : selectedFrame ? "Frame Properties" : "Canvas Properties"}</span>
          {selectedText && (
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">
              Text Active
            </span>
          )}
        </h2>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedText && selectedFrame ? (
          /* Modular Text Properties Panel */
          <TextPropertiesPanel frameId={selectedFrame.id} text={selectedText} />
        ) : selectedFrame ? (
          /* Modular Frame Properties Panel */
          <FramePropertiesPanel frame={selectedFrame} />
        ) : (
          /* Canvas Global Properties */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                Canvas Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={canvasBgColor}
                  onChange={(e) => setCanvasBgColor(e.target.value)}
                  className="w-9 h-9 rounded-md border border-neutral-200 cursor-pointer flex-shrink-0 shadow-sm p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={canvasBgColor}
                  onChange={(e) => setCanvasBgColor(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-neutral-800 uppercase transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
