"use client";

import { useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import { useCanvasStore, TextElement } from "@/store/canvasStore";
import { getTextDimensions } from "@/utils/textUtils";
import { WidthHandle } from "../handles/WidthHandle";
import { ResizeHandle } from "../handles/ResizeHandle";
import { RotateHandle } from "../handles/RotateHandle";

interface TextNodeProps {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  frameId: string;
  onEdit: () => void;
}

export function TextNode({
  element,
  isSelected,
  isEditing,
  zoom,
  frameId,
  onEdit,
}: TextNodeProps) {
  const { updateTextElement, setSelectedTextId, setSelectedFrameId } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const { textHeight } = getTextDimensions(element);
  const rotation = element.rotation || 0;

  const centerX = element.width / 2;
  const centerY = textHeight / 2;

  const groupX = rotation === 0 ? element.x : element.x + centerX;
  const groupY = rotation === 0 ? element.y : element.y + centerY;
  const groupOffsetX = rotation === 0 ? 0 : centerX;
  const groupOffsetY = rotation === 0 ? 0 : centerY;

  return (
    <Group
      x={groupX}
      y={groupY}
      offsetX={groupOffsetX}
      offsetY={groupOffsetY}
      rotation={rotation}
      draggable={!isEditing}
      onDragStart={(e) => {
        e.cancelBubble = true;
        isDraggingRef.current = true;
      }}
      onDragMove={(e) => { e.cancelBubble = true; }}
      onDragEnd={(e) => {
        e.cancelBubble = true;
        if (e.target === e.currentTarget) {
          const newX = rotation === 0 ? e.target.x() : e.target.x() - centerX;
          const newY = rotation === 0 ? e.target.y() : e.target.y() - centerY;
          updateTextElement(frameId, element.id, { x: newX, y: newY });
        }
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      }}
    >
      {/* Solid blue border — identical for both hover and selection states */}
      {(isSelected || isHovered) && (
        <Rect
          x={0}
          y={0}
          width={element.width}
          height={textHeight}
          stroke="#00a3ff"
          strokeWidth={1.5 / zoom}
          fill="transparent"
          listening={false}
        />
      )}

      {/* Right edge width handle (pill) */}
      {isSelected && (
        <WidthHandle element={element} frameId={frameId} zoom={zoom} />
      )}

      {/* Bottom-right corner resize handle (circle) */}
      {isSelected && (
        <ResizeHandle element={element} frameId={frameId} zoom={zoom} />
      )}

      {/* Rotation handle */}
      {isSelected && (
        <RotateHandle element={element} frameId={frameId} zoom={zoom} />
      )}

      {/* Konva text node — hidden while textarea overlay is active */}
      <Text
        x={0}
        y={0}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.fontColor}
        fontStyle={
          (element.fontStyle?.includes("italic")
            ? `${element.fontWeight || (element.fontStyle?.includes("bold") ? "bold" : "normal")} italic`
            : element.fontWeight || element.fontStyle || "normal")
        }
        textDecoration={element.textDecoration || ""}
        align={element.align}
        lineHeight={element.lineHeight}
        visible={!isEditing}
        onMouseEnter={(e) => {
          setIsHovered(true);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "move";
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          const stage = e.target.getStage();
          if (stage) stage.container().style.cursor = "default";
        }}
        onClick={(e) => {
          e.cancelBubble = true;
          setSelectedFrameId(frameId);
          setSelectedTextId(element.id);
          if (!isDraggingRef.current) {
            onEdit();
          }
        }}
      />
    </Group>
  );
}
