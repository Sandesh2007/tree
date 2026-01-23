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
} from "lucide-react";
import { PersonData, NodeLevel } from "@/types/types";
import NodeModal, { type NodeFormData } from "@/components/dialogs/node-modal";
import { generateCanvasId } from "@/lib/utils";

interface NodeWithConnections extends PersonData {
  connections?: number;
  createdAt?: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<NodeWithConnections[]>([]);
  const [connectedNodes, setConnectedNodes] = useState<NodeWithConnections[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<NodeLevel | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"my-nodes" | "connections">(
    "my-nodes",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<NodeFormData | undefined>(
    undefined,
  );
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("/api/dashboard");
      if (response.data.success) {
        setNodes(response.data.data.userNodes || []);
        setConnectedNodes(response.data.data.connectedNodes || []);
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
      node.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.department?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterLevel === "all" || node.level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  const filteredConnections = connectedNodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.role.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
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
    activeTab === "my-nodes" ? filteredNodes : filteredConnections;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your organization tree and connections
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Nodes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {nodes.length}
                </p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Connections
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {connectedNodes.length}
                </p>
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <Network className="h-8 w-8 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={handleCreateNode}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90">Create New</p>
                <p className="text-2xl font-bold mt-2">Add Node</p>
              </div>
              <div className="bg-neutral-800 bg-opacity-20 p-3 rounded-lg">
                <Plus className="h-8 w-8" />
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
            onClick={handleCreateCanvas}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90">Create New</p>
                <p className="text-2xl font-bold mt-2">Canvas</p>
              </div>
              <div className="bg-neutral-800 bg-opacity-20 p-3 rounded-lg">
                <Network className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
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
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none cursor-pointer"
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
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nodes Display */}
        {displayNodes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
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
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
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
                  <th
                    className="px-6 py-3 text-left
 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
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
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Node Modal */}
      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNode}
        nodeData={editingNode}
        mode={modalMode}
      />
    </div>
  );
}
