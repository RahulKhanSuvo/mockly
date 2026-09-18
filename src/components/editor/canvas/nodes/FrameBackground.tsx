"use client";

import { Rect, Image } from "react-konva";
import useImage from "use-image";
import { Frame } from "@/store/canvasStore";

interface FrameBackgroundProps {
  frame: Frame;
  isSelected: boolean;
  zoom: number;
}

export function FrameBackground({ frame, isSelected, zoom }: FrameBackgroundProps) {
  const [image] = useImage(frame.backgroundImage || "", "anonymous");
  const type = frame.backgroundType || "solid";

  const base = {
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
    // eslint-disable-next-line jsx-a11y/alt-text
    return <Image {...base} image={image} />;
  }

  if (type === "gradient" && frame.backgroundGradient) {
    const rad = (frame.backgroundGradient.angle - 90) * (Math.PI / 180);
    const len = Math.sqrt(frame.width ** 2 + frame.height ** 2);
    const cx = frame.width / 2;
    const cy = frame.height / 2;
    return (
      <Rect
        {...base}
        fillLinearGradientStartPoint={{ x: cx - (Math.cos(rad) * len) / 2, y: cy - (Math.sin(rad) * len) / 2 }}
        fillLinearGradientEndPoint={{   x: cx + (Math.cos(rad) * len) / 2, y: cy + (Math.sin(rad) * len) / 2 }}
        fillLinearGradientColorStops={[0, frame.backgroundGradient.colors[0], 1, frame.backgroundGradient.colors[1]]}
      />
    );
  }

  return <Rect {...base} fill={frame.backgroundColor || "white"} />;
}
