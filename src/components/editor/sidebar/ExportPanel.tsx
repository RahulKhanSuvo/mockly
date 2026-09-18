"use client";

import { useState } from "react";
import { useCanvasStore, exportHandlerRef, ExportFormat } from "@/store/canvasStore";

interface ExportPanelProps {
  frameId: string;
}

export function ExportPanel({ frameId }: ExportPanelProps) {
  const { exportConfig, setExportConfig } = useCanvasStore();
  const [isExporting, setIsExporting] = useState(false);

  function handleDownload() {
    if (!exportHandlerRef.current) return;
    setIsExporting(true);
    setTimeout(() => {
      exportHandlerRef.current!(frameId);
      setIsExporting(false);
    }, 50);
  }

  return (
    <div className="border-t border-neutral-200/80 pt-4 space-y-3">
      <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Export Settings</h3>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">Format</label>
        <div className="flex rounded-md border border-neutral-200 overflow-hidden text-xs font-semibold bg-neutral-100/60 p-0.5 gap-0.5">
          {(["png", "jpg", "webp"] as ExportFormat[]).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setExportConfig({ format: fmt })}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                exportConfig.format === fmt
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1">
          Scale <span className="text-neutral-400 font-normal">({exportConfig.scale}×)</span>
        </label>
        <div className="flex rounded-md border border-neutral-200 overflow-hidden text-xs font-semibold bg-neutral-100/60 p-0.5 gap-0.5">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setExportConfig({ scale: s })}
              className={`flex-1 py-1.5 rounded-md transition-all ${
                exportConfig.scale === s
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      <button
        id="export-download-btn"
        type="button"
        onClick={handleDownload}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-all shadow-sm"
      >
        {isExporting ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Exporting…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            Download {exportConfig.format.toUpperCase()}
          </>
        )}
      </button>
    </div>
  );
}
