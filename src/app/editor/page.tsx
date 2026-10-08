"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import EditorCanvas from "@/components/editor/canvas/EditorCanvas";
import EditorToolbar from "@/components/editor/EditorToolbar";
import LeftSidebar from "@/components/editor/sidebar/LeftSidebar";
import RightSidebar from "@/components/editor/sidebar/RightSidebar";
import SidebarNav from "@/components/editor/sidebar/SidebarNav";
import { useCanvasStore, type ProjectCanvasType } from "@/store/canvasStore";

const VALID_TYPES: ProjectCanvasType[] = ["screenshot", "mockup", "graphic", "custom"];

function isValidType(value: string | null): value is ProjectCanvasType {
  return VALID_TYPES.includes(value as ProjectCanvasType);
}

export default function EditorPage() {
  const searchParams = useSearchParams();
  const initializeFromType = useCanvasStore((s) => s.initializeFromType);
  // Guard: only initialize once per page mount, not on every re-render
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const rawType = searchParams.get("type");
    const type: ProjectCanvasType = isValidType(rawType) ? rawType : "screenshot";
    initializeFromType(type);
  }, [initializeFromType, searchParams]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100">
      <SidebarNav />
      <LeftSidebar />
      <main className="flex-1 relative">
        {/* Floating toolbar — sits above the canvas */}
        <EditorToolbar />
        <EditorCanvas />
      </main>
      <RightSidebar />
    </div>
  );
}
