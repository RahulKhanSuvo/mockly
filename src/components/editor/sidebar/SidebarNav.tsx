"use client";

import { useCanvasStore, LeftTab } from "@/store/canvasStore";
import { LayoutTemplate, Image as ImageIcon, Type, Upload } from "lucide-react";

export default function SidebarNav() {
  const { activeLeftTab, setActiveLeftTab } = useCanvasStore();

  const navItems: { id: LeftTab; icon: React.ReactNode; label: string }[] = [
    { id: "templates", icon: <LayoutTemplate size={20} />, label: "Templates" },
    { id: "devices", icon: <ImageIcon size={20} />, label: "Devices" },
    { id: "text", icon: <Type size={20} />, label: "Text" },
    { id: "images", icon: <Upload size={20} />, label: "Images" },
    { id: "elements", icon: <Upload size={20} />, label: "Elements" },
  ];

  return (
    <nav className="w-16 bg-white border-r border-neutral-200 flex flex-col items-center py-4 space-y-4 z-20">
      {navItems.map((item) => {
        const isActive = activeLeftTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveLeftTab(item.id)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
