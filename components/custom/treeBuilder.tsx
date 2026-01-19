"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
} from "@xyflow/react";
import type { OnNodesChange, OnEdgesChange } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import PersonNode from "./tree-builder/person-node";
import CustomEdge from "./tree-builder/custom-edge";
import Toolbar from "./panel/toolbar";
import Legend from "./panel/legend";
import NodeInfo from "./panel/node-info";
import AddPersonDialog from "./dialogs/addNode";
import EditPersonDialog from "./dialogs/editNode";
import AddRelationDialog from "./dialogs/addRelation";
import EmptyState from "./tree-builder/emptyState";

import {
  TreeNode,
  TreeEdge,
  PersonFormData,
  RelationType,
} from "./tree-builder/types";
import { relationConfig, levelConfig } from "./tree-builder/constants";

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

  const [formData, setFormData] = useState<PersonFormData>(initialFormData);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const nodeTypes = useMemo(() => ({ person: PersonNode }), []);
  const edgeTypes = useMemo(() => ({ custom: CustomEdge }), []);

  const onNodesChange: OnNodesChange<TreeNode> = useCallback((changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, []);

  const onEdgesChange: OnEdgesChange<TreeEdge> = useCallback((changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onConnect = useCallback((params: any) => {
    const newEdge: TreeEdge = {
      ...params,
      id: `e-${params.source}-${params.target}-${Date.now()}`,
      type: "custom",
      data: { relationType: "manages" as RelationType },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: relationConfig.manages.color,
      },
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const resetForm = () => setFormData(initialFormData);

  const handleAddPerson = () => {
    if (!formData.name || !formData.role) return;

    const newId = `node-${Date.now()}`;
    const parentNode = nodes.find((n) => n.id === formData.parentId);

    const newNode: TreeNode = {
      id: newId,
      type: "person",
      position: {
        x: parentNode ? parentNode.position.x + 50 : 100 + nodes.length * 50,
        y: parentNode ? parentNode.position.y + 200 : 100,
      },
      data: {
        name: formData.name,
        role: formData.role,
        department: formData.department || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
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

    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditPerson = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              data: {
                ...node.data,
                name: formData.name || node.data.name,
                role: formData.role || node.data.role,
                department: formData.department || node.data.department,
                email: formData.email || node.data.email,
                phone: formData.phone || node.data.phone,
                level: formData.level || node.data.level,
              },
            }
          : node,
      ),
    );

    resetForm();
    setIsEditModalOpen(false);
  };

  const handleDeletePerson = () => {
    if (!selectedNode) return;

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode));
    setEdges((eds) =>
      eds.filter(
        (edge) => edge.source !== selectedNode && edge.target !== selectedNode,
      ),
    );
    setSelectedNode(null);
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
    resetForm();
    setIsRelationModalOpen(false);
  };

  const handleExport = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tree-data.json";
    a.click();
    URL.revokeObjectURL(url);
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
          }
        } catch (error) {
          console.error("Error parsing file:", error);
        }
      };
      reader.readAsText(file);
    }
    e.target.value = "";
  };

  const selectedNodeData = nodes.find((n) => n.id === selectedNode);

  return (
    <div className="w-screen h-screen bg-neutral-50 dark:bg-neutral-800">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-slate-50"
      >
        <Background color="#e2e8f0" gap={24} size={1} />
        <Controls className="bg-white border border-slate-200 rounded-xl shadow-lg" />
        <MiniMap
          nodeColor={(node) =>
            levelConfig[
              node.data?.level as keyof typeof levelConfig
            ]?.borderColor?.replace("border-", "") || "#94a3b8"
          }
          maskColor="rgba(0,0,0,0.08)"
          className="bg-white border border-slate-200 rounded-xl shadow-lg"
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <Toolbar
            hasSelection={!!selectedNode}
            onAddPerson={() => setIsAddModalOpen(true)}
            onEditPerson={openEditModal}
            onAddRelation={() => setIsRelationModalOpen(true)}
            onDeletePerson={handleDeletePerson}
            onExport={handleExport}
            onImport={handleImport}
          />
        </Panel>

        <Panel position="top-right">
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
        selectedNodeId={selectedNode}
        selectedNodeName={selectedNodeData?.data.name || ""}
      />
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
