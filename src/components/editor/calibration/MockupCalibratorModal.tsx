"use client";

import { useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Circle,
  Line,
  Group,
} from "react-konva";
import useImage from "use-image";
import { MockupAsset, ScreenMapping, Point } from "@/types/mockup";
import { renderPerspectiveScreenshot } from "@/utils/perspectiveRenderer";
import { X, Copy, Check, RotateCcw, Sparkles } from "lucide-react";

interface MockupCalibratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mockup: MockupAsset;
  onSave?: (updatedScreen: ScreenMapping) => void;
}

const SAMPLE_SCREENSHOT_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="1200" viewBox="0 0 600 1200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
  </defs>
  <rect width="600" height="1200" fill="url(#bg)" />
  <circle cx="300" cy="300" r="140" fill="rgba(255,255,255,0.2)" />
  <rect x="80" y="500" width="440" height="80" rx="16" fill="rgba(255,255,255,0.9)" />
  <rect x="80" y="620" width="440" height="180" rx="16" fill="rgba(255,255,255,0.9)" />
  <rect x="80" y="830" width="440" height="240" rx="16" fill="rgba(255,255,255,0.9)" />
  <text x="300" y="550" font-family="sans-serif" font-size="28" font-weight="bold" fill="#1e293b" text-anchor="middle">SCREENSHOT PREVIEW</text>
  <text x="300" y="720" font-family="sans-serif" font-size="22" fill="#475569" text-anchor="middle">Calibrating 4 Perspective Points</text>
</svg>
`);

export default function MockupCalibratorModal({
  isOpen,
  onClose,
  mockup,
  onSave,
}: MockupCalibratorModalProps) {
  const [screen, setScreen] = useState<ScreenMapping>(mockup.screen);
  const [copied, setCopied] = useState(false);
  const [activeCorner, setActiveCorner] = useState<keyof ScreenMapping | null>(
    null,
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [customAssetUrl, setCustomAssetUrl] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [warpedCanvas, setWarpedCanvas] = useState<HTMLCanvasElement | null>(
    null,
  );

  const assetPath = customAssetUrl || mockup.assetUrl;
  const [mockupImg] = useImage(assetPath);

  // Load sample screenshot for real-time warped preview
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = SAMPLE_SCREENSHOT_URL;
    img.onload = () => setPreviewImage(img);
  }, []);

  // Reset screen state when mockup changes
  useEffect(() => {
    setScreen(mockup.screen);
  }, [mockup]);

  // Re-render perspective screenshot offscreen whenever screen points change
  useEffect(() => {
    if (!previewImage) return;
    const canvas = renderPerspectiveScreenshot(
      previewImage,
      screen,
      mockup.width,
      mockup.height,
    );
    setWarpedCanvas(canvas);
  }, [previewImage, screen, mockup.width, mockup.height]);

  if (!isOpen) return null;

  const handlePointDrag = (
    corner: keyof ScreenMapping,
    x: number,
    y: number,
  ) => {
    setScreen((prev) => ({
      ...prev,
      [corner]: { x: Math.round(x), y: Math.round(y) },
    }));
  };

  const handleCopyJSON = () => {
    const data = {
      id: mockup.id,
      name: mockup.name,
      asset: assetPath,
      width: mockup.width,
      height: mockup.height,
      screen,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    onSave?.(screen);
    onClose();
  };

  const points: {
    key: "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
    label: string;
    color: string;
  }[] = [
    { key: "topLeft", label: "TL", color: "#3b82f6" },
    { key: "topRight", label: "TR", color: "#10b981" },
    { key: "bottomRight", label: "BR", color: "#f59e0b" },
    { key: "bottomLeft", label: "BL", color: "#ef4444" },
  ];

  const polyPoints = [
    screen.topLeft.x,
    screen.topLeft.y,
    screen.topRight.x,
    screen.topRight.y,
    screen.bottomRight.x,
    screen.bottomRight.y,
    screen.bottomLeft.x,
    screen.bottomLeft.y,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-neutral-200 flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Mockup Screen Calibration Mode
            </h2>
            <p className="text-xs text-neutral-500">
              Drag the 4 corner handles to align with the device screen bezels.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Stage Canvas area */}
          <div className="flex-1 bg-neutral-900 relative flex items-center justify-center p-6 overflow-auto">
            <div className="relative shadow-2xl rounded-lg overflow-hidden border border-neutral-700">
              <Stage width={mockup.width} height={mockup.height}>
                <Layer>
                  {/* Layer 1: Transformed screenshot preview */}
                  {warpedCanvas && (
                    <KonvaImage
                      image={warpedCanvas}
                      width={mockup.width}
                      height={mockup.height}
                    />
                  )}

                  {/* Layer 2: Device mockup frame image overlay */}
                  {mockupImg && (
                    <KonvaImage
                      image={mockupImg}
                      width={mockup.width}
                      height={mockup.height}
                      opacity={0.85}
                    />
                  )}

                  {/* Layer 3: Quadrilateral screen outline */}
                  <Line
                    points={polyPoints}
                    closed
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[6, 4]}
                  />

                  {/* Layer 4: Interactive Corner Drag Handles */}
                  {points.map(({ key, color }) => {
                    const pt = screen[key] as Point;
                    const isSelected = activeCorner === key;
                    return (
                      <Group key={key}>
                        {/* Target ring */}
                        <Circle
                          x={pt.x}
                          y={pt.y}
                          radius={16}
                          fill={color}
                          opacity={0.3}
                        />
                        {/* Draggable point */}
                        <Circle
                          x={pt.x}
                          y={pt.y}
                          radius={8}
                          fill={color}
                          stroke="#ffffff"
                          strokeWidth={2}
                          draggable
                          onDragMove={(e) =>
                            handlePointDrag(key, e.target.x(), e.target.y())
                          }
                          onMouseEnter={() => setActiveCorner(key)}
                          onMouseLeave={() => setActiveCorner(null)}
                          shadowColor="#000"
                          shadowBlur={isSelected ? 10 : 4}
                        />
                      </Group>
                    );
                  })}
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Right Controls / Metadata Inspector */}
          <div className="w-80 border-l border-neutral-200 bg-white p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                  Screen Coordinates
                </h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Mockup Dimensions: {mockup.width} × {mockup.height} px
                </p>

                <div className="space-y-3">
                  {points.map(({ key, label, color }) => (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                        activeCorner === key
                          ? "border-blue-500 bg-blue-50/50"
                          : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-neutral-700">
                          {label} ({key})
                        </span>
                      </div>
                      <span className="font-mono text-neutral-600">
                        X: {screen[key].x}, Y: {screen[key].y}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider mb-2">
                  Metadata Output
                </h3>
                <div className="relative">
                  <pre className="p-3 bg-neutral-900 text-green-400 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 border border-neutral-800">
                    {JSON.stringify(screen, null, 2)}
                  </pre>
                  <button
                    onClick={handleCopyJSON}
                    className="absolute top-2 right-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-200 space-y-2">
              <button
                onClick={() => setScreen(mockup.screen)}
                className="w-full py-2 px-3 border border-neutral-300 hover:bg-neutral-50 rounded-lg text-xs font-medium text-neutral-700 flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw size={14} />
                Reset to Default
              </button>
              <button
                onClick={handleSave}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                Save Calibration
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
