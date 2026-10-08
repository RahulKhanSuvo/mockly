"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Grid2x2,
  Archive,
  Plus,
  ChevronDown,
  MoreHorizontal,
  Pen,
  Copy,
  FolderInput,
  Trash2,
  Mail,
  Link2,
  X,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "cn";

// ── Types ─────────────────────────────────────────────────────────────────────
type CanvasType = "screenshot" | "mockup" | "graphic" | "custom";

interface Project {
  id: string;
  name: string;
  viewedAt: string;
  preview: "cryptix" | "framer" | "empty" | "wireframe";
}

// ── Sample project data ────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  { id: "1", name: "Cryptix (copy)", viewedAt: "Viewed 1y ago", preview: "cryptix" },
  { id: "2", name: "Site From Scratch - Community...", viewedAt: "Viewed 23m ago", preview: "framer" },
  { id: "3", name: "Social Pattern", viewedAt: "Viewed 26m ago", preview: "empty" },
  { id: "4", name: "Untitled", viewedAt: "Viewed 1y ago", preview: "wireframe" },
  { id: "5", name: "Untitled", viewedAt: "Viewed 1y ago", preview: "empty" },
];

// ── Canvas type options ────────────────────────────────────────────────────────
const CANVAS_TYPES: { id: CanvasType; label: string; description: string; preview: React.ReactNode }[] = [
  {
    id: "screenshot",
    label: "App Store Screenshot",
    description: "Create screenshots for your App Store listing.",
    preview: <ScreenshotPreview />,
  },
  {
    id: "mockup",
    label: "Mockup",
    description: "Place your screenshots inside device and product mockups.",
    preview: <MockupPreview />,
  },
  {
    id: "graphic",
    label: "Marketing Graphic",
    description: "Create banners and promotional product graphics.",
    preview: <GraphicPreview />,
  },
  {
    id: "custom",
    label: "Custom Size",
    description: "Start with a completely custom canvas size.",
    preview: <CustomPreview />,
  },
];

// ── Card thumbnail renders ─────────────────────────────────────────────────────
function CryptixPreview() {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#161822] to-[#0a0a0f]">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-48 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-[8px] font-semibold tracking-wide text-white/90">Cryptix</span>
        </div>
        <span className="text-[7px] text-white/40 font-mono">Duplicate Template</span>
      </div>
      <div className="flex flex-col items-center text-center my-auto py-2">
        <span className="text-[11px] font-bold text-white tracking-tight leading-snug">
          Take Control of Your<br />Digital Assets
        </span>
        <p className="text-[6px] text-white/50 mt-1 max-w-[130px] leading-relaxed">
          Cryptix offers a seamless, secure dashboard for managing crypto wealth.
        </p>
        <div className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-400 text-black text-[7px] font-semibold">
          Get started now →
        </div>
      </div>
      <div className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-2 backdrop-blur-sm shadow-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[6px] text-white/60">Main Dashboard</span>
          <span className="text-[6px] text-emerald-400 font-mono">+18.4%</span>
        </div>
        <span className="text-[11px] font-bold text-white font-mono leading-none">€22,193.05</span>
        <svg className="w-full h-6 text-emerald-400 my-1" fill="none" viewBox="0 0 100 24">
          <path d="M0 20 Q 20 8, 40 14 T 70 6 T 100 2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M0 20 Q 20 8, 40 14 T 70 6 T 100 2 L 100 24 L 0 24 Z" fill="currentColor" fillOpacity="0.08" />
        </svg>
        <div className="flex items-center justify-between text-[6px] text-white/50 border-t border-white/5 pt-1">
          <span>Assets: 14</span>
          <span>Market: Bullish</span>
        </div>
      </div>
    </div>
  );
}

