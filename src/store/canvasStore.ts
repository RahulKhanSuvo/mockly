import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type FrameType = 'screenshot' | 'mockup' | 'graphic' | 'custom';

export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface Frame {
  id: string;
  type: FrameType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundGradient?: {
    colors: string[];
    angle: number;
  };
  backgroundImage?: string;
}

export type LeftTab = 'templates' | 'devices'  | 'text' | 'images'|'elements' | 'background';

interface CanvasState {
  frames: Frame[];
  selectedFrameId: string | null;
  activeLeftTab: LeftTab;
  canvasBgColor: string;
  addFrame: (frame: Omit<Frame, 'id'>) => void;
  updateFrame: (id: string, updates: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;
  setSelectedFrameId: (id: string | null) => void;
  setActiveLeftTab: (tab: LeftTab) => void;
  setCanvasBgColor: (color: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  frames: [
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 1', x: 100, y: 100, width: 1290, height: 2796 },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 2', x: 1500, y: 100, width: 1290, height: 2796 },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 3', x: 2900, y: 100, width: 1290, height: 2796 },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 4', x: 4300, y: 100, width: 1290, height: 2796 },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 5', x: 5700, y: 100, width: 1290, height: 2796 },
  ],
  selectedFrameId: null,
  activeLeftTab: 'templates',
  canvasBgColor: '#e5e5e5', // neutral-200 equivalent

  addFrame: (frame) =>
    set((state) => ({
      frames: [...state.frames, { ...frame, id: uuidv4() }],
      selectedFrameId: null, // Optionally select the new frame?
    })),

  updateFrame: (id, updates) =>
    set((state) => ({
      frames: state.frames.map((frame) =>
        frame.id === id ? { ...frame, ...updates } : frame
      ),
    })),

  deleteFrame: (id) =>
    set((state) => ({
      frames: state.frames.filter((frame) => frame.id !== id),
      selectedFrameId: state.selectedFrameId === id ? null : state.selectedFrameId,
    })),

  setSelectedFrameId: (id) => set({ selectedFrameId: id }),
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
}));
