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
  onMount?: (id: string, node: Konva.Text) => void;
  onUnmount?: (id: string) => void;
}

export function TextNode({
  element,
  isEditing,
  frameId,
  onEdit,
  onEditEnd,
  onMount,
  onUnmount,
}: TextNodeProps) {
  const { updateTextElement, setSelectedTextId, setSelectedFrameId } =
    useCanvasStore();

  const isDraggingRef = useRef(false);
  const textRef = useRef<Konva.Text>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Register / unregister Konva node
  useEffect(() => {
    const node = textRef.current;

    if (node) {
      onMount?.(element.id, node);
    }

    return () => {
      textareaRef.current?.remove();
      textareaRef.current = null;
      onUnmount?.(element.id);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  // Drag end
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

  // Transform end
  const handleTransformEnd = () => {
    const node = textRef.current;

    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const averageScale = (scaleX + scaleY) / 2;

    // Bake the transform scale into the text properties.
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

  // Double-click / double-tap to edit
  const handleDblClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    e.cancelBubble = true;

    if (isDraggingRef.current || isEditing) return;

    // Prevent multiple editing textareas.
    if (textareaRef.current) return;

    const textNode = textRef.current;
    const stage = textNode?.getStage();

    if (!textNode || !stage) return;

    const stageRect = stage.container().getBoundingClientRect();
    const absolutePosition = textNode.absolutePosition();
    const absoluteScale = textNode.getAbsoluteScale();

    const scaleX = Math.abs(absoluteScale.x);
    const scaleY = Math.abs(absoluteScale.y);

    const textarea = document.createElement("textarea");
    textareaRef.current = textarea;

    textarea.value = textNode.text();

    Object.assign(textarea.style, {
      position: "fixed",
      left: `${stageRect.left + absolutePosition.x}px`,
      top: `${stageRect.top + absolutePosition.y}px`,
      width: `${Math.max(1, textNode.width() * scaleX)}px`,
      height: `${Math.max(1, textNode.height() * scaleY)}px`,

      margin: "0",
      padding: "0",
      border: "none",
      outline: "none",
      background: "transparent",
      resize: "none",
      overflow: "hidden",
      boxSizing: "border-box",
      zIndex: "9999",

      color: element.fontColor,
      fontFamily: element.fontFamily,
      fontSize: `${element.fontSize * scaleY}px`,
      fontWeight:
        element.fontWeight ||
        (element.fontStyle?.includes("bold") ? "bold" : "normal"),
      fontStyle: element.fontStyle?.includes("italic") ? "italic" : "normal",
      textDecoration: element.textDecoration || "none",
      textAlign: element.align,
      lineHeight: String(element.lineHeight),

      transformOrigin: "top left",
      transform: `rotate(${textNode.rotation()}deg)`,

      appearance: "none",
      WebkitAppearance: "none",
    });

    document.body.appendChild(textarea);

    let finished = false;

    const cleanup = () => {
      textarea.removeEventListener("keydown", handleKeyDown);
      textarea.removeEventListener("blur", finish);

      if (textareaRef.current === textarea) {
        textareaRef.current = null;
      }

      textarea.remove();
    };

    const finish = () => {
      if (finished) return;

      finished = true;

      const newText = textarea.value;

      cleanup();

      updateTextElement(frameId, element.id, {
        text: newText,
      });

      onEditEnd();

      textNode.getLayer()?.batchDraw();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Enter finishes editing.
      if (event.key === "Enter") {
        event.preventDefault();
        finish();
      }

      // Escape also finishes editing, preserving the current text.
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    };

    textarea.addEventListener("keydown", handleKeyDown);
    textarea.addEventListener("blur", finish);

    // Switch the component into editing mode.
    onEdit();

    textarea.focus();
    textarea.select();
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
          ? `${
              element.fontWeight ||
              (element.fontStyle?.includes("bold") ? "bold" : "normal")
            } italic`
          : element.fontWeight || element.fontStyle || "normal"
      }
      textDecoration={element.textDecoration || ""}
      align={element.align}
      lineHeight={element.lineHeight}
      rotation={element.rotation || 0}
      draggable={!isEditing}

      // KEY FIX: hide the original text while the textarea is active.
      visible={!isEditing}

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

        if (stage) {
          stage.container().style.cursor = "move";
        }
      }}
      onMouseLeave={(e) => {
        const stage = e.target.getStage();

        if (stage) {
          stage.container().style.cursor = "default";
        }
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
