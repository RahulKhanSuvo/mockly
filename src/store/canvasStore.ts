import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type FrameType = 'screenshot' | 'mockup' | 'graphic' | 'custom';
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';
export type FontStyle = 'normal' | 'bold' | 'italic' | 'bold italic';
export type TextDecoration = '' | 'underline' | 'line-through' | 'underline line-through';
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

export interface TextElement {
  id: string;
  text: string;
  x: number;        // relative to frame origin
  y: number;
  width: number;    // wrapping width
  fontSize: number;
  fontFamily: string;
  fontColor: string;
  fontStyle: FontStyle;
  textDecoration?: string; // '' | 'underline' | 'line-through' | 'underline line-through'
  fontWeight?: string;    // '400' | '500' | '600' | '700' | '800'
  align: TextAlign;
  lineHeight: number; // multiplier e.g. 1.2
  rotation?: number;  // angle in degrees (0-360)
}

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
  textElements?: TextElement[];
}

export type LeftTab = 'templates' | 'devices' | 'text' | 'images' | 'elements' | 'background';

export type ExportFormat = 'png' | 'jpg' | 'webp';

export interface ExportConfig {
  format: ExportFormat;
  scale: number;   // pixel ratio multiplier (1, 2, 3)
  quality: number; // 0-1, only relevant for jpg/webp
}

// Mutable ref shared between canvas and sidebar – not reactive on purpose
export const exportHandlerRef: { current: ((frameId: string | null) => void) | null } = { current: null };

interface CanvasState {
  frames: Frame[];
  selectedFrameId: string | null;
  selectedTextId: string | null;   // which text element is active
  activeLeftTab: LeftTab;
  canvasBgColor: string;
  exportConfig: ExportConfig;

  past: Frame[][];
  future: Frame[][];
  canUndo: boolean;
  canRedo: boolean;

  undo: () => void;
  redo: () => void;

  addFrame: (frame: Omit<Frame, 'id'>) => void;
  updateFrame: (id: string, updates: Partial<Frame>) => void;
  deleteFrame: (id: string) => void;
  setSelectedFrameId: (id: string | null) => void;

  addTextToFrame: (frameId: string) => void;
  updateTextElement: (frameId: string, textId: string, updates: Partial<TextElement>) => void;
  deleteTextElement: (frameId: string, textId: string) => void;
  setSelectedTextId: (id: string | null) => void;

  setActiveLeftTab: (tab: LeftTab) => void;
  setCanvasBgColor: (color: string) => void;
  setExportConfig: (config: Partial<ExportConfig>) => void;
}

const pushHistory = (state: CanvasState): Partial<CanvasState> => {
  const MAX_HISTORY = 40;
  const newPast = [...state.past, state.frames].slice(-MAX_HISTORY);
  return {
    past: newPast,
    future: [],
    canUndo: true,
    canRedo: false,
  };
};

export const useCanvasStore = create<CanvasState>((set) => ({
  frames: [
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 1', x: 100,  y: 100, width: 1290, height: 2796, textElements: [] },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 2', x: 1500, y: 100, width: 1290, height: 2796, textElements: [] },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 3', x: 2900, y: 100, width: 1290, height: 2796, textElements: [] },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 4', x: 4300, y: 100, width: 1290, height: 2796, textElements: [] },
    { id: uuidv4(), type: 'screenshot', name: 'iPhone - Screen 5', x: 5700, y: 100, width: 1290, height: 2796, textElements: [] },
  ],
  selectedFrameId: null,
  selectedTextId: null,
  activeLeftTab: 'templates',
  canvasBgColor: '#e5e5e5',
  exportConfig: { format: 'png', scale: 2, quality: 1 },

  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      const newFuture = [state.frames, ...state.future];

      return {
        frames: previous,
        past: newPast,
        future: newFuture,
        canUndo: newPast.length > 0,
        canRedo: true,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const newPast = [...state.past, state.frames];

      return {
        frames: next,
        past: newPast,
        future: newFuture,
        canUndo: true,
        canRedo: newFuture.length > 0,
      };
    }),

  addFrame: (frame) =>
    set((state) => ({
      ...pushHistory(state),
      frames: [...state.frames, { ...frame, id: uuidv4(), textElements: [] }],
      selectedFrameId: null,
    })),

  updateFrame: (id, updates) =>
    set((state) => ({
      ...pushHistory(state),
      frames: state.frames.map((frame) =>
        frame.id === id ? { ...frame, ...updates } : frame
      ),
    })),

  deleteFrame: (id) =>
    set((state) => ({
      ...pushHistory(state),
      frames: state.frames.filter((frame) => frame.id !== id),
      selectedFrameId: state.selectedFrameId === id ? null : state.selectedFrameId,
      selectedTextId: null,
    })),

  setSelectedFrameId: (id) => set({ selectedFrameId: id, selectedTextId: null }),

  // ── Text element actions ──────────────────────────────────────────────────

  addTextToFrame: (frameId) =>
    set((state) => {
      const frame = state.frames.find((f) => f.id === frameId);
      if (!frame) return state;

      const newText: TextElement = {
        id: uuidv4(),
        text: 'Add text',
        x: frame.width / 2 - 200,
        y: frame.height / 2 - 40,
        width: 400,
        fontSize: 80,
        fontFamily: 'Inter',
        fontColor: '#000000',
        fontStyle: 'bold',
        align: 'center',
        lineHeight: 1.2,
      };

      return {
        ...pushHistory(state),
        frames: state.frames.map((f) =>
          f.id === frameId
            ? { ...f, textElements: [...(f.textElements ?? []), newText] }
            : f
        ),
        selectedTextId: newText.id,
        selectedFrameId: frameId,
      };
    }),

  updateTextElement: (frameId, textId, updates) =>
    set((state) => ({
      ...pushHistory(state),
      frames: state.frames.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              textElements: (frame.textElements ?? []).map((t) =>
                t.id === textId ? { ...t, ...updates } : t
              ),
            }
          : frame
      ),
    })),

  deleteTextElement: (frameId, textId) =>
    set((state) => ({
      ...pushHistory(state),
      frames: state.frames.map((frame) =>
        frame.id === frameId
          ? {
              ...frame,
              textElements: (frame.textElements ?? []).filter((t) => t.id !== textId),
            }
          : frame
      ),
      selectedTextId: null,
    })),

  setSelectedTextId: (id) => set({ selectedTextId: id }),

  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setCanvasBgColor: (color) => set({ canvasBgColor: color }),
  setExportConfig: (config) =>
    set((state) => ({ exportConfig: { ...state.exportConfig, ...config } })),
}));