function FramerPreview() {
  return (
    <div className="w-full h-full p-3 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#131317] via-[#0d0d10] to-[#08080a]">
      <div className="flex items-center justify-between">
        <svg className="w-3.5 h-3.5 text-white/70" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 2h16v7H12l8 8v7H4v-7h8L4 9V2z" />
        </svg>
        <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[6px] font-medium">Remix this</span>
      </div>
      <div className="relative w-full h-32 my-auto flex items-center justify-center">
        <div className="absolute -left-1 w-20 h-28 rounded-lg bg-indigo-600/90 p-2 shadow-lg -rotate-12 flex flex-col justify-between border border-white/20">
          <span className="text-[7px] text-white font-bold leading-tight">Start With<br />Framer</span>
          <span className="text-[5px] text-white/70">Zero code.</span>
        </div>
        <div className="absolute z-10 w-24 h-32 rounded-xl bg-black/80 border border-white/20 p-2 shadow-2xl flex flex-col justify-between">
          <div className="w-full aspect-[4/3] rounded bg-gradient-to-tr from-purple-500 to-sky-400 flex items-center justify-center">
            <span className="text-[8px] text-white font-black italic tracking-tighter">FINANCE!</span>
          </div>
          <div className="text-[6px] text-white/80 font-mono">Adding fun to cards</div>
        </div>
        <div className="absolute -right-1 w-20 h-28 rounded-lg bg-sky-500/90 p-2 shadow-lg rotate-12 flex flex-col justify-between border border-white/20">
          <span className="text-[6px] text-white font-semibold">Deploy</span>
          <span className="text-[5px] text-white/70">Instant live site</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 pt-1 border-t border-white/5">
        <span className="text-[8px] font-bold text-white tracking-tight">The website builder we&apos;ve been dreaming about.</span>
        <div className="flex items-center gap-2 mt-1">
          {["Design", "Publish", "Scale"].map((t) => (
            <span key={t} className="text-[6px] text-white/40">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyPreview() {
  return (
    /* bg-brand-card-empty resolves to var(--brand-card-empty) = #f8f8f9 */
    <div className="w-full h-full flex items-center justify-center bg-brand-card-empty">
      <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 2h16v7H12l8 8v7H4v-7h8L4 9V2z" />
      </svg>
    </div>
  );
}

function WireframePreview() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-2.5">
      <div className="w-full flex items-center justify-between pb-1.5 border-b border-gray-100">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          <span className="text-[6px] font-semibold text-gray-600">Framer</span>
        </div>
        <div className="flex items-center gap-1.5 text-[5px] text-gray-400">
          {["Product", "Resources", "Pricing"].map((t) => <span key={t}>{t}</span>)}
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-1">
        <div className="w-16 h-1 bg-gray-200 rounded" />
        <div className="w-24 h-1 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

// ── Modal canvas type previews ─────────────────────────────────────────────────
function ScreenshotPreview() {
  return (
    <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center">
      <div className="w-20 h-14 bg-white rounded border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {/* Brand primary stripe — uses CSS var */}
        <div className="h-2 w-full" style={{ background: "var(--brand-primary)" }} />
        <div className="flex-1 p-1 flex flex-col gap-0.5">
          <div className="h-1 bg-gray-200 rounded w-3/4" />
          <div className="h-1 bg-gray-100 rounded w-1/2" />
          <div className="mt-0.5 h-1.5 rounded w-8" style={{ background: "color-mix(in srgb, var(--brand-primary) 20%, transparent)" }} />
        </div>
      </div>
    </div>
  );
}

function MockupPreview() {
  return (
    <div className="w-full h-full bg-[#1a1a2e] rounded-lg flex items-center justify-center">
      <div className="relative flex items-end gap-1">
        <div className="w-10 h-16 bg-[#111] rounded-lg border border-white/20 shadow-xl flex flex-col overflow-hidden">
          <div className="h-1 bg-white/10 mx-1 mt-1 rounded" />
          <div className="flex-1 bg-gradient-to-b from-indigo-500 to-purple-600 m-0.5 rounded" />
          <div className="h-2 flex items-center justify-center">
            <div className="w-3 h-0.5 bg-white/30 rounded" />
          </div>
        </div>
        <div className="w-7 h-12 bg-[#111] rounded border border-white/20 shadow-lg flex flex-col overflow-hidden mb-1">
          <div className="flex-1 bg-gradient-to-b from-sky-400 to-blue-600 m-0.5 rounded" />
          <div className="h-1 flex items-center justify-center">
            <div className="w-2 h-0.5 bg-white/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function GraphicPreview() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg flex items-center justify-center">
      <div className="flex flex-col gap-1 w-3/4">
        <div className="h-1.5 bg-gray-300 rounded w-full" />
        <div className="h-1 bg-gray-200 rounded w-3/4" />
        <div className="h-1 bg-gray-200 rounded w-1/2" />
        <div className="mt-1 flex gap-1">
          <div
            className="h-4 w-10 rounded text-[4px] text-white flex items-center justify-center font-bold"
            style={{ background: "var(--brand-primary)" }}
          >
            CTA
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomPreview() {
  return (
    <div className="w-full h-full bg-slate-50 rounded-lg flex items-center justify-center">
      <div className="w-16 h-12 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center gap-0.5">
        <span className="text-[5px] text-gray-400 font-mono">1920 × 1080</span>
        <span className="text-[5px] text-gray-400">Custom ratio</span>
      </div>
    </div>
  );
}

// ── Project card ───────────────────────────────────────────────────────────────
function ProjectCard({ project }: { project: Project }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const previewMap: Record<Project["preview"], React.ReactNode> = {
    cryptix: <CryptixPreview />,
    framer: <FramerPreview />,
    empty: <EmptyPreview />,
    wireframe: <WireframePreview />,
  };

  return (
    <div className="group flex flex-col cursor-pointer" onClick={() => router.push("/editor?type=screenshot")}>
      {/* Thumbnail — border uses brand-subtle token */}
      <div className="relative w-full aspect-[4/5] rounded-2xl border border-brand-subtle overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:-translate-y-0.5">
        {previewMap[project.preview]}
      </div>

      {/* Label row */}
      <div className="mt-2.5 flex items-start justify-between relative">
        <div className="flex flex-col min-w-0 pr-2">
          {/* text-brand-primary on hover */}
          <span className="text-[13px] font-medium text-gray-900 group-hover:text-brand-primary transition-colors truncate">
            {project.name}
          </span>
          <span className="text-[11px] text-gray-400 font-normal">{project.viewedAt}</span>
        </div>

        {/* Context menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-brand-surface text-gray-400 hover:text-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 w-48 bg-white border border-brand-subtle rounded-xl shadow-xl py-1 z-20 flex flex-col">
                {[
                  { icon: <Pen className="w-3.5 h-3.5 text-gray-400" />, label: "Rename" },
                  { icon: <Copy className="w-3.5 h-3.5 text-gray-400" />, label: "Duplicate" },
                  { icon: <FolderInput className="w-3.5 h-3.5 text-gray-400" />, label: "Move to..." },
                ].map(({ icon, label }) => (
                  <button key={label} className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-gray-700 hover:bg-gray-50 transition-colors w-full text-left">
                    {icon}<span>{label}</span>
                  </button>
                ))}
                <div className="my-1 border-t border-brand-divider" />
                <button className="flex items-center gap-2 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                  <Trash2 className="w-3.5 h-3.5 text-red-500" /><span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── New Project Modal ──────────────────────────────────────────────────────────
function NewProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<CanvasType>("screenshot");
  const router = useRouter();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[17px] font-semibold text-gray-900 tracking-tight">Create a new project</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Choose what you want to create.</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-brand-surface text-gray-400 hover:text-gray-600 transition-colors mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas type grid */}
        <div className="px-6 grid grid-cols-2 gap-3">
          {CANVAS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={cn(
                "relative text-left rounded-xl border-2 p-0 overflow-hidden transition-all duration-150 focus:outline-none",
                selected === type.id
                  ? "border-brand-primary shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-primary)_15%,transparent)]"
                  : "border-brand-subtle hover:border-gray-300"
              )}
            >
              {/* Thumbnail */}
              <div className="w-full h-28 bg-brand-surface">{type.preview}</div>

              {/* Checkmark when selected */}
              {selected === type.id && (
                <div
                  className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                  style={{ background: "var(--brand-primary)" }}
                >
                  <Check className="w-3 h-3 text-brand-primary-fg" strokeWidth={3} />
                </div>
              )}

              {/* Label */}
              <div className="p-3 border-t border-brand-divider bg-white">
                <p className="text-[13px] font-semibold text-gray-900">{type.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 mt-2 flex items-center justify-between border-t border-brand-divider">
          <span className="text-[11px] text-gray-400 font-mono">
            <span className="inline-flex items-center gap-1 bg-brand-surface rounded px-1.5 py-0.5 text-gray-500 font-medium">esc</span>
            {" "}to close
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-1.5 text-[13px] text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { onClose(); router.push(`/editor?type=${selected}`); }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-brand-primary-fg text-[13px] font-medium rounded-lg shadow-sm transition-all hover:opacity-90"
              style={{ background: "var(--brand-primary)" }}
            >
              Create Project <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "archive">("all");

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans">

      {/* ── Left Sidebar ── */}
      <aside className="w-64 border-r border-brand-subtle flex flex-col justify-between shrink-0 min-h-screen bg-white select-none">
        <div className="p-3.5 flex flex-col gap-4">

          {/* Workspace selector */}
          <div className="flex items-center justify-between px-1.5 py-1 rounded-lg hover:bg-black/[0.04] cursor-pointer transition-colors group">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded bg-brand-surface border border-brand-avatar-border flex items-center justify-center font-semibold text-[11px] text-gray-800 shrink-0">
                M
              </div>
              <span className="text-[13px] font-medium text-gray-900 truncate">My Workspace</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors shrink-0" />
          </div>

          {/* Search */}
          <div className="relative flex items-center w-full">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-brand-input-bg text-[13px] text-gray-900 placeholder:text-brand-placeholder border-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-all outline-none"
              placeholder="Search..."
              type="text"
            />
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="px-2 text-[11px] font-medium text-brand-muted mb-1">Projects</span>

            {(["all", "archive"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] transition-all w-full text-left",
                  activeTab === tab
                    ? "bg-brand-subtle text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-black/[0.04] hover:text-gray-900 font-normal"
                )}
              >
                {tab === "all"
                  ? <Grid2x2 className="w-4 h-4" />
                  : <Archive className="w-4 h-4 text-gray-500" />}
                <span>{tab === "all" ? "All" : "Archive"}</span>
              </button>
            ))}

            <button className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-brand-muted hover:bg-black/[0.04] hover:text-gray-900 text-[13px] font-normal transition-all text-left">
              <Plus className="w-4 h-4 text-gray-400" />
              <span>New folder...</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-brand-divider flex items-center justify-between gap-2">
          <button className="flex items-center gap-2 px-1 text-[12px] text-gray-600 hover:text-gray-900 transition-colors">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>Invite your team</span>
          </button>
          <button className="px-2.5 py-1 rounded-md border border-brand-avatar-border bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-50 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all flex items-center gap-1">
            <Link2 className="w-3 h-3" /> Copy link
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-white overflow-y-auto">
        <div className="w-full max-w-[1580px] mx-auto px-8 md:px-12 py-7 flex flex-col gap-6">

          {/* Top bar */}
          <div className="flex items-center justify-between pb-1">
            <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">
              {activeTab === "all" ? "All" : "Archive"}
            </h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-surface-hover text-[12px] font-medium text-gray-800 transition-colors">
                <span>Alphabetically</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>
              {/* New project — brand-primary background */}
              <button
                onClick={() => setNewProjectOpen(true)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-brand-primary-fg text-[12px] font-medium shadow-sm transition-all hover:opacity-90"
                style={{ background: "var(--brand-primary)" }}
              >
                New project
              </button>
            </div>
          </div>

          {/* Project grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {PROJECTS.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      <NewProjectModal open={newProjectOpen} onClose={() => setNewProjectOpen(false)} />
    </div>
  );
}
