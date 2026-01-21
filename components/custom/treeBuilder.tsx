"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

import Toolbar from "@/components/panel/toolbar";
import Legend from "@/components/panel/legend";
import NodeInfo from "@/components/panel/node-info";
import SearchPanel from "@/components/panel/search";
import AddPersonDialog from "@/components/dialogs/addNode";
import EditPersonDialog from "@/components/dialogs/editNode";
import AddRelationDialog from "@/components/dialogs/add-relation-dialog";
import ConfirmDialog from "@/components/custom/confirm-dialog";
import EmptyState from "@/components/custom/tree-builder/emptyState";
import ToastContainer from "@/components/custom/toast";
import { useToast } from "@/app/hooks/useToast";
import { useHistory } from "@/app/hooks/useHistory";
import { DiagramRef } from "@/components/custom/tree-builder/diagramWrapper";

import {
  PersonData,
  LinkData,
  PersonFormData,
  RelationType,
  NodeLevel,
} from "@/types/types";
import { relationConfig } from "@/types/constants";

// Types for importing JSON data (handles both old and new formats)
interface ImportNodeData {
  key?: string;
  id?: string;
  name?: string;
  role?: string;
  department?: string;
  email?: string;
  phone?: string;
  level?: NodeLevel;
  loc?: string;
  data?: {
    name?: string;
    role?: string;
    department?: string;
    email?: string;
    phone?: string;
    level?: NodeLevel;
  };
}

interface ImportLinkData {
  key?: string;
  id?: string;
  from?: string;
  source?: string;
  to?: string;
  target?: string;
  relationType?: RelationType;
  label?: string;
  data?: {
    relationType?: RelationType;
    label?: string;
  };
}

// Dynamic import to avoid SSR issues with GoJS
const DiagramWrapper = dynamic(
  () => import("@/components/custom/tree-builder/diagramWrapper"),
  { ssr: false },
);

const initialFormData: PersonFormData = {
  name: "",
  role: "",
  department: "",
  email: "",
  phone: "",
  level: "member",
  parentId: "",
  relationType: "reports_to",
};

