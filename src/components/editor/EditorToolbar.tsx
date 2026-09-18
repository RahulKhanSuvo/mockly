"use client";

import { useCanvasStore } from "@/store/canvasStore";

export default function EditorToolbar() {
  const { selectedFrameId, addTextToFrame, undo, redo, canUndo, canRedo } = useCanvasStore();

  const canAddText = !!selectedFrameId;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg px-2.5 py-1.5">
      {/* Undo Button */}
      <button
        id="toolbar-undo-btn"
        title="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={!canUndo}
        className={`
          flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-all text-[11px] font-semibold gap-0.5
          ${canUndo
            ? "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
            : "text-neutral-300 cursor-not-allowed opacity-40"
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="leading-none text-[10px]">Undo</span>
      </button>

      {/* Redo Button */}
      <button
        id="toolbar-redo-btn"
        title="Redo (Ctrl+Y)"
        onClick={redo}
        disabled={!canRedo}
        className={`
          flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-all text-[11px] font-semibold gap-0.5
          ${canRedo
            ? "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
            : "text-neutral-300 cursor-not-allowed opacity-40"
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
        </svg>
        <span className="leading-none text-[10px]">Redo</span>
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-neutral-200 mx-0.5" />

      {/* Text tool */}
      <button
        id="toolbar-text-btn"
        title={canAddText ? "Add Text (T)" : "Select a frame first"}
        onClick={() => {
          if (selectedFrameId) addTextToFrame(selectedFrameId);
        }}
        disabled={!canAddText}
        className={`
          flex flex-col items-center justify-center w-9 h-9 rounded-lg transition-all text-[11px] font-semibold gap-0.5
          ${canAddText
            ? "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
            : "text-neutral-300 cursor-not-allowed opacity-40"
          }
        `}
      >
        <span className="text-base leading-none font-bold" style={{ fontFamily: "Georgia, serif" }}>T</span>
        <span className="leading-none text-[10px]">Text</span>
      </button>
    </div>
  );
}
