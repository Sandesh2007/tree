"use client";

import { Plus, Pencil, Link2, Trash2, Download, Upload } from "lucide-react";
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
}

export default function Toolbar({
  hasSelection,
  onAddPerson,
  onEditPerson,
  onAddRelation,
  onDeletePerson,
  onExport,
  onImport,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-slate-200">
      <Button variant="primary" onClick={onAddPerson} tooltip="Add Person">
        <Plus size={18} />
        Add Person
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      <Button
        variant="secondary"
        onClick={onEditPerson}
        disabled={!hasSelection}
        tooltip="Edit"
      >
        <Pencil size={16} />
        Edit
      </Button>

      <Button
        variant="secondary"
        onClick={onAddRelation}
        disabled={!hasSelection}
        tooltip="Connect nodes"
      >
        <Link2 size={16} />
        Connect
      </Button>

      <Button
        variant="danger"
        onClick={onDeletePerson}
        tooltip="Delete"
        disabled={!hasSelection}
      >
        <Trash2 size={16} />
      </Button>

      <div className="w-px h-6 bg-slate-200" />

      <Button variant="ghost" onClick={onExport} tooltip="Export">
        <Download size={16} />
      </Button>

      <Button variant="ghost" onClick={onImport} tooltip="Import">
        <Upload size={16} />
      </Button>
      <ThemeToggle />
    </div>
  );
}
