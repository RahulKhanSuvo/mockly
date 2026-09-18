"use client";

import { useCanvasStore, BackgroundType } from "@/store/canvasStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { useState } from "react";

const SOLID_COLORS = [
  "#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93",
  "#f15bb5", "#00bbf9", "#00f5d4", "#fee440", "#9b5de5",
  "#000000", "#ffffff", "#495057", "#adb5bd", "#f8f9fa",
];

const GRADIENTS = [
  { colors: ["#ff9a9e", "#fecfef"], angle: 90 },
  { colors: ["#a18cd1", "#fbc2eb"], angle: 45 },
  { colors: ["#84fab0", "#8fd3f4"], angle: 180 },
  { colors: ["#a1c4fd", "#c2e9fb"], angle: 135 },
  { colors: ["#ffecd2", "#fcb69f"], angle: 90 },
  { colors: ["#cfd9df", "#e2ebf0"], angle: 0 },
  { colors: ["#667eea", "#764ba2"], angle: 135 },
  { colors: ["#f093fb", "#f5576c"], angle: 90 },
  { colors: ["#4facfe", "#00f2fe"], angle: 180 },
  { colors: ["#43e97b", "#38f9d7"], angle: 0 },
  { colors: ["#fa709a", "#fee140"], angle: 90 },
  { colors: ["#a8edea", "#fed6e3"], angle: 45 },
];

const MOCK_IMAGES = [
  { id: 1, url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80", author: "Gradient 1" },
  { id: 2, url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80", author: "Gradient 2" },
  { id: 3, url: "https://images.unsplash.com/photo-1579546929662-711fa81629d3?w=400&q=80", author: "Gradient 3" },
  { id: 4, url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80", author: "Gradient 4" },
  { id: 5, url: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80", author: "Gradient 5" },
  { id: 6, url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80", author: "Liquid" },
];

export function BackgroundPicker({ frameId }: { frameId: string }) {
  const { frames, updateFrame } = useCanvasStore();
  const frame = frames.find((f) => f.id === frameId);
  const [imageSearch, setImageSearch] = useState("");
  // Tab is purely UI navigation — does NOT change the frame's background
  const [activeTab, setActiveTab] = useState<string>(frame?.backgroundType || "solid");

  if (!frame) return null;

  // Helpers that set backgroundType AND the value together
  const applySolid = (color: string) => {
    updateFrame(frameId, { backgroundType: "solid" as BackgroundType, backgroundColor: color });
  };

  const applyGradient = (gradient: { colors: string[]; angle: number }) => {
    updateFrame(frameId, { backgroundType: "gradient" as BackgroundType, backgroundGradient: gradient });
  };

  const applyImage = (url: string) => {
    updateFrame(frameId, { backgroundType: "image" as BackgroundType, backgroundImage: url });
  };

  // Custom gradient state (derived from frame or defaults)
  const customColor1 = frame.backgroundGradient?.colors[0] || "#667eea";
  const customColor2 = frame.backgroundGradient?.colors[1] || "#764ba2";
  const customAngle = frame.backgroundGradient?.angle ?? 90;

  return (
    <div className="pt-4 border-t border-neutral-100">
      <label className="block text-xs font-medium text-neutral-500 mb-3">
        Background
      </label>
      
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="solid" className="text-xs">Solid</TabsTrigger>
          <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
          <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>
        </TabsList>

        {/* ── SOLID TAB ── */}
        <TabsContent value="solid" className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={frame.backgroundColor || "#ffffff"}
              onChange={(e) => applySolid(e.target.value)}
              className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
            />
            <input
              type="text"
              value={frame.backgroundColor || "#ffffff"}
              onChange={(e) => applySolid(e.target.value)}
              className="flex-1 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {SOLID_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => applySolid(color)}
                className="w-full aspect-square rounded-md border border-neutral-200 transition-transform hover:scale-110 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </TabsContent>

        {/* ── GRADIENT TAB ── */}
        <TabsContent value="gradient" className="space-y-4">
          {/* Custom Gradient Builder */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-neutral-500">Custom Gradient</span>

            {/* Color Stop 1 */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor1}
                onChange={(e) => applyGradient({ colors: [e.target.value, customColor2], angle: customAngle })}
                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor1}
                onChange={(e) => applyGradient({ colors: [e.target.value, customColor2], angle: customAngle })}
                className="flex-1 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            {/* Color Stop 2 */}
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={customColor2}
                onChange={(e) => applyGradient({ colors: [customColor1, e.target.value], angle: customAngle })}
                className="w-8 h-8 rounded border border-neutral-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor2}
                onChange={(e) => applyGradient({ colors: [customColor1, e.target.value], angle: customAngle })}
                className="flex-1 px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>

            {/* Angle */}
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Angle</label>
              <select 
                className="w-full px-2 py-1.5 text-sm border border-neutral-300 rounded focus:outline-none"
                value={customAngle}
                onChange={(e) => applyGradient({ colors: [customColor1, customColor2], angle: Number(e.target.value) })}
              >
                <option value="90">Top to Bottom</option>
                <option value="270">Bottom to Top</option>
                <option value="180">Left to Right</option>
                <option value="0">Right to Left</option>
                <option value="135">Top-Left → Bottom-Right</option>
                <option value="45">Bottom-Left → Top-Right</option>
              </select>
            </div>

            {/* Live preview */}
            <div
              className="w-full h-8 rounded-md border border-neutral-200"
              style={{ background: `linear-gradient(${customAngle}deg, ${customColor1}, ${customColor2})` }}
            />
          </div>

          {/* Preset Gradients */}
          <div className="pt-2 border-t border-neutral-100">
            <span className="block text-xs font-medium text-neutral-400 mb-2">Presets</span>
            <div className="grid grid-cols-2 gap-2">
              {GRADIENTS.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => applyGradient(grad)}
                  className="w-full h-8 rounded-md border border-neutral-200 transition-transform hover:scale-105 shadow-sm"
                  style={{ background: `linear-gradient(${grad.angle}deg, ${grad.colors[0]}, ${grad.colors[1]})` }}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── IMAGE TAB ── */}
        <TabsContent value="image" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for photos..."
              value={imageSearch}
              onChange={(e) => setImageSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {MOCK_IMAGES.map((img) => (
              <button
                key={img.id}
                onClick={() => applyImage(img.url)}
                className="relative group w-full aspect-video rounded-md overflow-hidden border border-neutral-200 hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="background" className="object-cover w-full h-full" />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white truncate block">by {img.author}</span>
                </div>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

