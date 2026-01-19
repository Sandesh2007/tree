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
} from "lucide-react";
import Button from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";

interface ToolbarProps {
  hasSelection: boolean;
  onAddPerson: () => void;
  onEditPerson: () => void;
  onAddRelation: () => void;
  onDeletePerson: () => void;
  onExport: () => void;
  onImport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
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
  onExport,
  onImport,
  onUndo,
  onRedo,
  onAutoLayout,
  canUndo,
  canRedo,
  nodeCount,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-neutral-50/90 dark:bg-neutral-900/70 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border">
      <Button
        onClick={onAddPerson}
        className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 hover:dark:bg-neutral-700 hover:dark:text-neutral-50"
      >
        <Plus size={18} />
        Add Person
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      <Button
        variant="ghost"
        onClick={onUndo}
        disabled={!canUndo}
        tooltip="Undo (Ctrl+Z)"
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Undo2 size={18} />
      </Button>
      <Button
        variant="ghost"
        onClick={onRedo}
        disabled={!canRedo}
        tooltip="Redo (Ctrl+Y)"
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Redo2 size={18} />
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="secondary"
        onClick={onEditPerson}
        disabled={!hasSelection}
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Pencil size={16} />
        Edit
      </Button>
      <Button
        variant="secondary"
        onClick={onAddRelation}
        disabled={!hasSelection}
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Link2 size={16} />
        Connect
      </Button>
      <Button
        variant="destructive"
        onClick={onDeletePerson}
        disabled={!hasSelection}
      >
        <Trash2 size={16} />
      </Button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

      <Button
        variant="ghost"
        onClick={onAutoLayout}
        disabled={nodeCount === 0}
        tooltip="Auto Layout"
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <LayoutGrid size={18} />
      </Button>
      <Button
        variant="ghost"
        onClick={onExport}
        disabled={nodeCount === 0}
        tooltip="Export"
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Download size={18} />
      </Button>
      <Button
        variant="ghost"
        onClick={onImport}
        tooltip="Import"
        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50"
      >
        <Upload size={18} />
      </Button>
      <ThemeToggle />

      {nodeCount > 0 && (
        <>
          <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {nodeCount} people
          </span>
        </>
      )}
    </div>
  );
}
