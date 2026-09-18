"use client";

import { useEffect, useRef, useState } from "react";
import { Layer, Rect, Stage, Group, Text, Image } from "react-konva";
import type Konva from "konva";
import useImage from "use-image";
import { useCanvasStore, Frame } from "@/store/canvasStore";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;

function FrameBackground({ frame, isSelected, zoom }: { frame: Frame; isSelected: boolean; zoom: number }) {
  const [image] = useImage(frame.backgroundImage || "", 'anonymous');
  
  const type = frame.backgroundType || "solid";
  
  const baseProps = {
    width: frame.width,
    height: frame.height,
    shadowColor: "black",
    shadowBlur: isSelected ? 30 : 15,
    shadowOpacity: isSelected ? 0.3 : 0.1,
    shadowOffsetY: 5,
    stroke: isSelected ? "#3b82f6" : undefined,
    strokeWidth: isSelected ? 4 / zoom : 0,
  };

  if (type === "image" && frame.backgroundImage) {
    return (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image
        {...baseProps}
        image={image}
        // Basic cover simulation (would need more complex math for true object-fit: cover)
      />
    );
  }

  if (type === "gradient" && frame.backgroundGradient) {
    const angle = frame.backgroundGradient.angle;
    // Simple math for gradient angle start/end points
    const radians = (angle - 90) * (Math.PI / 180);
    const length = Math.sqrt(frame.width * frame.width + frame.height * frame.height);
    const startX = frame.width / 2 - (Math.cos(radians) * length) / 2;
    const startY = frame.height / 2 - (Math.sin(radians) * length) / 2;
    const endX = frame.width / 2 + (Math.cos(radians) * length) / 2;
    const endY = frame.height / 2 + (Math.sin(radians) * length) / 2;

    return (
      <Rect
        {...baseProps}
        fillLinearGradientStartPoint={{ x: startX, y: startY }}
        fillLinearGradientEndPoint={{ x: endX, y: endY }}
        fillLinearGradientColorStops={[0, frame.backgroundGradient.colors[0], 1, frame.backgroundGradient.colors[1]]}
      />
    );
  }

  // Default Solid
  return (
    <Rect
      {...baseProps}
      fill={frame.backgroundColor || "white"}
    />
  );
}

export default function EditorCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  
  const { frames, selectedFrameId, setSelectedFrameId, updateFrame, deleteFrame, canvasBgColor } = useCanvasStore();

  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const [zoom, setZoom] = useState(0.15);

  // Resize canvas to parent container
  useEffect(() => {
    const updateSize = () => {
      // Get the parent container instead of window for correct sizing in layout
      const parent = document.getElementById("canvas-container");
      if (parent) {
        setSize({
          width: parent.offsetWidth,
          height: parent.offsetHeight,
        });
      } else {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Keyboard events (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't delete if we are typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.key === "Backspace" || e.key === "Delete") && selectedFrameId) {
        deleteFrame(selectedFrameId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFrameId, deleteFrame]);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    // Zooming with ctrl key
    if (e.evt.ctrlKey || e.evt.metaKey) {
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const oldScale = stage.scaleX();
      const scaleBy = 1.1;

      const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const limitedScale = Math.min(Math.max(newScale, MIN_ZOOM), MAX_ZOOM);

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newPosition = {
        x: pointer.x - mousePointTo.x * limitedScale,
        y: pointer.y - mousePointTo.y * limitedScale,
      };

      stage.scale({ x: limitedScale, y: limitedScale });
      stage.position(newPosition);
      setZoom(limitedScale);
    } else {
      // Panning without ctrl key (trackpad / shift+scroll)
      const dx = e.evt.deltaX;
      const dy = e.evt.deltaY;
      
      stage.position({
        x: stage.x() - dx,
        y: stage.y() - dy,
      });
    }
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // If we click on the empty stage (not a shape), deselect
    if (e.target === e.target.getStage()) {
      setSelectedFrameId(null);
    }
  };

  if (size.width === 0 || size.height === 0) {
    return <div id="canvas-container" className="h-full w-full" style={{ backgroundColor: canvasBgColor }} />;
  }

  return (
    <div id="canvas-container" className="h-full w-full overflow-hidden absolute inset-0" style={{ backgroundColor: canvasBgColor }}>
      <Stage
        ref={stageRef}
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        onClick={handleStageClick}
        draggable={true} // Allow panning by dragging background
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {frames.map((frame) => {
            const isSelected = selectedFrameId === frame.id;
            
            return (
              <Group
                key={frame.id}
                x={frame.x}
                y={frame.y}
                // draggable
                onClick={(e) => {
                  e.cancelBubble = true;
                  setSelectedFrameId(frame.id);
                }}
                onDragEnd={(e) => {
                  // Only update position on drag end to avoid constant re-renders
                  updateFrame(frame.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
                onDragMove={() => {
                  // If it wasn't selected, select it during drag
                  if (!isSelected) {
                    setSelectedFrameId(frame.id);
                  }
                }}
              >
                {/* Frame Name Label */}
                <Text
                  text={`${frame.name} - ${frame.width}x${frame.height}`}
                  y={-30}
                  fontSize={24}
                  fill="#888"
                />
                
                {/* Frame Background */}
                <FrameBackground frame={frame} isSelected={isSelected} zoom={zoom} />
                
                {/* Placeholder content for now */}
                <Text
                  text={frame.name}
                  width={frame.width}
                  height={frame.height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={48}
                  fill="#ccc"
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>

      <div className="absolute bottom-4 right-4 rounded-md bg-white px-3 py-2 text-sm shadow text-neutral-800 z-10 pointer-events-none">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  );
}
