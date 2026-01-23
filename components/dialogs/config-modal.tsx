"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2, Settings } from "lucide-react";
import { CustomLevel, CustomRelation } from "@/types/types";
import axios from "axios";
import { toast } from "sonner";
import Button from "../ui/button";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ConfigModal({
  isOpen,
  onClose,
  onUpdate,
}: ConfigModalProps) {
  const [activeTab, setActiveTab] = useState<"levels" | "relations">("levels");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Levels
  const [customLevels, setCustomLevels] = useState<CustomLevel[]>([]);
  const [newLevel, setNewLevel] = useState({
    value: "",
    label: "",
    color: "#374151",
    bgColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  });

  // Custom Relations
  const [customRelations, setCustomRelations] = useState<CustomRelation[]>([]);
  const [newRelation, setNewRelation] = useState({
    value: "",
    label: "",
    color: "#3b82f6",
    dashed: false,
  });

  // Fetch configurations when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchConfigurations();
    }
  }, [isOpen]);

  const fetchConfigurations = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/config");
      if (response.data.success) {
        setCustomLevels(response.data.data.customLevels || []);
        setCustomRelations(response.data.data.customRelations || []);
      }
    } catch (error) {
      toast.error("Failed to fetch configurations");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = async () => {
    if (!newLevel.value || !newLevel.label) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post("/api/config", {
        type: "level",
        data: newLevel,
      });

      if (response.data.success) {
        toast.success("Custom level created successfully");
        setNewLevel({
          value: "",
          label: "",
          color: "#374151",
          bgColor: "#f3f4f6",
          borderColor: "#e5e7eb",
        });
        fetchConfigurations();
        onUpdate?.();
      }
    } catch (error) {
      toast.error("Failed to create custom level");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom level?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/config?type=level&id=${id}`);
      if (response.data.success) {
        toast.success("Custom level deleted successfully");
        fetchConfigurations();
        onUpdate?.();
      }
    } catch (error) {
      toast.error("Failed to delete custom level");
      console.error(error);
    }
  };

  const handleAddRelation = async () => {
    if (!newRelation.value || !newRelation.label) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post("/api/config", {
        type: "relation",
        data: newRelation,
      });

      if (response.data.success) {
        toast.success("Custom relation created successfully");
        setNewRelation({
          value: "",
          label: "",
          color: "#3b82f6",
          dashed: false,
        });
        fetchConfigurations();
        onUpdate?.();
      }
    } catch (error) {
      toast.error("Failed to create custom relation");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRelation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom relation?")) {
      return;
    }

    try {
      const response = await axios.delete(`/api/config?type=relation&id=${id}`);
      if (response.data.success) {
        toast.success("Custom relation deleted successfully");
        fetchConfigurations();
        onUpdate?.();
      }
    } catch (error) {
      toast.error("Failed to delete custom relation");
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-800 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  Configuration Settings
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage custom levels and relations
                </p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("levels")}
              className={`flex-1 p-6 outline-0 rounded-none py-4 text-sm font-medium transition-colors ${
                activeTab === "levels"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Custom Levels ({customLevels.length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("relations")}
              className={`flex-1 p-4 text-sm rounded-none font-medium transition-colors ${
                activeTab === "relations"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Custom Relations ({customRelations.length})
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-150 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : activeTab === "levels" ? (
              <div className="space-y-6">
                {/* Add New Level Form */}
                <div className="bg-blue-50 dark:bg-neutral-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Custom Level
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Value (ID) *
                      </label>
                      <input
                        type="text"
                        value={newLevel.value}
                        onChange={(e) =>
                          setNewLevel({
                            ...newLevel,
                            value: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="e.g., senior_developer"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Label (Display Name) *
                      </label>
                      <input
                        type="text"
                        value={newLevel.label}
                        onChange={(e) =>
                          setNewLevel({ ...newLevel, label: e.target.value })
                        }
                        placeholder="e.g., Senior Developer"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Text Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newLevel.color}
                          onChange={(e) =>
                            setNewLevel({ ...newLevel, color: e.target.value })
                          }
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={newLevel.color}
                          onChange={(e) =>
                            setNewLevel({ ...newLevel, color: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newLevel.bgColor}
                          onChange={(e) =>
                            setNewLevel({
                              ...newLevel,
                              bgColor: e.target.value,
                            })
                          }
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={newLevel.bgColor}
                          onChange={(e) =>
                            setNewLevel({
                              ...newLevel,
                              bgColor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Border Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newLevel.borderColor}
                          onChange={(e) =>
                            setNewLevel({
                              ...newLevel,
                              borderColor: e.target.value,
                            })
                          }
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={newLevel.borderColor}
                          onChange={(e) =>
                            setNewLevel({
                              ...newLevel,
                              borderColor: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleAddLevel}
                        disabled={
                          isSaving || !newLevel.value || !newLevel.label
                        }
                        className="w-full px-6 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Add Level
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Preview */}
                  {newLevel.label && (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preview:
                      </p>
                      <span
                        className="inline-block px-3 py-1 text-sm font-medium rounded-full border"
                        style={{
                          color: newLevel.color,
                          backgroundColor: newLevel.bgColor,
                          borderColor: newLevel.borderColor,
                        }}
                      >
                        {newLevel.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Existing Levels */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Custom Levels
                  </h3>
                  {customLevels.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No custom levels yet. Create one above!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customLevels.map((level) => (
                        <div
                          key={level.id}
                          className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-neutral-600"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span
                                className="px-3 py-1 text-sm font-medium rounded-full border"
                                style={{
                                  color: level.color,
                                  backgroundColor: level.bgColor,
                                  borderColor: level.borderColor,
                                }}
                              >
                                {level.label}
                              </span>
                              <code className="text-sm text-neutral-600 dark:text-neutral-400">
                                {level.value}
                              </code>
                            </div>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Created:{" "}
                              {new Date(level.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteLevel(level.id)}
                            className="p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Add New Relation Form */}
                <div className="bg-green-50 dark:bg-neutral-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New Custom Relation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Value (ID) *
                      </label>
                      <input
                        type="text"
                        value={newRelation.value}
                        onChange={(e) =>
                          setNewRelation({
                            ...newRelation,
                            value: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="e.g., supervises"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Label (Display Name) *
                      </label>
                      <input
                        type="text"
                        value={newRelation.label}
                        onChange={(e) =>
                          setNewRelation({
                            ...newRelation,
                            label: e.target.value,
                          })
                        }
                        placeholder="e.g., Supervises"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Line Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newRelation.color}
                          onChange={(e) =>
                            setNewRelation({
                              ...newRelation,
                              color: e.target.value,
                            })
                          }
                          className="h-10 w-16 rounded border border-gray-300 dark:border-gray-600"
                        />
                        <input
                          type="text"
                          value={newRelation.color}
                          onChange={(e) =>
                            setNewRelation({
                              ...newRelation,
                              color: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Line Style
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newRelation.dashed}
                          onChange={(e) =>
                            setNewRelation({
                              ...newRelation,
                              dashed: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Dashed line
                        </span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <Button
                        onClick={handleAddRelation}
                        disabled={
                          isSaving || !newRelation.value || !newRelation.label
                        }
                        className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Add Relation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Preview */}
                  {newRelation.label && (
                    <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preview:
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-0.5 w-24"
                          style={{
                            borderTop: newRelation.dashed
                              ? `2px dashed ${newRelation.color}`
                              : "none",
                            backgroundColor: newRelation.dashed
                              ? "transparent"
                              : newRelation.color,
                          }}
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {newRelation.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Existing Relations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Your Custom Relations
                  </h3>
                  {customRelations.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No custom relations yet. Create one above!
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customRelations.map((relation) => (
                        <div
                          key={relation.id}
                          className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-0.5 w-16"
                                  style={{
                                    borderTop: relation.dashed
                                      ? `2px dashed ${relation.color}`
                                      : "none",
                                    backgroundColor: relation.dashed
                                      ? "transparent"
                                      : relation.color,
                                  }}
                                />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {relation.label}
                                </span>
                              </div>
                              <code className="text-sm text-gray-600 dark:text-gray-400">
                                {relation.value}
                              </code>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Created:{" "}
                              {new Date(
                                relation.createdAt,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => handleDeleteRelation(relation.id)}
                            className="p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
