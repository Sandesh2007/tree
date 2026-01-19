"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Controls,
  MiniMap,
  Background,
  Panel,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { gsap } from "gsap";

import PersonNode from "@/components/custom/tree-builder/person-node";
import CustomEdge from "@/components/custom/tree-builder/custom-edge";
import Toolbar from "@/components/custom/panel/toolbar";
import Legend from "@/components/custom/panel/legend";
import NodeInfo from "@/components/custom/panel/node-info";
import SearchPanel from "@/components/custom/panel/search";
import AddPersonDialog from "@/components/custom/dialogs/addNode";
import EditPersonDialog from "@/components/custom/dialogs/editNode";
import AddRelationDialog from "@/components/custom/dialogs/add-relation-dialog";
import ConfirmDialog from "@/components/custom/confirm-dialog";
import EmptyState from "@/components/custom/tree-builder/emptyState";
import ToastContainer from "@/components/custom/toast";
import { useToast } from "@/app/hooks/useToast";
import { useHistory } from "@/app/hooks/useHistory";

import {
  TreeNode,
  TreeEdge,
  PersonFormData,
  RelationType,
} from "../../types/types";
import { relationConfig, levelConfig } from "../../types/constants";
import { calculateTreeLayout } from "@/app/utils/treelayout";

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

