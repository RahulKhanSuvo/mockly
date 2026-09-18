"use client";

import { useRef } from "react";
import { Circle } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, TextElement } from "@/store/canvasStore";
import { getTextDimensions } from "@/utils/textUtils";

interface ResizeHandleProps {
  element: TextElement;
  frameId: string;
  zoom: number;
}

export function ResizeHandle({ element, frameId, zoom }: ResizeHandleProps) {
  const { updateTextElement } = useCanvasStore();
  const startRef = useRef<{
    clientX: number;
    clientY: number;
    initialFontSize: number;
    initialWidth: number;
  } | null>(null);

  const { textHeight } = getTextDimensions(element);

  function onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    e.cancelBubble = true;
    e.evt.preventDefault();
    startRef.current = {
      clientX: e.evt.clientX,
      clientY: e.evt.clientY,
      initialFontSize: element.fontSize,
      initialWidth: element.width,
    };

    const st = e.target.getStage();
    if (st) st.container().style.cursor = "se-resize";
    document.body.style.cursor = "se-resize";

    const onMove = (me: MouseEvent) => {
      if (!startRef.current) return;
      const deltaY = (me.clientY - startRef.current.clientY) / zoom;
      const newFontSize = Math.max(8, Math.round(startRef.current.initialFontSize + deltaY));
      const scaleRatio = newFontSize / startRef.current.initialFontSize;
      const newWidth = Math.max(40, Math.round(startRef.current.initialWidth * scaleRatio));

      updateTextElement(frameId, element.id, {
        fontSize: newFontSize,
        width: newWidth,
      });
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

  return (
    <Circle
      x={element.width}
      y={textHeight}
      radius={6 / zoom}
      fill="white"
      stroke="#00a3ff"
      strokeWidth={1.5 / zoom}
      onMouseEnter={(e) => {
        const st = e.target.getStage();
        if (st) st.container().style.cursor = "se-resize";
        document.body.style.cursor = "se-resize";
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
