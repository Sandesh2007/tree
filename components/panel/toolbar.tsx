"use client";

import {
  Plus,
  Pencil,
  Link2,
  Trash2,
  Download,
  Upload,
  Undo2,
  Redo2,
  LayoutGrid,
  ZoomIn,
  Image,
} from "lucide-react";
import Button from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";

interface ToolbarProps {
  hasSelection: boolean;
  onAddPerson: () => void;
  onEditPerson: () => void;
  onAddRelation: () => void;
  onDeletePerson: () => void;
  onExportData: () => void;
  onExportImage: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onZoomToFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nodeCount: number;
}

export default function Toolbar({
  hasSelection,
  onAddPerson,
  onEditPerson,
  onAddRelation,
  onDeletePerson,
  onExportData,
  onExportImage,
  onImport,
  onUndo,
  onRedo,
  onAutoLayout,
  onZoomToFit,
  canUndo,
  canRedo,
  nodeCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
      <Button onClick={onAddPerson}>
        <Plus size={18} />
        <span className="hidden sm:inline">Add Person</span>
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="ghost"
        size="md"
        onClick={onUndo}
        disabled={!canUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={18} />
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={onRedo}
        disabled={!canRedo}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 size={18} />
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="secondary"
        onClick={onEditPerson}
        disabled={!hasSelection}
      >
        <Pencil size={16} />
        <span className="hidden sm:inline">Edit</span>
      </Button>

      <Button
        variant="secondary"
        onClick={onAddRelation}
        disabled={!hasSelection}
      >
        <Link2 size={16} />
        <span className="hidden sm:inline">Connect</span>
      </Button>

      <Button
        variant="destructive"
        size="md"
        onClick={onDeletePerson}
        disabled={!hasSelection}
      >
        <Trash2 size={16} />
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="ghost"
        size="md"
        onClick={onAutoLayout}
        disabled={nodeCount === 0}
        title="Auto Layout"
      >
        <LayoutGrid size={18} />
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={onZoomToFit}
        disabled={nodeCount === 0}
        title="Zoom to Fit"
      >
        <ZoomIn size={18} />
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="ghost"
        size="md"
        onClick={onExportData}
        disabled={nodeCount === 0}
        title="Export JSON"
      >
        <Download size={18} />
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={onExportImage}
        disabled={nodeCount === 0}
        title="Export Image"
      >
        <Image size={18} />
      </Button>

      <Button variant="ghost" size="md" onClick={onImport} title="Import">
        <Upload size={18} />
      </Button>

      <ThemeToggle />

      {nodeCount > 0 && (
        <>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nodeCount} {nodeCount === 1 ? "person" : "people"}
          </span>
        </>
      )}
    </div>
  );
}
