"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Users,
  Network,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Grid3x3,
  List,
  Layers,
  Calendar,
  Globe,
  Lock,
  Settings,
} from "lucide-react";
import { PersonData, NodeLevel } from "@/types/types";
import NodeModal, { type NodeFormData } from "@/components/dialogs/node-modal";
import ConfigModal from "@/components/dialogs/config-modal";
import { generateCanvasId } from "@/lib/utils";
import Button from "@/components/ui/button";

interface NodeWithConnections extends PersonData {
  connections?: number;
  createdAt?: string;
}

interface CanvasData {
  canvasId: string;
  name?: string;
  nodeCount: number;
  linkCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<NodeWithConnections[]>([]);
  const [connectedNodes, setConnectedNodes] = useState<NodeWithConnections[]>(
    [],
  );
  const [canvases, setCanvases] = useState<CanvasData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<NodeLevel | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<
    "my-nodes" | "connections" | "my-canvases"
  >("my-nodes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeFormData | undefined>(
    undefined,
  );
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, canvasesResponse] = await Promise.all([
        axios.get("/api/dashboard"),
        axios.get("/api/canvases"),
      ]);

      if (dashboardResponse.data.success) {
        setNodes(dashboardResponse.data.data.userNodes || []);
        setConnectedNodes(dashboardResponse.data.data.connectedNodes || []);
      }

      if (canvasesResponse.data.success) {
        setCanvases(canvasesResponse.data.canvases || []);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Please login again");
        router.push("/login");
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateNode = () => {
    setEditingNode(undefined);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleCreateCanvas = () => {
    const canvasId = generateCanvasId();
    router.push(`/canvas?id=${canvasId}`);
  };

  const handleRenameCanvas = async (canvasId: string, newName: string) => {
    if (!newName.trim()) {
      toast.error("Canvas name cannot be empty");
      return;
    }

    try {
      const response = await axios.put("/api/canvases", {
        canvasId,
        name: newName.trim(),
      });

      if (response.data.success) {
        toast.success("Canvas renamed successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to rename canvas");
      console.error("Error while renaming canvas", error);
    }
  };

  const handleDeleteCanvas = async (canvasId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this canvas? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`/api/canvases?canvasId=${canvasId}`);

      if (response.data.success) {
        toast.success("Canvas deleted successfully");
        fetchDashboardData();
      }
    } catch (error) {
      toast.error("Failed to delete canvas");
      console.error("Error while deleting canvas", error);
    }
  };

  const handleEditNode = (nodeKey: string) => {
    const node = nodes.find((n) => n.key === nodeKey);
    if (node) {
      setEditingNode({
        key: node.key,
        name: node.name,
        role: node.role,
        department: node.department || "",
        email: node.email || "",
        phone: node.phone || "",
        level: node.level,
      });
      setModalMode("edit");
      setIsModalOpen(true);
    }
  };
  const statsCards = [
    {
      id: "total-nodes",
      label: "Total Nodes",
      value: nodes.length,
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-300",
      cardBg:
        "bg-neutral-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700",
    },
    {
      id: "connections",
      label: "Connections",
      value: connectedNodes.length,
      icon: Network,
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-300",
      cardBg:
        "bg-neutral-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700",
    },
    {
      id: "canvases",
      label: "My Canvases",
      value: canvases.length,
      icon: Layers,
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-300",
      cardBg:
        "bg-neutral-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700",
    },
    {
      id: "add-node",
      label: "Create New",
      title: "Node",
      icon: Plus,
      cardBg:
        "bg-neutral-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700",
      onClick: handleCreateNode,
    },
    {
      id: "add-canvas",
      label: "Create New",
      title: "Canvas",
      icon: Plus,
      cardBg:
        "bg-neutral-50 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700",
      onClick: handleCreateCanvas,
    },
  ];

  const handleSaveNode = async (nodeData: NodeFormData) => {
    try {
      if (modalMode === "create") {
        const response = await axios.post("/api/dashboard", nodeData);
        if (response.data.success) {
          toast.success("Node created successfully");
          fetchDashboardData();
        }
      } else {
        const response = await axios.put("/api/dashboard", nodeData);
        if (response.data.success) {
          toast.success("Node updated successfully");
          fetchDashboardData();
        }
      }
    } catch (error) {
      toast.error(
        `Failed to ${modalMode === "create" ? "create" : "update"} node`,
      );
      throw error;
    }
  };

  const handleViewNode = (nodeKey: string) => {
    router.push(`/canvas?node=${nodeKey}`);
  };

  const handleDeleteNode = async (nodeKey: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this node? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await axios.delete(`/api/dashboard?nodeKey=${nodeKey}`);
      if (response.data.success) {
        toast.success("Node deleted successfully");
        // Refresh the data
        fetchDashboardData();
      }
    } catch {
      toast.error("Failed to delete node");
    }
  };

  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === "all" || node.level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const filteredConnections = connectedNodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredCanvases = canvases.filter((canvas) => {
    const matchesSearch = canvas.canvasId
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getLevelColor = (level: NodeLevel) => {
    switch (level) {
      case "executive":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "lead":
        return "bg-green-100 text-green-800 border-green-200";
      case "member":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLevelBadge = (level: NodeLevel) => {
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(level)}`}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const displayNodes =
    activeTab === "my-nodes"
      ? filteredNodes
      : activeTab === "connections"
        ? filteredConnections
        : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-neutrals-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your organization tree and connections
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center text-neutral-900 dark:text-white gap-2 px-4 py-2 transition-all shadow-lg hover:shadow-xl"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`${card.cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.label}
                    </p>
                    {card.title && (
                      <p className="text-2xl font-bold text-neutral-600 dark:text-neutral-50">
                        {card.title}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {card.value}
                    </p>
                  </div>
                  {card.onClick ? (
                    <Button onClick={card.onClick}>
                      <Icon className={`h-8 w-8 ${card.iconColor}`} />
                    </Button>
                  ) : (
                    <div className={`${card.iconBg} p-3 rounded-lg`}>
                      <Icon className={`h-8 w-8 ${card.iconColor}`} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("my-nodes")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "my-nodes"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Users className="inline-block w-4 h-4 mr-2" />
              My Nodes ({nodes.length})
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "connections"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Network className="inline-block w-4 h-4 mr-2" />
              Connected Nodes ({connectedNodes.length})
            </button>
            <button
              onClick={() => setActiveTab("my-canvases")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "my-canvases"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Layers className="inline-block w-4 h-4 mr-2" />
              My Canvases ({canvases.length})
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={
                  activeTab === "my-canvases"
                    ? "Search canvases..."
                    : "Search nodes..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
              />
            </div>

            {/* Filter */}
            {activeTab === "my-nodes" && (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={filterLevel}
                  onChange={(e) =>
                    setFilterLevel(e.target.value as NodeLevel | "all")
                  }
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Levels</option>
                  <option value="executive">Executive</option>
                  <option value="manager">Manager</option>
                  <option value="lead">Lead</option>
                  <option value="member">Member</option>
                </select>
              </div>
            )}

            {/* View Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-200 dark:bg-neutral-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Display */}
        {activeTab === "my-canvases" ? (
          filteredCanvases.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No canvases found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? "Try adjusting your search"
                  : "Get started by creating your first canvas"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateCanvas}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Canvas
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCanvases.map((canvas) => (
                <div
                  key={canvas.canvasId}
                  className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        router.push(`/canvas?id=${canvas.canvasId}`)
                      }
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {canvas.name || `Canvas ${canvas.canvasId}`}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        ID: {canvas.canvasId}
                      </p>
                    </div>
                    {canvas.isPublic ? (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200 flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Public
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Private
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Nodes:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {canvas.nodeCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Links:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {canvas.linkCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Updated{" "}
                        {new Date(canvas.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/canvas?id=${canvas.canvasId}`);
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-neutral-50 text-neutral-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt(
                          "Enter new canvas name:",
                          canvas.name || `Canvas ${canvas.canvasId}`,
                        );
                        if (newName !== null) {
                          handleRenameCanvas(canvas.canvasId, newName);
                        }
                      }}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-neutral-50 dark:bg-neutral-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Rename
                    </Button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCanvas(canvas.canvasId);
                      }}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : displayNodes.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No nodes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Get started by creating your first node"}
            </p>
            {!searchQuery && activeTab === "my-nodes" && (
              <button
                onClick={handleCreateNode}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Node
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNodes.map((node) => (
              <div
                key={node.key}
                className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {node.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {node.role}
                    </p>
                  </div>
                  {getLevelBadge(node.level)}
                </div>

                <div className="space-y-2 mb-4">
                  {node.department && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Department:</span>{" "}
                      {node.department}
                    </p>
                  )}
                  {node.email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Email:</span> {node.email}
                    </p>
                  )}
                  {node.connections !== undefined && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Connections:</span>{" "}
                      {node.connections}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleViewNode(node.key)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors text-sm font-medium"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  {activeTab === "my-nodes" && (
                    <>
                      <button
                        onClick={() => handleEditNode(node.key)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors text-sm font-medium"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNode(node.key)}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Connections
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayNodes.map((node) => (
                  <tr
                    key={node.key}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {node.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {node.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {node.role}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {node.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getLevelBadge(node.level)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {node.connections || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleViewNode(node.key)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {activeTab === "my-nodes" && (
                          <>
                            <button
                              onClick={() => handleEditNode(node.key)}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteNode(node.key)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
        nodeData={editingNode}
        mode={modalMode}
      />

      {/* Config Modal */}
      <ConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onUpdate={() => {
          // Refresh dashboard data if needed
          fetchDashboardData();
        }}
      />
    </div>
  );
}
