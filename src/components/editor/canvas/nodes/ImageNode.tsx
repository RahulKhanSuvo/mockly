import React, { useRef, useEffect } from "react";
import { Image as KonvaImage, Group } from "react-konva";
import useImage from "use-image";
import Konva from "konva";
import { ImageElement, useCanvasStore } from "@/store/canvasStore";

interface ImageNodeProps {
  element: ImageElement;
  isSelected: boolean;
  frameId: string;
  /** Called with the underlying Konva.Image node once it mounts */
  onMount?: (id: string, node: Konva.Image) => void;
  /** Called when this node unmounts so refs can be cleaned up */
  onUnmount?: (id: string) => void;
}

export function ImageNode({ element, isSelected, frameId, onMount, onUnmount }: ImageNodeProps) {
  const [image] = useImage(element.url, "anonymous");
  const imageRef = useRef<Konva.Image>(null);

  const updateImageElement = useCanvasStore((s) => s.updateImageElement);
  const setSelectedImageId = useCanvasStore((s) => s.setSelectedImageId);

  // Register / unregister the Konva node ref so the parent can attach a Transformer
  // in an unclipped layer (keeping handles visible outside the frame clip region).
  useEffect(() => {
    if (imageRef.current) {
      onMount?.(element.id, imageRef.current);
    }
    return () => {
      onUnmount?.(element.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element.id]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    updateImageElement(frameId, element.id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = () => {
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and bake into width/height to keep state consistent
    node.scaleX(1);
    node.scaleY(1);

    updateImageElement(frameId, element.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(10, node.width() * scaleX),
      height: Math.max(10, node.height() * scaleY),
      rotation: node.rotation(),
    });
  };

  return (
    <Group>
      <KonvaImage
        ref={imageRef}
        image={image}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        draggable
        onDragStart={(e) => { e.cancelBubble = true; }}
        onDragMove={(e) => { e.cancelBubble = true; }}
        onClick={(e) => {
          e.cancelBubble = true;
          setSelectedImageId(element.id);
        }}
        onTap={(e) => {
          e.cancelBubble = true;
          setSelectedImageId(element.id);
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    </Group>
  );
}
