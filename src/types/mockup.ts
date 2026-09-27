export interface Point {
  x: number;
  y: number;
}

export interface ScreenMapping {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
  width?: number;
  height?: number;
  borderRadius?: number;
}

export interface MockupAsset {
  id: string;
  name: string;
  category: 'iPhone' | 'Android' | 'Laptop' | 'Tablet' | 'Custom';
  type: 'png' | 'svg';
  assetUrl: string;
  previewUrl?: string;
  screen: ScreenMapping;
  width: number;
  height: number;
  editableColors?: Record<string, string>;
}

export interface UploadedScreenshot {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface MockupElement {
  id: string;
  mockupId: string;
  screenshotUrl?: string;
  customScreen?: ScreenMapping;
  colorOverrides?: Record<string, string>;
}
