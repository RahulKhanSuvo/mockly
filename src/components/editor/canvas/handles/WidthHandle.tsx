"use client";

import { useRef } from "react";
import { Rect } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, TextElement } from "@/store/canvasStore";
import { getTextDimensions } from "@/utils/textUtils";

interface WidthHandleProps {
  element: TextElement;
  frameId: string;
  zoom: number;
}

export function WidthHandle({ element, frameId, zoom }: WidthHandleProps) {
  const { updateTextElement } = useCanvasStore();
  const startRef = useRef<{ clientX: number; initialWidth: number } | null>(null);

  const { textHeight } = getTextDimensions(element);

  function onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    e.cancelBubble = true;
    e.evt.preventDefault();
    startRef.current = {
      clientX: e.evt.clientX,
      initialWidth: element.width,
    };

    const st = e.target.getStage();
    if (st) st.container().style.cursor = "ew-resize";
    document.body.style.cursor = "ew-resize";

    const onMove = (me: MouseEvent) => {
      if (!startRef.current) return;
      const deltaX = (me.clientX - startRef.current.clientX) / zoom;
      const newWidth = Math.max(40, Math.round(startRef.current.initialWidth + deltaX));
      updateTextElement(frameId, element.id, { width: newWidth });
    };

    const onUp = () => {
      startRef.current = null;
      document.body.style.cursor = "";
      if (st) st.container().style.cursor = "default";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const handleW = 6 / zoom;
  const handleH = 16 / zoom;

  return (
    <Rect
      x={element.width - handleW / 2}
      y={textHeight / 2 - handleH / 2}
      width={handleW}
      height={handleH}
      fill="white"
      stroke="#00a3ff"
      strokeWidth={1.5 / zoom}
      cornerRadius={3 / zoom}
      onMouseEnter={(e) => {
        const st = e.target.getStage();
        if (st) st.container().style.cursor = "ew-resize";
        document.body.style.cursor = "ew-resize";
      }}
      onMouseLeave={(e) => {
        const st = e.target.getStage();
        if (st) st.container().style.cursor = "default";
        document.body.style.cursor = "default";
      }}
      onMouseDown={onMouseDown}
    />
  );
}
