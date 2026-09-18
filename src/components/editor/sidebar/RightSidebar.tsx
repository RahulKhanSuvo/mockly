"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { BackgroundPicker } from "./BackgroundPicker";

export default function RightSidebar() {
  const { selectedFrameId, frames, updateFrame, deleteFrame, canvasBgColor, setCanvasBgColor } = useCanvasStore();

  const selectedFrame = frames.find((f) => f.id === selectedFrameId);

  return (
    <aside className="w-64 bg-white border-l border-neutral-200 flex flex-col h-full z-10">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-800">Properties</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedFrame ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Name
              </label>
              <input
                type="text"
                value={selectedFrame.name}
                onChange={(e) => updateFrame(selectedFrame.id, { name: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  X
                </label>
                <input
                  type="number"
                  value={Math.round(selectedFrame.x)}
                  onChange={(e) => updateFrame(selectedFrame.id, { x: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Y
                </label>
                <input
                  type="number"
                  value={Math.round(selectedFrame.y)}
                  onChange={(e) => updateFrame(selectedFrame.id, { y: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div> */}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={Math.round(selectedFrame.width)}
                  onChange={(e) => updateFrame(selectedFrame.id, { width: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={Math.round(selectedFrame.height)}
                  onChange={(e) => updateFrame(selectedFrame.id, { height: Number(e.target.value) })}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <BackgroundPicker frameId={selectedFrame.id} />

            <div className="pt-6">
              <button
                onClick={() => deleteFrame(selectedFrame.id)}
                className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Frame</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={canvasBgColor}
                  onChange={(e) => setCanvasBgColor(e.target.value)}
                  className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={canvasBgColor}
                  onChange={(e) => setCanvasBgColor(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
