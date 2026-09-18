import EditorCanvas from "@/components/editor/canvas/EditorCanvas";
import EditorToolbar from "@/components/editor/EditorToolbar";
import LeftSidebar from "@/components/editor/sidebar/LeftSidebar";
import RightSidebar from "@/components/editor/sidebar/RightSidebar";
import SidebarNav from "@/components/editor/sidebar/SidebarNav";

export default function EditorPage() {
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
