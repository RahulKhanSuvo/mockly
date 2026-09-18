"use client";

import { useRef } from "react";
import { Group, Circle, Rect } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, TextElement } from "@/store/canvasStore";
import { getTextDimensions } from "@/utils/textUtils";

interface RotateHandleProps {
  element: TextElement;
  frameId: string;
  zoom: number;
}

export function RotateHandle({ element, frameId, zoom }: RotateHandleProps) {
  const { updateTextElement } = useCanvasStore();
  const { textHeight } = getTextDimensions(element);

  function onMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
    e.cancelBubble = true;
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const textGroupNode = e.target.getParent()?.getParent();
    if (!textGroupNode) return;
    const transform = textGroupNode.getAbsoluteTransform();
    const centerPoint = transform.point({
      x: element.width / 2,
      y: textHeight / 2,
    });

    const stageBox = stage.container().getBoundingClientRect();
    const startX = e.evt.clientX - stageBox.left;
    const startY = e.evt.clientY - stageBox.top;
    const startAngle = Math.atan2(startY - centerPoint.y, startX - centerPoint.x);
    const initialRotation = element.rotation || 0;

    const st = stage;
    st.container().style.cursor = "grabbing";
    document.body.style.cursor = "grabbing";

    const onMove = (me: MouseEvent) => {
      const clientX = me.clientX - stageBox.left;
      const clientY = me.clientY - stageBox.top;

      const currentAngle = Math.atan2(clientY - centerPoint.y, clientX - centerPoint.x);
      const deltaRad = currentAngle - startAngle;
      const deltaDeg = Math.round((deltaRad * 180) / Math.PI);

      let newRotation = (initialRotation + deltaDeg) % 360;
      if (newRotation < 0) newRotation += 360;

      updateTextElement(frameId, element.id, { rotation: newRotation });
    };

    const onUp = () => {
      document.body.style.cursor = "";
      if (st) st.container().style.cursor = "default";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  const stemLen = 35 / zoom;

  return (
    <Group x={element.width / 2} y={textHeight + stemLen}>
      {/* Connecting stem line */}
      <Rect
        x={-0.5 / zoom}
        y={-stemLen}
        width={1 / zoom}
        height={stemLen}
        fill="#00a3ff"
        listening={false}
      />
      {/* Rotate button circle */}
      <Circle
        radius={8 / zoom}
        fill="white"
        stroke="#00a3ff"
        strokeWidth={1.5 / zoom}
        onMouseEnter={(e) => {
          const st = e.target.getStage();
          if (st) st.container().style.cursor = "grab";
          document.body.style.cursor = "grab";
        }}
        onMouseLeave={(e) => {
          const st = e.target.getStage();
          if (st) st.container().style.cursor = "default";
          document.body.style.cursor = "default";
        }}
        onMouseDown={onMouseDown}
      />
      {/* Rotate indicator ring inside circle */}
      <Circle
        radius={3.5 / zoom}
        stroke="#00a3ff"
        strokeWidth={1.2 / zoom}
        dash={[4 / zoom, 2 / zoom]}
        listening={false}
      />
    </Group>
  );
}
