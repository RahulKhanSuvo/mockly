"use client";

import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Group, Text } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, exportHandlerRef } from "@/store/canvasStore";
import { FrameBackground } from "./nodes/FrameBackground";
import { TextNode } from "./nodes/TextNode";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.15);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const {
    frames,
    selectedFrameId,
    selectedTextId,
    setSelectedFrameId,
    setSelectedTextId,
    updateFrame,
    deleteFrame,
    canvasBgColor,
    exportConfig,
  } = useCanvasStore();

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
      const mimeType =
        format === "png"
          ? "image/png"
          : format === "jpg"
            ? "image/jpeg"
            : "image/webp";
      const ext = format === "jpg" ? "jpeg" : format;
      const dl = (url: string, name: string) => {
        const a = document.createElement("a");
        a.download = name;
        a.href = url;
        a.click();
      };

      if (frameId) {
        const f = frames.find((fr) => fr.id === frameId);
        if (!f) return;
        const prev = {
          s: { x: stage.scaleX(), y: stage.scaleY() },
          p: { x: stage.x(), y: stage.y() },
        };
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: -f.x, y: -f.y });
        stage.batchDraw();
        const url = stage.toDataURL({
          mimeType,
          quality,
          x: 0,
          y: 0,
          width: f.width,
          height: f.height,
          pixelRatio: scale,
        });
        stage.scale(prev.s);
        stage.position(prev.p);
        stage.batchDraw();
        dl(url, `${f.name || "frame"}.${ext}`);
      } else {
        const prev = {
          s: { x: stage.scaleX(), y: stage.scaleY() },
          p: { x: stage.x(), y: stage.y() },
        };
        stage.scale({ x: 1, y: 1 });
        stage.position({ x: 0, y: 0 });
        stage.batchDraw();
        const url = stage.toDataURL({ mimeType, quality, pixelRatio: scale });
        stage.scale(prev.s);
        stage.position(prev.p);
        stage.batchDraw();
        dl(url, `canvas.${ext}`);
      }
    };
  }, [frames, exportConfig]);

  // Keyboard shortcuts (Delete, Undo, Redo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      )
        return;

      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
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

  // Zoom + pan
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    if (e.evt.ctrlKey || e.evt.metaKey) {
      const ptr = stage.getPointerPosition();
      if (!ptr) return;
      const old = stage.scaleX();
      const next = Math.min(
        Math.max(old * (e.evt.deltaY < 0 ? 1.1 : 1 / 1.1), MIN_ZOOM),
        MAX_ZOOM,
      );
      const newPos = {
        x: ptr.x - ((ptr.x - stage.x()) / old) * next,
        y: ptr.y - ((ptr.y - stage.y()) / old) * next,
      };
      stage.scale({ x: next, y: next });
      stage.position(newPos);
      setZoom(next);
    } else {
      const newPos = {
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      };
      stage.position(newPos);
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedFrameId(null);
      setSelectedTextId(null);
      setEditingTextId(null);
    }
  };

  const handleStageDragMove = (_e: Konva.KonvaEventObject<DragEvent>) => {
    // no-op: stage drag position is read directly from the Konva node when needed
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (size.width === 0 || size.height === 0) {
    return (
      <div
        id="canvas-container"
        className="h-full w-full"
        style={{ backgroundColor: canvasBgColor }}
      />
    );
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
            const isFrameSelected =
              selectedFrameId === frame.id && !selectedTextId;
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
                <FrameBackground
                  frame={frame}
                  isSelected={isFrameSelected}
                  zoom={zoom}
                />

                {/* Text elements (clipped to frame dimensions like overflow: hidden) */}
                <Group
                  clipX={0}
                  clipY={0}
                  clipWidth={frame.width}
                  clipHeight={frame.height}
                >
                  {(frame.textElements ?? []).map((el) => (
                    <TextNode
                      key={el.id}
                      element={el}
                      isSelected={selectedTextId === el.id}
                      isEditing={editingTextId === el.id}
                      zoom={zoom}
                      frameId={frame.id}
                      onEdit={() => setEditingTextId(el.id)}
                      onEditEnd={() => setEditingTextId(null)}
                    />
                  ))}
                </Group>
              </Group>
            );
          })}
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 rounded-md bg-white px-3 py-2 text-sm shadow text-neutral-800 z-10 pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