export default function TreeBuilder() {
  const [nodes, setNodes] = useState<PersonData[]>([]);
  const [links, setLinks] = useState<LinkData[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState<PersonFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const diagramRef = useRef<DiagramRef>(null);

  const { toasts, addToast, removeToast } = useToast();
  const { pushState, undo, redo, canUndo, canRedo } = useHistory();

  // Handle undo
  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes as PersonData[]);
      setLinks(state.edges as LinkData[]);
      addToast("info", "Undo successful");
    }
  }, [undo, addToast]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes as PersonData[]);
      setLinks(state.edges as LinkData[]);
      addToast("info", "Redo successful");
    }
  }, [redo, addToast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNode) {
          e.preventDefault();
          setIsDeleteConfirmOpen(true);
        }
      }

      if (e.key === "Escape") {
        setSelectedNode(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, handleUndo, handleRedo]);

  // Save state for undo/redo
  const saveState = useCallback(() => {
    pushState(nodes, links);
  }, [nodes, links, pushState]);

  // Handle node selection from diagram
  const handleNodeSelect = useCallback((key: string | null) => {
    setSelectedNode(key);
  }, []);

  // Handle model changes from diagram
  const handleModelChange = useCallback(
    (data: { nodes: PersonData[]; links: LinkData[] }) => {
      // Update positions from diagram
      setNodes(data.nodes);
      setLinks(data.links);
    },
    [],
  );

  // Handle link created via drag
  const handleLinkCreated = useCallback(
    (fromKey: string, toKey: string) => {
      // Check for existing link
      const exists = links.some(
        (l) =>
          (l.from === fromKey && l.to === toKey) ||
          (l.from === toKey && l.to === fromKey),
      );

      if (exists) {
        addToast("warning", "Connection already exists");
        return;
      }

      const newLink: LinkData = {
        key: `link-${Date.now()}`,
        from: fromKey,
        to: toKey,
        relationType: "manages",
        label: "Manages",
      };

      setLinks((prev) => [...prev, newLink]);
      saveState();
      addToast("success", "Connection created");
    },
    [links, addToast, saveState],
  );

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

  // Validate form
  const validateForm = (data: PersonFormData) => {
    const errors: Record<string, string> = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    }

    if (!data.role.trim()) {
      errors.role = "Role is required";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add person
  const handleAddPerson = () => {
    if (!validateForm(formData)) return;

    const newKey = `node-${Date.now()}`;

    const newNode: PersonData = {
      key: newKey,
      name: formData.name.trim(),
      role: formData.role.trim(),
      department: formData.department.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      level: formData.level,
    };

    setNodes((prev) => [...prev, newNode]);

    if (formData.parentId) {
      const newLink: LinkData = {
        key: `link-${Date.now()}`,
        from: formData.parentId,
        to: newKey,
        relationType: formData.relationType,
        label: relationConfig[formData.relationType].label,
      };
      setLinks((prev) => [...prev, newLink]);
    }

    saveState();
    resetForm();
    setIsAddModalOpen(false);
    addToast("success", `${formData.name} added successfully`);

    // Apply layout after adding
    setTimeout(() => diagramRef.current?.applyLayout(), 100);
  };

  // Edit person
  const handleEditPerson = () => {
    if (!selectedNode || !validateForm(formData)) return;

    setNodes((prev) =>
      prev.map((node) =>
        node.key === selectedNode
          ? {
              ...node,
              name: formData.name.trim(),
              role: formData.role.trim(),
              department: formData.department.trim() || undefined,
              email: formData.email.trim() || undefined,
              phone: formData.phone.trim() || undefined,
              level: formData.level,
            }
          : node,
      ),
    );

    saveState();
    resetForm();
    setIsEditModalOpen(false);
    addToast("success", "Changes saved successfully");
  };

  // Delete person
  const handleDeletePerson = () => {
    if (!selectedNode) return;

    const nodeToDelete = nodes.find((n) => n.key === selectedNode);
    setNodes((prev) => prev.filter((node) => node.key !== selectedNode));
    setLinks((prev) =>
      prev.filter(
        (link) => link.from !== selectedNode && link.to !== selectedNode,
      ),
    );

    saveState();
    setSelectedNode(null);
    setIsDeleteConfirmOpen(false);
    addToast("success", `${nodeToDelete?.name} removed`);
  };

  // Open edit modal
  const openEditModal = () => {
    const node = nodes.find((n) => n.key === selectedNode);
    if (node) {
      setFormData({
        name: node.name,
        role: node.role,
        department: node.department || "",
        email: node.email || "",
        phone: node.phone || "",
        level: node.level,
        parentId: "",
        relationType: "reports_to",
      });
      setIsEditModalOpen(true);
    }
  };

  // Add relation
  const handleAddRelation = () => {
    if (!selectedNode || !formData.parentId) return;

    // Check for duplicate
    const existingLink = links.find(
      (l) =>
        ((l.from === formData.parentId && l.to === selectedNode) ||
          (l.from === selectedNode && l.to === formData.parentId)) &&
        l.relationType === formData.relationType,
    );

    if (existingLink) {
      addToast("error", "This relation already exists");
      return;
    }

    const newLink: LinkData = {
      key: `link-${Date.now()}`,
      from: formData.parentId,
      to: selectedNode,
      relationType: formData.relationType,
      label: relationConfig[formData.relationType].label,
    };

    setLinks((prev) => [...prev, newLink]);
    saveState();
    resetForm();
    setIsRelationModalOpen(false);
    addToast("success", "Connection added");
  };

  // Auto layout
  const handleAutoLayout = useCallback(() => {
    diagramRef.current?.applyLayout();
    addToast("success", "Layout applied");
  }, [addToast]);

  // Zoom to fit
  const handleZoomToFit = useCallback(() => {
    diagramRef.current?.zoomToFit();
  }, []);

  // Focus on node
  const handleNodeFocus = useCallback((key: string) => {
    diagramRef.current?.centerOnNode(key);
  }, []);

  // Export data as JSON
  const handleExportData = () => {
    const data = { nodes, links };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `org-tree-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("success", "Tree exported successfully");
  };

  // Export as image
  const handleExportImage = () => {
    const imageData = diagramRef.current?.exportImage();
    if (imageData) {
      const a = document.createElement("a");
      a.href = imageData;
      a.download = `org-tree-${new Date().toISOString().split("T")[0]}.png`;
      a.click();
      addToast("success", "Image exported successfully");
    }
  };

  // Import
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          // Handle both old format (nodes/edges) and new format (nodes/links)
          if (data.nodes) {
            // Convert old format to new if necessary
            const newNodes: PersonData[] = data.nodes.map(
              (n: ImportNodeData) => ({
                key: n.key || n.id,
                name: n.data?.name || n.name,
                role: n.data?.role || n.role,
                department: n.data?.department || n.department,
                email: n.data?.email || n.email,
                phone: n.data?.phone || n.phone,
                level: n.data?.level || n.level || "member",
                loc: n.loc,
              }),
            );

            const linksData = data.links || data.edges || [];
            const newLinks: LinkData[] = linksData.map((l: ImportLinkData) => ({
              key: l.key || l.id,
              from: l.from || l.source,
              to: l.to || l.target,
              relationType:
                l.relationType || l.data?.relationType || "reports_to",
              label: l.label || l.data?.label,
            }));

            setNodes(newNodes);
            setLinks(newLinks);
            saveState();
            addToast("success", `Imported ${newNodes.length} people`);
            setTimeout(() => {
              diagramRef.current?.applyLayout();
              diagramRef.current?.zoomToFit();
            }, 100);
          } else {
            addToast("error", "Invalid file format");
          }
        } catch (error) {
          addToast("error", "Failed to parse file");
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const selectedNodeData = nodes.find((n) => n.key === selectedNode);

  return (
    <div className="w-screen h-screen bg-neutral-50 dark:bg-neutral-900 relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* GoJS Diagram */}
      {nodes.length > 0 ? (
        <DiagramWrapper
          ref={diagramRef}
          nodes={nodes}
          links={links}
          onNodeSelect={handleNodeSelect}
          onModelChange={handleModelChange}
          onLinkCreated={handleLinkCreated}
        />
      ) : (
        <EmptyState onAddPerson={() => setIsAddModalOpen(true)} />
      )}

      {/* Toolbar - Top Left */}
      <div className="absolute top-4 left-4 z-10">
        <Toolbar
          hasSelection={!!selectedNode}
          onAddPerson={() => setIsAddModalOpen(true)}
          onEditPerson={openEditModal}
          onAddRelation={() => setIsRelationModalOpen(true)}
          onDeletePerson={() => setIsDeleteConfirmOpen(true)}
          onExportData={handleExportData}
          onExportImage={handleExportImage}
          onImport={handleImport}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onAutoLayout={handleAutoLayout}
          onZoomToFit={handleZoomToFit}
          canUndo={canUndo}
          canRedo={canRedo}
          nodeCount={nodes.length}
        />
      </div>

      {/* Search & Legend - Top Right */}
      <div className="absolute top-4 right-4 z-10 w-64">
        <SearchPanel
          nodes={nodes}
          onNodeSelect={setSelectedNode}
          onNodeFocus={handleNodeFocus}
        />
        <Legend />
      </div>

      {/* Node Info - Bottom Left */}
      {selectedNodeData && (
        <div className="absolute bottom-4 left-4 z-10">
          <NodeInfo data={selectedNodeData} />
        </div>
      )}

      {/* Dialogs */}
      <AddPersonDialog
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddPerson}
        nodes={nodes}
      />

      <EditPersonDialog
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEditPerson}
      />

      <AddRelationDialog
        isOpen={isRelationModalOpen}
        onClose={() => {
          setIsRelationModalOpen(false);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddRelation}
        nodes={nodes}
        links={links}
        selectedNodeId={selectedNode}
        selectedNodeName={selectedNodeData?.name || ""}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeletePerson}
        title="Delete Person"
        message={`Are you sure you want to delete "${selectedNodeData?.name}"? This will also remove all their connections.`}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
