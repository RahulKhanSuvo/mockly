"use client";

import { useCanvasStore } from "@/store/canvasStore";

const FRAME_TEMPLATES = [
  {
    category: "App Store Screenshots",
    items: [
      { name: "iPhone 6.7\"", width: 1290, height: 2796 },
      { name: "iPhone 6.5\"", width: 1242, height: 2688 },
      { name: "iPhone 5.5\"", width: 1242, height: 2208 },
      { name: "iPad Pro 12.9\"", width: 2048, height: 2732 },
      { name: "Android Phone", width: 1080, height: 2400 },
      { name: "Android Tablet", width: 1600, height: 2560 },
      { name: "Mac", width: 2560, height: 1600 },
    ],
  },
  {
    category: "Mockups",
    items: [
      { name: "4:3 Standard", width: 1600, height: 1200 },
      { name: "16:9 Widescreen", width: 1920, height: 1080 },
    ],
  },
  {
    category: "Graphics",
    items: [
      { name: "Google Play Feature", width: 1024, height: 500 },
      { name: "App Store Banner", width: 4320, height: 1080 },
    ],
  },
];

export default function LeftSidebar() {
  const { addFrame, frames, activeLeftTab } = useCanvasStore();

  const handleAddFrame = (name: string, width: number, height: number, type: 'screenshot' | 'mockup' | 'graphic' | 'custom' = 'screenshot') => {
    let x = 100;
    let y = 100;
    
    if (frames.length > 0) {
      const lastFrame = frames[frames.length - 1];
      x = lastFrame.x + lastFrame.width + 100;
      y = lastFrame.y;
    }

    addFrame({ name, type, width, height, x, y });
  };

  const renderContent = () => {
    switch (activeLeftTab) {
      case "templates":
        return (
          <div className="space-y-6">
            {FRAME_TEMPLATES.map((section) => (
              <div key={section.category}>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                  {section.category}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {section.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleAddFrame(item.name, item.width, item.height)}
                      className="flex flex-col items-center justify-center p-3 text-xs bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors"
                    >
                      <span className="font-medium text-neutral-700 text-center">{item.name}</span>
                      <span className="text-neutral-400 mt-1">
                        {item.width}x{item.height}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                Custom
              </h3>
              <button
                onClick={() => handleAddFrame("Custom Size", 800, 800, "custom")}
                className="w-full p-3 text-xs bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-md transition-colors font-medium text-neutral-700"
              >
                + Add Custom Frame
              </button>
            </div>
          </div>
        );
      
      case "elements":
        return (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 text-center">
            Elements library coming soon...
          </div>
        );

      case "text":
        return (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400 text-center">
            Text elements coming soon...
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
        <h2 className="font-semibold text-neutral-800 capitalize">
          {activeLeftTab}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </aside>
  );
}
