"use client";

import { useEffect, useRef, useState } from "react";
import { Layer, Stage, Group, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { useCanvasStore, exportHandlerRef, type TextElement, type ImageElement } from "@/store/canvasStore";
import { FrameBackground } from "./nodes/FrameBackground";
import { TextNode } from "./nodes/TextNode";
import { ImageNode } from "./nodes/ImageNode";
import { Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(0.15);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // ── Element node refs — keyed by element id ─────────────────────────────
  // We collect refs from every ImageNode & TextNode so the selection Transformer
  // (rendered in a separate, unclipped Layer) can target the active node.
  const elementNodeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const selectionTransformerRef = useRef<Konva.Transformer>(null);

  // ── Custom pan state (replaces Stage draggable) ───────────────────────────
  // By NOT using Stage draggable, image / text drags never accidentally pan.
  const isPanningRef = useRef(false);
  const isSpaceDownRef = useRef(false);
  const panLastPos = useRef({ x: 0, y: 0 });

  const {
    frames,
    selectedFrameId,
    selectedTextId,
    selectedImageId,
    setSelectedFrameId,
    setSelectedTextId,
    setSelectedImageId,
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

  // ── Fit all frames centered in viewport on first load ─────────────────────
  const hasCenteredRef = useRef(false);
  useEffect(() => {
    // Only run once, after both size and frames are available
    if (hasCenteredRef.current) return;
    if (size.width === 0 || size.height === 0) return;
    if (frames.length === 0) return;

    hasCenteredRef.current = true;

    // Compute bounding box of all frames
    const minX = Math.min(...frames.map((f) => f.x));
    const minY = Math.min(...frames.map((f) => f.y));
    const maxX = Math.max(...frames.map((f) => f.x + f.width));
    const maxY = Math.max(...frames.map((f) => f.y + f.height));

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    const PADDING = 80; // px of breathing room around all frames

    // Pick zoom to fit content inside viewport with padding
    const fitZoom = Math.min(
      (size.width  - PADDING * 2) / contentW,
      (size.height - PADDING * 2) / contentH,
      MAX_ZOOM,
    );
    const clampedZoom = Math.max(fitZoom, MIN_ZOOM);

    // Center the bounding box in the viewport
    const stageX = (size.width  - contentW * clampedZoom) / 2 - minX * clampedZoom;
    const stageY = (size.height - contentH * clampedZoom) / 2 - minY * clampedZoom;

    const stage = stageRef.current;
    if (stage) {
      stage.scale({ x: clampedZoom, y: clampedZoom });
      stage.position({ x: stageX, y: stageY });
    }
    setZoom(clampedZoom);
  }, [size, frames]);

  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null);

  // ── Wire selection Transformer to the active element node ───────────────────
  // The Transformer lives in a separate, unclipped Layer so its handles are
  // always fully visible — even when elements extend outside the frame clip.
  useEffect(() => {
    const updateToolbar = () => {
      const tr = selectionTransformerRef.current;
      if (!tr) return;
      const activeId = selectedImageId || selectedTextId;
      if (activeId) {
        const node = elementNodeRefs.current.get(activeId);
        tr.nodes(node ? [node] : []);
        if (node) {
          const box = node.getClientRect();
          setToolbarPos({ x: box.x, y: box.y - 48 }); // 48px above the element
        } else {
          setToolbarPos(null);
        }
      } else {
        tr.nodes([]);
        setToolbarPos(null);
      }
      tr.getLayer()?.batchDraw();
    };

    updateToolbar();
    
    // Listen to changes that affect position
    const stage = stageRef.current;
    if (stage) {
      stage.on("dragmove transform wheel dragend transformend", updateToolbar);
      return () => {
        stage.off("dragmove transform wheel dragend transformend", updateToolbar);
      };
    }
  }, [selectedImageId, selectedTextId, zoom]);

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
        } else if (s.selectedImageId && s.selectedFrameId) {
          s.deleteImageElement(s.selectedFrameId, s.selectedImageId);
        } else if (s.selectedFrameId) {
          deleteFrame(s.selectedFrameId);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleteFrame, editingTextId]);

  // ── Zoom (pinch / ctrl+wheel) ─────────────────────────────────────────────
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
      stage.position({
        x: stage.x() - e.evt.deltaX,
        y: stage.y() - e.evt.deltaY,
      });
    }
  };

  // ── Custom panning — ONLY fires when clicking on blank canvas background ──
  // This is the key fix: Stage is NOT draggable. Instead we drive panning
  // manually here so child node drags (images, text, frames) NEVER cause
  // the canvas to scroll.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        isSpaceDownRef.current = true;
        // Optionally prevent default scrolling
        if (e.target === document.body) e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpaceDownRef.current = false;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only pan when the click lands on the Stage itself (background), not a shape
    if (e.target !== e.target.getStage()) return;
    if (editingTextId) return;
    // Require spacebar to be held down for panning
    if (!isSpaceDownRef.current) return;
    
    isPanningRef.current = true;
    panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isPanningRef.current) return;
    const stage = stageRef.current;
    if (!stage) return;
    const dx = e.evt.clientX - panLastPos.current.x;
    const dy = e.evt.clientY - panLastPos.current.y;
    stage.position({ x: stage.x() + dx, y: stage.y() + dy });
    panLastPos.current = { x: e.evt.clientX, y: e.evt.clientY };
    
    // Update toolbar position when panning
    const activeId = selectedImageId || selectedTextId;
    if (activeId) {
      const node = elementNodeRefs.current.get(activeId);
      if (node) {
        const box = node.getClientRect();
        setToolbarPos({ x: box.x, y: box.y - 48 });
      }
    }
  };

  const handleStageMouseUp = () => {
    isPanningRef.current = false;
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedFrameId(null);
      setSelectedTextId(null);
      setSelectedImageId(null);
      setEditingTextId(null);
    }
  };

  const handleDuplicate = () => {
    const s = useCanvasStore.getState();
    const frame = s.frames.find(f => f.id === s.selectedFrameId);
    if (!frame) return;

    if (s.selectedTextId) {
      const el = frame.textElements?.find(e => e.id === s.selectedTextId);
      if (el) {
        s.addTextElement(frame.id, { ...el, x: el.x + 20, y: el.y + 20 });
      }
    } else if (s.selectedImageId) {
      const el = frame.imageElements?.find(e => e.id === s.selectedImageId);
      if (el) {
        s.addImageElement(frame.id, { ...el, x: el.x + 20, y: el.y + 20 });
      }
    }
  };

  const handleDelete = () => {
    const s = useCanvasStore.getState();
    if (s.selectedTextId && s.selectedFrameId) {
      s.deleteTextElement(s.selectedFrameId, s.selectedTextId);
    } else if (s.selectedImageId && s.selectedFrameId) {
      s.deleteImageElement(s.selectedFrameId, s.selectedImageId);
    }
  };

  const handleMoveUp = () => {
    const s = useCanvasStore.getState();
    if (s.selectedTextId && s.selectedFrameId) {
      s.moveElementUp(s.selectedFrameId, s.selectedTextId, 'text');
    } else if (s.selectedImageId && s.selectedFrameId) {
      s.moveElementUp(s.selectedFrameId, s.selectedImageId, 'image');
    }
  };

  const handleMoveDown = () => {
    const s = useCanvasStore.getState();
    if (s.selectedTextId && s.selectedFrameId) {
      s.moveElementDown(s.selectedFrameId, s.selectedTextId, 'text');
    } else if (s.selectedImageId && s.selectedFrameId) {
      s.moveElementDown(s.selectedFrameId, s.selectedImageId, 'image');
    }
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
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        draggable={false}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {frames.map((frame) => {
            const isFrameSelected =
              selectedFrameId === frame.id && !selectedTextId && !selectedImageId;
            return (
              <Group
                key={frame.id}
                x={frame.x}
                y={frame.y}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelectedFrameId(frame.id);
                  setSelectedTextId(null);
                  setSelectedImageId(null);
                  setEditingTextId(null);
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

                {/* All child elements — clipped to frame so nothing bleeds outside */}
                <Group
                  clipX={0}
                  clipY={0}
                  clipWidth={frame.width}
                  clipHeight={frame.height}
                >
                  {(() => {
                    const allElements = [
                      ...(frame.textElements || []).map(el => ({ type: 'text' as const, el })),
                      ...(frame.imageElements || []).map(el => ({ type: 'image' as const, el }))
                    ];
                    
                    allElements.sort((a, b) => (a.el.zIndex || 0) - (b.el.zIndex || 0));

                    return allElements.map(({ type, el }) => {
                      if (type === 'text') {
                        const textEl = el as TextElement;
                        return (
                          <TextNode
                            key={textEl.id}
                            element={textEl}
                            isSelected={selectedTextId === textEl.id}
                            isEditing={editingTextId === textEl.id}
                            zoom={zoom}
                            frameId={frame.id}
                            onEdit={() => setEditingTextId(textEl.id)}
                            onEditEnd={() => setEditingTextId(null)}
                            onMount={(id, node) => elementNodeRefs.current.set(id, node)}
                            onUnmount={(id) => elementNodeRefs.current.delete(id)}
                          />
                        );
                      } else {
                        const imgEl = el as ImageElement;
                        return (
                          <ImageNode
                            key={imgEl.id}
                            element={imgEl}
                            isSelected={selectedImageId === imgEl.id}
                            frameId={frame.id}
                            onMount={(id, node) => elementNodeRefs.current.set(id, node)}
                            onUnmount={(id) => elementNodeRefs.current.delete(id)}
                          />
                        );
                      }
                    });
                  })()}
                </Group>

              </Group>
            );
          })}
        </Layer>

        {/* ── Selection Layer ────────────────────────────────────────────────
            This Layer is NOT inside any clip group, so the Transformer's
            handles (anchors, border, rotation knob) are always fully visible
            — even when the selected image extends beyond the frame boundary.
            This matches the behaviour shown in real editors like Figma. */}
        <Layer>
          <Transformer
            ref={selectionTransformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 10 || newBox.height < 10) return oldBox;
              return newBox;
            }}
            anchorSize={10}
            anchorCornerRadius={4}
            anchorStroke="#0084ff"
            anchorFill="#ffffff"
            anchorStrokeWidth={1.5}
            borderStroke="#0084ff"
            borderStrokeWidth={1.5}
            borderDash={[]}
            padding={1}
            keepRatio={true}
            rotateAnchorOffset={20}
          />
        </Layer>
      </Stage>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 rounded-md bg-white px-3 py-2 text-sm shadow text-neutral-800 z-10 pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>

      {/* Floating Toolbar */}
      {toolbarPos && (selectedImageId || selectedTextId) && (
        <div 
          className="absolute z-20 flex items-center gap-1 bg-white border border-neutral-200 rounded-md shadow-sm p-1"
          style={{ 
            left: Math.max(10, toolbarPos.x), 
            top: Math.max(10, toolbarPos.y),
          }}
        >
          <button 
            onClick={handleDuplicate}
            className="p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-sm transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={handleDelete}
            className="p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-sm transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
          <div className="w-px h-4 bg-neutral-200 mx-1"></div>
          <button 
            onClick={handleMoveUp}
            className="p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-sm transition-colors"
            title="Move Forward"
          >
            <ArrowUp size={16} />
          </button>
          <button 
            onClick={handleMoveDown}
            className="p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 rounded-sm transition-colors"
            title="Move Backward"
          >
            <ArrowDown size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
