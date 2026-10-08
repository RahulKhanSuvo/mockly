"use client";

import { useRef, useEffect } from "react";
import { Text as KonvaText } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, TextElement } from "@/store/canvasStore";

interface TextNodeProps {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  zoom: number;
  frameId: string;
  onEdit: () => void;
  onEditEnd: () => void;
  /** Called with the underlying Konva.Text node once it mounts */
  onMount?: (id: string, node: Konva.Text) => void;
  /** Called when this node unmounts so refs can be cleaned up */
  onUnmount?: (id: string) => void;
}

export function TextNode({
  element,
  isSelected,
  isEditing,
  zoom,
  frameId,
  onEdit,
  onEditEnd,
  onMount,
  onUnmount,
}: TextNodeProps) {
  const { updateTextElement, setSelectedTextId, setSelectedFrameId } = useCanvasStore();
  const isDraggingRef = useRef(false);
  const textRef = useRef<Konva.Text>(null);

  // Register / unregister the Konva node ref so EditorCanvas can attach the
  // shared Transformer in the unclipped selection Layer.
  useEffect(() => {
    if (textRef.current) {
      onMount?.(element.id, textRef.current);
    }
    return () => {
      onUnmount?.(element.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  // ── Drag & Transform Handlers ─────────────────────────────────────────────
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    updateTextElement(frameId, element.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  const handleTransformEnd = () => {
    const node = textRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const averageScale = (scaleX + scaleY) / 2;

    // Reset scale to 1 and bake into width & fontSize to keep state clean
    node.scaleX(1);
    node.scaleY(1);

    updateTextElement(frameId, element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, Math.round(node.width() * scaleX)),
      fontSize: Math.max(8, Math.round(element.fontSize * averageScale)),
      rotation: node.rotation(),
    });
  };

  // ── Text editing — DOM input overlay ──────────────────────────────────────
  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    e.cancelBubble = true;
    if (isDraggingRef.current) return;

    const textNode = textRef.current;
    if (!textNode) return;

    textNode.hide();
    textNode.getLayer()?.batchDraw();

    const pos = textNode.absolutePosition();
    const scale = textNode.getAbsoluteScale();
    const stage = textNode.getStage();
    const box = stage?.container().getBoundingClientRect();
    if (!box) {
      textNode.show();
      return;
    }

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
      `border:2px solid #0084ff`,
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

    const finish = () => {
      const newText = input.value;
      updateTextElement(frameId, element.id, { text: newText });
      textNode.show();
      textNode.getLayer()?.batchDraw();
      onEditEnd();
      if (document.body.contains(input)) document.body.removeChild(input);
    };

    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        finish();
      }
      if (ev.key === "Escape") {
        ev.preventDefault();
        finish();
      }
    });
    input.addEventListener("blur", finish);

    onEdit();
  };

  return (
    <KonvaText
      ref={textRef}
      x={element.x}
      y={element.y}
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
      rotation={element.rotation || 0}
      draggable={!isEditing}
      onDragStart={(e) => {
        e.cancelBubble = true;
        isDraggingRef.current = true;
      }}
      onDragMove={(e) => {
        e.cancelBubble = true;
      }}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onMouseEnter={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();
        if (stage) stage.container().style.cursor = "default";
      }}
      onClick={(e) => {
        e.cancelBubble = true;
        setSelectedFrameId(frameId);
        setSelectedTextId(element.id);
      }}
      onTap={(e) => {
        e.cancelBubble = true;
        setSelectedFrameId(frameId);
        setSelectedTextId(element.id);
      }}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
    />
  );
}
