"use client";

import { useRef, useState } from "react";
import { Group, Rect, Text } from "react-konva";
import type Konva from "konva";
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
  onEditEnd: () => void;
}

export function TextNode({
  element,
  isSelected,
  isEditing,
  zoom,
  frameId,
  onEdit,
  onEditEnd,
}: TextNodeProps) {
  const { updateTextElement, setSelectedTextId, setSelectedFrameId } = useCanvasStore();
  const [isHovered, setIsHovered] = useState(false);
  const isDraggingRef = useRef(false);
  const textRef = useRef<Konva.Text>(null);
  const { textHeight } = getTextDimensions(element);
  const rotation = element.rotation || 0;

  const centerX = element.width / 2;
  const centerY = textHeight / 2;

  const groupX = rotation === 0 ? element.x : element.x + centerX;
  const groupY = rotation === 0 ? element.y : element.y + centerY;
  const groupOffsetX = rotation === 0 ? 0 : centerX;
  const groupOffsetY = rotation === 0 ? 0 : centerY;

  // ── Text editing — mirrors the reference App exactly ─────────────────────
  // Use imperative DOM injection (no React isEditing state).
  // textNode.hide()  → inject <input> over it
  // finish()         → textNode.show() + remove <input>
  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (isDraggingRef.current) return;

    const textNode = textRef.current;
    if (!textNode) return;

    // 1. Hide the Konva text node (imperative — no React re-render needed)
    textNode.hide();
    textNode.getLayer()?.batchDraw();

    // 2. Measure position in screen space (same as reference)
    const pos = textNode.absolutePosition();
    const scale = textNode.getAbsoluteScale();
    const stage = textNode.getStage();
    const box = stage?.container().getBoundingClientRect();
    if (!box) { textNode.show(); return; }

    // 3. Create the <input> exactly like the reference
    const input = document.createElement("input");
    input.type = "text";
    input.value = textNode.text();
    input.style.cssText = [
      `position:fixed`,
      `top:${box.top + pos.y}px`,
      `left:${box.left + pos.x}px`,
      `width:${element.width * Math.abs(scale.x)}px`,
      `font-size:${element.fontSize * Math.abs(scale.y)}px`,
      `font-family:${element.fontFamily}`,
      `text-align:${element.align}`,
      `font-weight:${element.fontWeight || (element.fontStyle?.includes("bold") ? "bold" : "normal")}`,
      `font-style:${element.fontStyle?.includes("italic") ? "italic" : "normal"}`,
      `color:${element.fontColor}`,
      `border:2px solid #00a3ff`,
      `border-radius:4px`,
      `padding:2px 4px`,
      `box-sizing:border-box`,
      `outline:none`,
      `z-index:9999`,
      `background:#fff`,
    ].join(";");

    document.body.appendChild(input);
    input.focus();
    input.select();

    // 4. finish() — restore Konva node, remove <input>, notify parent
    const finish = () => {
      const newText = input.value;
      updateTextElement(frameId, element.id, { text: newText });
      textNode.show();
      textNode.getLayer()?.batchDraw();
      onEditEnd();
      if (document.body.contains(input)) document.body.removeChild(input);
    };

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") { ev.preventDefault(); finish(); }
      if (ev.key === "Escape") { ev.preventDefault(); finish(); }
    });
    input.addEventListener("blur", finish);

    // 5. Notify parent that editing started (so canvas drag is disabled)
    onEdit();
  };

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
        setTimeout(() => { isDraggingRef.current = false; }, 50);
      }}
    >
      {/* Selection / hover border */}
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

      {/* Handles — hidden while DOM input is open */}
      {isSelected && !isEditing && (
        <WidthHandle element={element} frameId={frameId} zoom={zoom} />
      )}
      {isSelected && !isEditing && (
        <ResizeHandle element={element} frameId={frameId} zoom={zoom} />
      )}
      {isSelected && !isEditing && (
        <RotateHandle element={element} frameId={frameId} zoom={zoom} />
      )}

      {/* Konva Text — hidden imperatively while DOM input is active */}
      <Text
        ref={textRef}
        x={0}
        y={0}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.fontColor}
        fontStyle={
          element.fontStyle?.includes("italic")
            ? `${element.fontWeight || (element.fontStyle?.includes("bold") ? "bold" : "normal")} italic`
            : element.fontWeight || element.fontStyle || "normal"
        }
        textDecoration={element.textDecoration || ""}
        align={element.align}
        lineHeight={element.lineHeight}
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
        }}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
      />
    </Group>
  );
}