function TreeBuilderInner() {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [edges, setEdges] = useState<TreeEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [formData, setFormData] = useState<PersonFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToast();
  const { pushState, undo, redo, canUndo, canRedo } = useHistory();
  const { fitView, setCenter } = useReactFlow();

  const nodeTypes = useMemo(() => ({ person: PersonNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  // Process edges to add index information for offset calculation
  const processedEdges = useMemo(() => {
    const edgePairs = new Map<string, TreeEdge[]>();

    // Group edges by node pairs (bidirectional)
    edges.forEach((edge) => {
      const key = [edge.source, edge.target].sort().join("-");
      if (!edgePairs.has(key)) {
        edgePairs.set(key, []);
      }
      edgePairs.get(key)!.push(edge);
    });

    // Add index and total count to each edge
    return edges.map((edge) => {
      const key = [edge.source, edge.target].sort().join("-");
      const pairEdges = edgePairs.get(key)!;
      const index = pairEdges.findIndex((e) => e.id === edge.id);

      return {
        ...edge,
        data: {
          ...edge.data,
          edgeIndex: index,
          totalEdges: pairEdges.length,
        },
      };
    });
  }, [edges]);

  const handleUndo = useCallback(() => {
    const state = undo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
      addToast("info", "Undo successful");
    }
  }, [undo, addToast]);

  const handleRedo = useCallback(() => {
    const state = redo();
    if (state) {
      setNodes(state.nodes);
      setEdges(state.edges);
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
  }, [selectedNode]);

  const saveState = useCallback(() => {
    pushState(nodes, edges);
  }, [nodes, edges, pushState]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params: any) => {
      // Check for existing relation
      const existingEdge = edges.find(
        (e) =>
          (e.source === params.source && e.target === params.target) ||
          (e.source === params.target && e.target === params.source),
      );

      if (existingEdge) {
        addToast("warning", "A connection already exists between these nodes");
        return;
      }

      const newEdge: TreeEdge = {
        ...params,
        id: `e-${params.source}-${params.target}-${Date.now()}`,
        type: "custom",
        data: { relationType: "manages" as RelationType, label: "Manages" },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: relationConfig.manages.color,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      saveState();
      addToast("success", "Connection created");
    },
    [edges, addToast, saveState],
  );

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
  };

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

  const handleAddPerson = () => {
    if (!validateForm(formData)) return;

    const newId = `node-${Date.now()}`;
    const parentNode = nodes.find((n) => n.id === formData.parentId);

    const newNode: TreeNode = {
      id: newId,
      type: "person",
      position: {
        x: parentNode ? parentNode.position.x + 50 : 100 + nodes.length * 50,
        y: parentNode ? parentNode.position.y + 250 : 100,
      },
      data: {
        name: formData.name.trim(),
        role: formData.role.trim(),
        department: formData.department.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        level: formData.level,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    if (formData.parentId) {
      const newEdge: TreeEdge = {
        id: `e-${formData.parentId}-${newId}`,
        source: formData.parentId,
        target: newId,
        type: "custom",
        data: {
          relationType: formData.relationType,
          label: relationConfig[formData.relationType].label,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: relationConfig[formData.relationType].color,
        },
      };
      setEdges((eds) => [...eds, newEdge]);
    }

    saveState();
    resetForm();
    setIsAddModalOpen(false);
    addToast("success", `${formData.name} added successfully`);
  };

  const handleEditPerson = () => {
    if (!selectedNode || !validateForm(formData)) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              data: {
                name: formData.name.trim(),
                role: formData.role.trim(),
                department: formData.department.trim() || undefined,
                email: formData.email.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                level: formData.level,
              },
            }
          : node,
      ),
    );

    saveState();
    resetForm();
    setIsEditModalOpen(false);
    addToast("success", "Changes saved successfully");
  };

  const handleDeletePerson = () => {
    if (!selectedNode) return;

    const nodeToDelete = nodes.find((n) => n.id === selectedNode);
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) =>
      eds.filter(
        (edge) => edge.source !== selectedNode && edge.target !== selectedNode,
      ),
    );

    saveState();
    setSelectedNode(null);
    setIsDeleteConfirmOpen(false);
    addToast("success", `${nodeToDelete?.data.name} removed`);
  };

  const openEditModal = () => {
    const node = nodes.find((n) => n.id === selectedNode);
    if (node) {
      setFormData({
        name: node.data.name,
        role: node.data.role,
        department: node.data.department || "",
        email: node.data.email || "",
        phone: node.data.phone || "",
        level: node.data.level,
        parentId: "",
        relationType: "reports_to",
      });
      setIsEditModalOpen(true);
    }
  };

  const handleAddRelation = () => {
    if (!selectedNode || !formData.parentId) return;

    // Check for duplicate relation
    const existingEdge = edges.find(
      (e) =>
        ((e.source === formData.parentId && e.target === selectedNode) ||
          (e.source === selectedNode && e.target === formData.parentId)) &&
        e.data?.relationType === formData.relationType,
    );

    if (existingEdge) {
      addToast("error", "This relation already exists");
      return;
    }

    const newEdge: TreeEdge = {
      id: `e-${formData.parentId}-${selectedNode}-${Date.now()}`,
      source: formData.parentId,
      target: selectedNode,
      type: "custom",
      data: {
        relationType: formData.relationType,
        label: relationConfig[formData.relationType].label,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: relationConfig[formData.relationType].color,
      },
    };

    setEdges((eds) => [...eds, newEdge]);
    saveState();
    resetForm();
    setIsRelationModalOpen(false);
    addToast("success", "Connection added");
  };

  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;

    const positions = calculateTreeLayout(nodes, edges, {
      nodeWidth: 220,
      nodeHeight: 150,
      horizontalSpacing: 60,
      verticalSpacing: 100,
      treeSpacing: 150,
      direction: "TB",
    });

    // Animate nodes to new positions
    const timeline = gsap.timeline({
      onComplete: () => {
        setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 50);
      },
    });

    const newNodes = nodes.map((node) => {
      const pos = positions.get(node.id);
      return pos ? { ...node, position: { x: pos.x, y: pos.y } } : node;
    });

    // Stagger animation for visual appeal
    nodes.forEach((node, index) => {
      const pos = positions.get(node.id);
      if (pos) {
        const element = document.querySelector(`[data-id="${node.id}"]`);
        if (element) {
          timeline.to(
            element,
            {
              x: pos.x,
              y: pos.y,
              duration: 0.5,
              ease: "power2.inOut",
            },
            index * 0.05,
          );
        }
      }
    });

    setNodes(newNodes);
    saveState();
    addToast("success", "Layout applied");
  }, [nodes, edges, fitView, saveState, addToast]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 500 });
  }, [fitView]);

  const handleNodeFocus = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setCenter(node.position.x + 110, node.position.y + 100, {
          zoom: 1,
          duration: 500,
        });
      }
    },
    [nodes, setCenter],
  );

  const handleExport = () => {
    const data = { nodes, edges };
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

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
            saveState();
            addToast("success", `Imported ${data.nodes.length} people`);
            setTimeout(() => fitView({ padding: 0.2, duration: 500 }), 100);
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

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="w-screen h-screen bg-neutral-50 dark:bg-neutral-900">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <ReactFlow
        nodes={nodes}
        edges={processedEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodeDragStop={saveState}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-neutral-50 dark:bg-neutral-900"
        deleteKeyCode={null}
      >
        <Background
          color="#e5e5e5"
          gap={24}
          size={1}
          className="dark:!opacity-20"
        />
        <Controls className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-lg [&_button]:dark:bg-neutral-700 [&_button]:dark:text-neutral-100 [&_button]:dark:border-neutral-600 [&_button]:dark:hover:bg-neutral-600" />
        <MiniMap
          nodeColor={(node) => {
            const level = node.data?.level as keyof typeof levelConfig;
            return levelConfig[level]?.bgColor?.replace("bg-", "") || "#94a3b8";
          }}
          maskColor="rgba(0,0,0,0.08)"
          className="bg-white! dark:bg-neutral-800! border! border-neutral-200! dark:border-neutral-700! rounded-xl! shadow-lg! [&_svg]:dark:!bg-neutral-700!"
          pannable
          zoomable
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <Toolbar
            hasSelection={!!selectedNode}
            onAddPerson={() => setIsAddModalOpen(true)}
            onEditPerson={openEditModal}
            onAddRelation={() => setIsRelationModalOpen(true)}
            onDeletePerson={() => setIsDeleteConfirmOpen(true)}
            onExport={handleExport}
            onImport={handleImport}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onAutoLayout={handleAutoLayout}
            canUndo={canUndo}
            canRedo={canRedo}
            nodeCount={nodes.length}
          />
        </Panel>

        {/* Legend */}
        <Panel position="top-right">
          <SearchPanel
            nodes={nodes}
            onNodeSelect={setSelectedNode}
            onNodeFocus={handleNodeFocus}
          />
          <Legend />
        </Panel>

        {/* Selected Node Info */}
        {selectedNodeData && (
          <Panel position="bottom-left">
            <NodeInfo data={selectedNodeData.data} />
          </Panel>
        )}

        {/* Empty State */}
        {nodes.length === 0 && (
          <EmptyState onAddPerson={() => setIsAddModalOpen(true)} />
        )}
      </ReactFlow>

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
        edges={edges}
        selectedNodeId={selectedNode}
        selectedNodeName={selectedNodeData?.data.name || ""}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeletePerson}
        title="Delete Person"
        message={`Are you sure you want to delete "${selectedNodeData?.data.name}"? This will also remove all their connections.`}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default function TreeBuilder() {
  return (
    <ReactFlowProvider>
      <TreeBuilderInner />
    </ReactFlowProvider>
  );
}
