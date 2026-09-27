import { MockupAsset } from "@/types/mockup";

export const MOCKUP_LIBRARY: MockupAsset[] = [
  {
    id: "iphone18-perspective",
    name: "iPhone 18 Perspective",
    category: "iPhone",
    type: "png",
    assetUrl: "/mockups/iphone18.png",
    width: 430,
    height: 882,
    screen: {
      topLeft:     { x: 36, y: 34 },
      topRight:    { x: 394, y: 34 },
      bottomRight: { x: 394, y: 846 },
      bottomLeft:  { x: 36, y: 846 },
      borderRadius: 40,
    },
  },
  {
    id: "iphone-hand-angled",
    name: "Angled Handheld Phone",
    category: "iPhone",
    type: "png",
    assetUrl: "/mockups/iphone18.png", // Demo reuse
    width: 500,
    height: 900,
    screen: {
      topLeft:     { x: 75,  y: 90  },
      topRight:    { x: 420, y: 130 },
      bottomRight: { x: 440, y: 810 },
      bottomLeft:  { x: 60,  y: 770 },
      borderRadius: 24,
    },
  },
  {
    id: "android-perspective",
    name: "Android Perspective",
    category: "Android",
    type: "png",
    assetUrl: "/mockups/iphone18.png",
    width: 450,
    height: 900,
    screen: {
      topLeft:     { x: 50,  y: 60 },
      topRight:    { x: 400, y: 80 },
      bottomRight: { x: 390, y: 840 },
      bottomLeft:  { x: 60,  y: 820 },
    },
  },
];

export function getMockupById(id: string): MockupAsset | undefined {
  return MOCKUP_LIBRARY.find((m) => m.id === id);
}
