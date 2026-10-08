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

  // ---------------------------------------------------------------------------
  // Register / unregister Konva node
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (textRef.current) {
      onMount?.(element.id, textRef.current);
    }

    return () => {
      onUnmount?.(element.id);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  // ---------------------------------------------------------------------------
  // Drag
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Transform
  // ---------------------------------------------------------------------------

  const handleTransformEnd = () => {
    const node = textRef.current;

    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const averageScale = (scaleX + scaleY) / 2;

    // Bake Konva scale into our actual text properties.
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

  // ---------------------------------------------------------------------------
  // Double click → edit text
  // ---------------------------------------------------------------------------

  const handleDblClick = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    e.cancelBubble = true;

    if (isDraggingRef.current) return;

    const textNode = textRef.current;
    const stage = textNode?.getStage();

    if (!textNode || !stage) return;

    const stageContainer = stage.container();
    const stageRect = stageContainer.getBoundingClientRect();

    // -------------------------------------------------------------------------
    // Get actual rendered position.
    //
    // This accounts for:
    // - canvas zoom
    // - frame position
    // - text position
    // - parent transforms
    // -------------------------------------------------------------------------

    const absolutePosition = textNode.absolutePosition();

    const absoluteScale = textNode.getAbsoluteScale();

    const scaleX = Math.abs(absoluteScale.x);

    const scaleY = Math.abs(absoluteScale.y);

    const width = textNode.width() * scaleX;

    const height = textNode.height() * scaleY;

    // -------------------------------------------------------------------------
    // Create transparent editing textarea.
    //
    // IMPORTANT:
    // This has NO visible border and NO background.
    //
    // The Konva Transformer remains the visual selection UI.
    // -------------------------------------------------------------------------

    const textarea = document.createElement("textarea");

    textarea.value = textNode.text();

    Object.assign(textarea.style, {
      position: "fixed",

      left: `${stageRect.left + absolutePosition.x}px`,

      top: `${stageRect.top + absolutePosition.y}px`,

      width: `${width}px`,
      height: `${height}px`,

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

      lineHeight: `${element.lineHeight}`,

      // This makes rotated text editing follow
      // the exact same rotation as the Konva text.
      transformOrigin: "top left",

      transform: `rotate(${textNode.rotation()}deg)`,

      appearance: "none",
      WebkitAppearance: "none",
    });

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();

    onEdit();

    // -------------------------------------------------------------------------
    // Finish editing
    // -------------------------------------------------------------------------

    let finished = false;

    const finish = () => {
      if (finished) return;

      finished = true;

      const newText = textarea.value;

      updateTextElement(frameId, element.id, {
        text: newText,
      });

      if (document.body.contains(textarea)) {
        textarea.remove();
      }

      onEditEnd();

      textNode.getLayer()?.batchDraw();
    };

    // -------------------------------------------------------------------------
    // Keyboard
    // -------------------------------------------------------------------------

    textarea.addEventListener("keydown", (event) => {
      // Enter → finish
      if (event.key === "Enter") {
        event.preventDefault();
        finish();
        return;
      }

      // Escape → finish
      if (event.key === "Escape") {
        event.preventDefault();
        finish();
      }
    });

    // Clicking outside → finish
    textarea.addEventListener("blur", finish);
  };

  // ---------------------------------------------------------------------------
  // Konva Text
  // ---------------------------------------------------------------------------

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

      // -----------------------------------------------------------------------
      // Drag start
      // -----------------------------------------------------------------------

      onDragStart={(e) => {
        e.cancelBubble = true;
        isDraggingRef.current = true;
      }}

      // -----------------------------------------------------------------------
      // Drag move
      // -----------------------------------------------------------------------

      onDragMove={(e) => {
        e.cancelBubble = true;
      }}

      // -----------------------------------------------------------------------
      // Drag end
      // -----------------------------------------------------------------------

      onDragEnd={handleDragEnd}

      // -----------------------------------------------------------------------
      // Transform
      // -----------------------------------------------------------------------

      onTransformEnd={handleTransformEnd}

      // -----------------------------------------------------------------------
      // Mouse cursor
      // -----------------------------------------------------------------------

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

      // -----------------------------------------------------------------------
      // Select
      // -----------------------------------------------------------------------

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

      // -----------------------------------------------------------------------
      // Double click → edit
      // -----------------------------------------------------------------------

      onDblClick={handleDblClick}

      onDblTap={handleDblClick}
    />
  );
}
