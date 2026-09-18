"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Layer, Stage, Group, Text } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, exportHandlerRef } from "@/store/canvasStore";
import { getTextDimensions } from "@/utils/textUtils";
import { FrameBackground } from "./nodes/FrameBackground";
import { TextNode } from "./nodes/TextNode";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Stage position/scale stored in STATE for safe rendering
  const [stageTransform, setStageTransform] = useState({ x: 0, y: 0, scale: 0.15 });
  const [zoom, setZoom] = useState(0.15);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const {
    frames, selectedFrameId, selectedTextId,
    setSelectedFrameId, setSelectedTextId,
    updateFrame, updateTextElement, deleteFrame,
    canvasBgColor, exportConfig,
  } = useCanvasStore();

  // Auto-grow textarea height (Figma-like)
  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = ta.scrollHeight + "px";
  }, []);

  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      autoResize();
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [editingTextId, autoResize]);

  // Resize canvas to container
  useEffect(() => {
    const update = () => {
      const el = document.getElementById("canvas-container");
      if (el) setSize({ width: el.offsetWidth, height: el.offsetHeight });
      else setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Export handler
  useEffect(() => {
    exportHandlerRef.current = (frameId: string | null) => {
      const stage = stageRef.current;
      if (!stage) return;
      const { format, scale, quality } = exportConfig;
      const mimeType = format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
      const ext = format === "jpg" ? "jpeg" : format;
      const dl = (url: string, name: string) => { const a = document.createElement("a"); a.download = name; a.href = url; a.click(); };

      if (frameId) {
        const f = frames.find((fr) => fr.id === frameId);
        if (!f) return;
        const prev = { s: { x: stage.scaleX(), y: stage.scaleY() }, p: { x: stage.x(), y: stage.y() } };
        stage.scale({ x: 1, y: 1 }); stage.position({ x: -f.x, y: -f.y }); stage.batchDraw();
        const url = stage.toDataURL({ mimeType, quality, x: 0, y: 0, width: f.width, height: f.height, pixelRatio: scale });
        stage.scale(prev.s); stage.position(prev.p); stage.batchDraw();
        dl(url, `${f.name || "frame"}.${ext}`);
      } else {
        const prev = { s: { x: stage.scaleX(), y: stage.scaleY() }, p: { x: stage.x(), y: stage.y() } };
        stage.scale({ x: 1, y: 1 }); stage.position({ x: 0, y: 0 }); stage.batchDraw();
        const url = stage.toDataURL({ mimeType, quality, pixelRatio: scale });
        stage.scale(prev.s); stage.position(prev.p); stage.batchDraw();
        dl(url, `canvas.${ext}`);
      }
    };
  }, [frames, exportConfig]);

  // Keyboard shortcuts (Delete, Undo, Redo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;

      const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          useCanvasStore.getState().redo();
        } else {
          e.preventDefault();
          useCanvasStore.getState().undo();
        }
      } else if (cmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        useCanvasStore.getState().redo();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const s = useCanvasStore.getState();
        if (s.selectedTextId && s.selectedFrameId) {
          s.deleteTextElement(s.selectedFrameId, s.selectedTextId);
          setEditingTextId(null);
        } else if (s.selectedFrameId) {
          deleteFrame(s.selectedFrameId);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteFrame, editingTextId]);

  // Zoom + pan — update stageTransform in state so render can use it safely
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const ptr = stage.getPointerPosition();
      if (!ptr) return;
      const old = stage.scaleX();
      const next = Math.min(Math.max(old * (e.evt.deltaY < 0 ? 1.1 : 1 / 1.1), MIN_ZOOM), MAX_ZOOM);
      const newPos = {
        x: ptr.x - ((ptr.x - stage.x()) / old) * next,
        y: ptr.y - ((ptr.y - stage.y()) / old) * next,
      };
      stage.scale({ x: next, y: next });
      stage.position(newPos);
      setZoom(next);
      setStageTransform({ x: newPos.x, y: newPos.y, scale: next });
    } else {
      const newPos = { x: stage.x() - e.evt.deltaX, y: stage.y() - e.evt.deltaY };
      stage.position(newPos);
      setStageTransform({ x: newPos.x, y: newPos.y, scale: stage.scaleX() });
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedFrameId(null);
      setSelectedTextId(null);
      setEditingTextId(null);
    }
  };

  // Update stageTransform when stage is panned by dragging
  const handleStageDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const stage = e.target as Konva.Stage;
    setStageTransform({ x: stage.x(), y: stage.y(), scale: stage.scaleX() });
  };

  // ── Inline editor overlay (1:1 Stage-Transformed) ────────────────────────
  const editingOverlay = (() => {
    if (!editingTextId) return null;
    const frame = frames.find((f) => f.id === selectedFrameId);
    const element = frame?.textElements?.find((t) => t.id === editingTextId);
    if (!frame || !element) return null;

    const { textHeight } = getTextDimensions(element);
    const rotation = element.rotation || 0;

    const { x: sx, y: sy, scale } = stageTransform;

    const isBold   = element.fontStyle === "bold"   || element.fontStyle === "bold italic";
    const isItalic = element.fontStyle === "italic"  || element.fontStyle === "bold italic";

    const centerX = element.width / 2;
    const centerY = textHeight / 2;

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 50,
          overflow: "hidden",
        }}
      >
        {/* Transform layer matching Konva Stage position and zoom */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${sx}px, ${sy}px) scale(${scale})`,
            transformOrigin: "0 0",
            pointerEvents: "none",
          }}
        >
          {/* Frame clipping boundary */}
          <div
            style={{
              position: "absolute",
              left: frame.x,
              top: frame.y,
              width: frame.width,
              height: frame.height,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* Text element 1:1 canvas position & rotation */}
            <div
              style={{
                position: "absolute",
                left: element.x,
                top: element.y,
                width: element.width,
                transform: rotation ? `rotate(${rotation}deg)` : "none",
                transformOrigin: `${centerX}px ${centerY}px`,
                pointerEvents: "none",
              }}
            >
              <textarea
                key={editingTextId}
                ref={textareaRef}
                autoFocus
                value={element.text}
                onChange={(ev) => {
                  updateTextElement(frame.id, element.id, { text: ev.target.value });
                  autoResize();
                }}
                onBlur={() => setEditingTextId(null)}
                onKeyDown={(ev) => {
                  if (ev.key === "Escape") { ev.preventDefault(); setEditingTextId(null); }
                }}
                style={{
                  boxSizing: "border-box",
                  width: "100%",
                  minHeight: element.fontSize * element.lineHeight,
                  height: "auto",
                  fontSize: element.fontSize,
                  fontFamily: element.fontFamily,
                  fontWeight: element.fontWeight || (isBold ? "bold" : "normal"),
                  fontStyle: isItalic ? "italic" : "normal",
                  textDecoration: element.textDecoration || "none",
                  color: element.fontColor,
                  textAlign: element.align,
                  lineHeight: element.lineHeight,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  overflow: "hidden",
                  padding: 0,
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  caretColor: element.fontColor || "#000",
                  pointerEvents: "all",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  })();

  // ── Render ───────────────────────────────────────────────────────────────
  if (size.width === 0 || size.height === 0) {
    return <div id="canvas-container" className="h-full w-full" style={{ backgroundColor: canvasBgColor }} />;
  }

  return (
    <div
      id="canvas-container"
      ref={containerRef}
      className="h-full w-full overflow-hidden absolute inset-0"
      style={{ backgroundColor: canvasBgColor }}
    >
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        onDragMove={handleStageDragMove}
        onDragEnd={handleStageDragMove}
        draggable={!editingTextId}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {frames.map((frame) => {
            const isFrameSelected = selectedFrameId === frame.id && !selectedTextId;
            return (
              <Group
                key={frame.id}
                x={frame.x}
                y={frame.y}
                draggable={!editingTextId}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelectedFrameId(frame.id);
                  setSelectedTextId(null);
                  setEditingTextId(null);
                }}
                onDragEnd={(e) => {
                  updateFrame(frame.id, { x: e.target.x(), y: e.target.y() });
                }}
              >
                {/* Frame label */}
                <Text
                  text={`${frame.name}   ${frame.width}×${frame.height}`}
                  y={-30}
                  fontSize={24}
                  fill="#888"
                  listening={false}
                />

                {/* Background */}
                <FrameBackground frame={frame} isSelected={isFrameSelected} zoom={zoom} />

                {/* Text elements (clipped to frame dimensions like overflow: hidden) */}
                <Group clipX={0} clipY={0} clipWidth={frame.width} clipHeight={frame.height}>
                  {(frame.textElements ?? []).map((el) => (
                    <TextNode
                      key={el.id}
                      element={el}
                      isSelected={selectedTextId === el.id}
                      isEditing={editingTextId === el.id}
                      zoom={zoom}
                      frameId={frame.id}
                      onEdit={() => setEditingTextId(el.id)}
                    />
                  ))}
                </Group>
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Figma-like inline editing textarea */}
      {editingOverlay}

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 rounded-md bg-white px-3 py-2 text-sm shadow text-neutral-800 z-10 pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
