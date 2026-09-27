"use client";

import { useState, useEffect } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import useImage from "use-image";
import { Frame } from "@/store/canvasStore";
import { getMockupById, MOCKUP_LIBRARY } from "@/data/mockups";
import { renderPerspectiveScreenshot } from "@/utils/perspectiveRenderer";

interface PerspectiveMockupNodeProps {
  frame: Frame;
  isSelected: boolean;
  zoom: number;
}

export function PerspectiveMockupNode({ frame, isSelected }: PerspectiveMockupNodeProps) {
  const mockupAsset = getMockupById(frame.mockupId || "iphone18-perspective") || MOCKUP_LIBRARY[0];
  const screenMapping = frame.customScreen || mockupAsset.screen;

  const [frameImg] = useImage(mockupAsset.assetUrl);
  const [screenshotImg, setScreenshotImg] = useState<HTMLImageElement | null>(null);
  const [warpedCanvas, setWarpedCanvas] = useState<HTMLCanvasElement | null>(null);

  // Load screenshot image when screenshotUrl changes
  useEffect(() => {
    if (!frame.screenshotUrl) {
      setScreenshotImg(null);
      setWarpedCanvas(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = frame.screenshotUrl;
    img.onload = () => setScreenshotImg(img);
  }, [frame.screenshotUrl]);

  // Re-render perspective screenshot offscreen canvas
  useEffect(() => {
    if (!screenshotImg) return;
    const canvas = renderPerspectiveScreenshot(
      screenshotImg,
      screenMapping,
      frame.width,
      frame.height
    );
    setWarpedCanvas(canvas);
  }, [screenshotImg, screenMapping, frame.width, frame.height]);

  return (
    <Group>
      {/* 1. Transformed Screenshot Layer */}
      {warpedCanvas && (
        <KonvaImage
          image={warpedCanvas}
          width={frame.width}
          height={frame.height}
          listening={false}
        />
      )}

      {/* 2. Device Mockup Frame Overlay */}
      {frameImg && (
        <KonvaImage
          image={frameImg}
          width={frame.width}
          height={frame.height}
          listening={false}
        />
      )}

      {/* Placeholder / Empty Screen outline if no screenshot is uploaded */}
      {!warpedCanvas && (
        <Rect
          width={frame.width}
          height={frame.height}
          fill="rgba(0, 0, 0, 0.03)"
          stroke="#cbd5e1"
          strokeWidth={1}
          dash={[8, 8]}
          listening={false}
        />
      )}

      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={frame.width}
          height={frame.height}
          stroke="#2563eb"
          strokeWidth={3}
          listening={false}
        />
      )}
    </Group>
  );
}
