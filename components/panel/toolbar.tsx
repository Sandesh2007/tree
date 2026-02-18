"use client";

import { useState } from "react";
import {
  Plus,
  Pencil,
  Link2,
  Trash2,
  Download,
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  Image,
  ArrowDown,
  ArrowRight,
  Save,
  Lock,
  Globe,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Button from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/themeToggle";
import SearchPanel from "./search";

interface CanvasInfo {
  id: string;
  name: string;
  isPublic: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
  onSave: () => void;
  onRename: (name: string) => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onBack: () => void;
}

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
  onAutoLayout: (direction: "TB" | "LR") => void;
  onZoomToFit: () => void;
  canUndo: boolean;
  canRedo: boolean;
  nodeCount: number;
  layoutDirection?: "TB" | "LR";
  canvas?: CanvasInfo;
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
  layoutDirection = "TB",
  canvas,
}: ToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(canvas?.name || "");

  const handleNameSubmit = () => {
    if (canvas && editedName.trim()) {
      canvas.onRename(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameSubmit();
    } else if (e.key === "Escape") {
      setEditedName(canvas?.name || "");
      setIsEditingName(false);
    }
  };

  const formatLastSaved = (date: Date) => {
    const diff = new Date().getTime() - date.getTime();
    if (diff < 60000) return "just now";
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center justify-between w-full bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
      {/* Left section - Canvas info & Navigation */}
      <div className="flex items-center gap-3">
        {canvas && (
          <>
            <Button
              variant="ghost"
              size="md"
              onClick={canvas.onBack}
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </Button>

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleNameSubmit}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="text-sm font-semibold text-neutral-900 dark:text-white bg-transparent border-b-2 border-blue-500 focus:outline-none px-1 py-0.5 min-w-[120px]"
                />
              ) : (
                <span
                  className="text-sm font-semibold text-neutral-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => {
                    setEditedName(canvas.name);
                    setIsEditingName(true);
                  }}
                  title="Click to rename"
                >
                  {canvas.name}
                </span>
              )}
              <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                #{canvas.id.slice(0, 8)}
              </span>
            </div>

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
          </>
        )}

        {/* Add Person */}
        <Button onClick={onAddPerson} size="md">
          <Plus size={16} />
          <span className="hidden lg:inline">Add</span>
        </Button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="md"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={16} />
        </Button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        {/* Selection actions */}
        <Button
          variant="secondary"
          size="md"
          onClick={onEditPerson}
          disabled={!hasSelection}
          title="Edit selected"
        >
          <Pencil size={14} />
          <span className="hidden xl:inline">Edit</span>
        </Button>

        <Button
          variant="secondary"
          size="md"
          onClick={onAddRelation}
          disabled={!hasSelection}
          title="Add connection"
        >
          <Link2 size={14} />
          <span className="hidden xl:inline">Connect</span>
        </Button>

        <Button
          variant="destructive"
          size="md"
          onClick={onDeletePerson}
          disabled={!hasSelection}
          title="Delete selected"
        >
          <Trash2 size={14} />
        </Button>
      </div>

      {/* Center section - Layout & View controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg p-0.5">
          <Button
            variant={layoutDirection === "TB" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onAutoLayout("TB")}
            disabled={nodeCount === 0}
            title="Vertical Layout"
          >
            <ArrowDown size={14} />
          </Button>
          <Button
            variant={layoutDirection === "LR" ? "primary" : "ghost"}
            size="sm"
            onClick={() => onAutoLayout("LR")}
            disabled={nodeCount === 0}
            title="Horizontal Layout"
          >
            <ArrowRight size={14} />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="md"
          onClick={onZoomToFit}
          disabled={nodeCount === 0}
          title="Zoom to Fit"
        >
          <ZoomIn size={16} />
        </Button>

        <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />

        <Button
          variant="ghost"
          size="md"
          onClick={onExportData}
          disabled={nodeCount === 0}
          title="Export JSON"
        >
          <Upload size={16} />
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={onExportImage}
          disabled={nodeCount === 0}
          title="Export Image"
        >
          <Image size={16} />
        </Button>

        <Button variant="ghost" size="md" onClick={onImport} title="Import">
          <Download size={16} />
        </Button>

        {nodeCount > 0 && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 px-2">
            {nodeCount} {nodeCount === 1 ? "node" : "nodes"}
          </span>
        )}
      </div>

      {/* Right section - Canvas actions & Theme */}
      <div className="flex items-center gap-2">
        {canvas && (
          <>
            {/* Save status */}
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mr-2">
              {canvas.isSaving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : canvas.lastSaved ? (
                <>
                  <Save className="h-3 w-3 text-green-500" />
                  <span className="hidden sm:inline">
                    {formatLastSaved(canvas.lastSaved)}
                  </span>
                </>
              ) : null}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={canvas.onSave}
              disabled={
                canvas.isSaving ||
                (!canvas.hasUnsavedChanges && canvas.lastSaved !== null)
              }
              title="Save canvas"
            >
              <Save size={14} />
              <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
              variant={canvas.isPublic ? "primary" : "secondary"}
              size="md"
              onClick={canvas.onToggleVisibility}
              title={canvas.isPublic ? "Make private" : "Make public"}
              className={
                canvas.isPublic
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  : ""
              }
            >
              {canvas.isPublic ? <Globe size={14} /> : <Lock size={14} />}
            </Button>

            <Button
              variant="destructive"
              size="md"
              onClick={canvas.onDelete}
              title="Delete canvas"
            >
              <Trash2 size={14} />
            </Button>

            <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700" />
          </>
        )}

        <ThemeToggle />
      </div>
    </div>
  );
}
