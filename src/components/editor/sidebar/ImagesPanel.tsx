"use client";

import { useCanvasStore } from "@/store/canvasStore";
import { Image as ImageIcon } from "lucide-react";

// A curated set of high-quality Unsplash image IDs to mimic API response
const UNSPLASH_IDS = [
  "1501696461404-55f0450fa187",
  "1492211933099-52e1e0d37e7a",
  "1470770973943-d343467475f3",
  "1518791841217-8f162f1e1131",
  "1507525428034-b723cf961d3e",
  "1497250681960-ef046c08a56e",
  "1469474968028-56623f02e42e",
  "1470252656675-cbce39841f4a",
  "1506744626752-25b84931f6bb",
  "1475924156734-496f6cac6ec1",
  "1480796927426-f609979314bd",
  "1490730141103-6cac27aaab94",
];

export function ImagesPanel() {
  const { selectedFrameId, addImageToFrame } = useCanvasStore();

  const handleAddImage = (url: string) => {
    if (!selectedFrameId) return;
    addImageToFrame(selectedFrameId, url);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-neutral-800">
          Photos by Unsplash
        </h3>
        <p className="text-xs text-neutral-500 leading-relaxed">
          {selectedFrameId
            ? "Click a photo to apply it to your selected frame."
            : "Select a frame on the canvas first to apply a photo."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 overflow-y-auto pb-4">
        {UNSPLASH_IDS.map((id) => {
          const thumbnailUrl = `https://images.unsplash.com/photo-${id}?w=300&h=300&fit=crop&auto=format&q=80`;
          const fullUrl = `https://images.unsplash.com/photo-${id}?w=1600&fit=max&auto=format&q=80`;

          return (
            <button
              key={id}
              disabled={!selectedFrameId}
              onClick={() => handleAddImage(fullUrl)}
              className={`relative w-full aspect-square rounded-lg overflow-hidden border ${
                selectedFrameId
                  ? "border-transparent hover:ring-2 hover:ring-brand-primary transition-all cursor-pointer"
                  : "border-neutral-200 opacity-50 cursor-not-allowed"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Unsplash photo"
                className="w-full h-full object-cover bg-neutral-100"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-400">
        <ImageIcon className="w-3.5 h-3.5" />
        <span>Search coming soon</span>
      </div>
    </div>
  );
}
