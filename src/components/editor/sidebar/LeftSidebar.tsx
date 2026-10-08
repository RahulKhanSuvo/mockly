"use client";

import { useCanvasStore } from "@/store/canvasStore";



const TEXT_PRESETS = [
  { label: "Heading",    fontSize: 120, fontStyle: "bold"   as const, text: "Heading"    },
  { label: "Subheading", fontSize: 80,  fontStyle: "bold"   as const, text: "Subheading" },
  { label: "Body",       fontSize: 52,  fontStyle: "normal" as const, text: "Body text"  },
  { label: "Caption",    fontSize: 36,  fontStyle: "italic" as const, text: "Caption"    },
];

export default function LeftSidebar() {
  const { activeLeftTab, selectedFrameId } = useCanvasStore();



  const handleAddTextPreset = (preset: (typeof TEXT_PRESETS)[number]) => {
    if (!selectedFrameId) return;
    // addTextToFrame adds a default element; we then patch it with preset values
    const store = useCanvasStore.getState();
    store.addTextToFrame(selectedFrameId);
    // After the action the new element will be the last one in the frame
    const updatedFrames = useCanvasStore.getState().frames;
    const frame = updatedFrames.find((f) => f.id === selectedFrameId);
    const newEl = frame?.textElements?.[frame.textElements.length - 1];
    if (newEl) {
      store.updateTextElement(selectedFrameId, newEl.id, {
        text: preset.text,
        fontSize: preset.fontSize,
        fontStyle: preset.fontStyle,
      });
    }
  };

  const renderContent = () => {
    switch (activeLeftTab) {
      case "templates":
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4 py-12">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-700">Templates coming soon</p>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Curated templates will be available here. They&apos;ll load from our online library automatically.
              </p>
            </div>
          </div>
        );


      case "text":
        return (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              {selectedFrameId
                ? "Click a preset to add it to the selected frame."
                : "Select a frame on the canvas first."}
            </p>

            {TEXT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                disabled={!selectedFrameId}
                onClick={() => handleAddTextPreset(preset)}
                className={`w-full px-4 py-3 rounded-md border text-left transition-colors ${
                  selectedFrameId
                    ? "bg-neutral-50 hover:bg-neutral-100 border-neutral-200 cursor-pointer"
                    : "bg-neutral-50 border-neutral-100 cursor-not-allowed opacity-50"
                }`}
              >
                <span
                  className="block text-neutral-800"
                  style={{
                    fontSize: `${Math.min(preset.fontSize / 10, 22)}px`,
                    fontWeight: preset.fontStyle === "bold" ? 700 : 400,
                    fontStyle: preset.fontStyle === "italic" ? "italic" : "normal",
                  }}
                >
                  {preset.label}
                </span>
                <span className="text-xs text-neutral-400 mt-0.5 block">
                  {preset.fontSize}px · {preset.fontStyle}
                </span>
              </button>
            ))}

            <div className="pt-2 border-t border-neutral-100">
              <p className="text-xs text-neutral-400">
                Tip: You can also use the{" "}
                <span className="font-semibold text-neutral-600">T</span> button in the
                canvas toolbar to add a text block.
              </p>
            </div>
          </div>
        );

      case "elements":
        return (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 text-center">
            Elements library coming soon...
          </div>
        );

      case "images":
        return (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 text-center">
            Image uploads coming soon...
          </div>
        );

      case "background":
        return (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 text-center">
            Global background settings coming soon...
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-neutral-200 flex flex-col h-full z-10 shadow-sm relative">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="font-semibold text-neutral-800 capitalize">{activeLeftTab}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
    </aside>
  );
}
