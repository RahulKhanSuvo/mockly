import { TextElement } from "@/store/canvasStore";

/**
 * Calculates the accurate rendered line count and bounding height for a TextElement,
 * taking into account both explicit line breaks (\n) and automatic word wrapping.
 */
export function getTextDimensions(element: TextElement): { numLines: number; textHeight: number } {
  const fontSize = element.fontSize || 16;
  const lineHeight = element.lineHeight || 1.2;
  const width = Math.max(30, element.width || 100);
  const text = element.text || "";

  const paragraphs = text.split("\n");
  let totalLines = 0;
  const avgCharWidth = fontSize * 0.53;

  for (const para of paragraphs) {
    if (!para || para.trim() === "") {
      totalLines += 1;
      continue;
    }

    const words = para.split(" ");
    let currentLineWidth = 0;
    let paraLines = 1;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordWidth = word.length * avgCharWidth;
      const spaceWidth = i > 0 ? avgCharWidth * 0.5 : 0;

      if (currentLineWidth + spaceWidth + wordWidth <= width || currentLineWidth === 0) {
        currentLineWidth += spaceWidth + wordWidth;
      } else {
        paraLines += 1;
        currentLineWidth = wordWidth;
      }
    }
    totalLines += paraLines;
  }

  const numLines = Math.max(1, totalLines);
  const descenderPadding = Math.round(fontSize * 0.12);
  const textHeight = Math.max(fontSize * lineHeight, Math.round(fontSize * lineHeight * numLines) + descenderPadding);

  return { numLines, textHeight };
}
