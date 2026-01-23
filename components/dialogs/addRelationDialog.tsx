"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import Modal from "@/components/ui/modal";
import FormSelect from "@/components/form/formSelect";
import FormInput from "@/components/form/formInput";
import Button from "@/components/ui/button";
import {
  PersonFormData,
  PersonData,
  LinkData,
  CustomRelation,
} from "@/types/types";
import { relationOptions, relationConfig } from "@/types/constants";
import axios from "axios";
import { toast } from "sonner";

interface AddRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PersonFormData;
  setFormData: (data: PersonFormData) => void;
  onSubmit: () => void;
  nodes: PersonData[];
  links: LinkData[];
  selectedNodeId: string | null;
  selectedNodeName: string;
  errors?: Record<string, string>;
  customRelations?: CustomRelation[];
}

export default function AddRelationDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  nodes,
  links,
  selectedNodeId,
  selectedNodeName,
  errors = {},
  customRelations = [],
}: AddRelationDialogProps) {
  const [showNewRelation, setShowNewRelation] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [newRelation, setNewRelation] = useState({
    value: "",
    label: "",
    color: "#3b82f6",
    dashed: false,
  });

  // Merge predefined and custom relation options
  const allRelationOptions = useMemo(() => {
    return [
      ...relationOptions,
      ...customRelations.map((relation) => ({
        value: relation.value,
        label: relation.label,
      })),
    ];
  }, [customRelations]);

  // Merge predefined and custom relation configs
  const allRelationConfigs = useMemo(() => {
    const configs: Record<
      string,
      { color: string; label: string; dashed: boolean }
    > = { ...relationConfig };
    customRelations.forEach((relation) => {
      configs[relation.value] = {
        color: relation.color,
        label: relation.label,
        dashed: relation.dashed,
      };
    });
    return configs;
  }, [customRelations]);

  // Find existing relations for the selected node
  const existingRelations = useMemo(() => {
    if (!selectedNodeId) return new Map<string, Set<string>>();
    const relations = new Map<string, Set<string>>();

    links.forEach((link) => {
      const otherNodeId =
        link.from === selectedNodeId
          ? link.to
          : link.to === selectedNodeId
            ? link.from
            : null;
      if (otherNodeId) {
        if (!relations.has(otherNodeId)) relations.set(otherNodeId, new Set());
        relations.get(otherNodeId)!.add(link.relationType);
      }
    });
    return relations;
  }, [links, selectedNodeId]);

  // Get available relation types for selected parent
  const availableRelationTypes = useMemo(() => {
    if (!formData.parentId) return allRelationOptions;
    const usedRelations = existingRelations.get(formData.parentId) || new Set();
    return allRelationOptions.filter((opt) => !usedRelations.has(opt.value));
  }, [formData.parentId, existingRelations, allRelationOptions]);

  // Check if all relations are used
  const allRelationsUsed =
    formData.parentId && availableRelationTypes.length === 0;

  // Available nodes with relation count info
  const availableNodes = useMemo(() => {
    return nodes
      .filter((n) => n.key !== selectedNodeId)
      .map((n) => {
        const usedCount = existingRelations.get(n.key)?.size || 0;
        const allUsed = usedCount >= allRelationOptions.length;
        return {
          value: n.key,
          label: allUsed
            ? `${n.name} (all relations used)`
            : usedCount > 0
              ? `${n.name} (${usedCount} existing)`
              : n.name,
          disabled: allUsed,
        };
      });
  }, [nodes, selectedNodeId, existingRelations, allRelationOptions]);

  const handleParentChange = (value: string) => {
    const usedRelations = existingRelations.get(value) || new Set();
    const availableType = allRelationOptions.find(
      (opt) => !usedRelations.has(opt.value),
    );
    setFormData({
      ...formData,
      parentId: value,
      relationType:
        (availableType?.value as PersonFormData["relationType"]) ||
        "reports_to",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRelationsUsed) onSubmit();
  };

  const handleCreateRelation = async () => {
    if (!newRelation.value || !newRelation.label) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSavingConfig(true);
    try {
      const response = await axios.post("/api/config", {
        type: "relation",
        data: newRelation,
      });

      if (response.data.success) {
        toast.success("Custom relation created successfully");
        setFormData({ ...formData, relationType: newRelation.value as any });
        setShowNewRelation(false);
        setNewRelation({
          value: "",
          label: "",
          color: "#3b82f6",
          dashed: false,
        });
        // Trigger parent to refetch configs
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to create custom relation");
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Get current relation config
  const currentRelationConfig = allRelationConfigs[formData.relationType] || {
    color: "#6366f1",
    label: formData.relationType,
    dashed: false,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Connect "${selectedNodeName}"`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSelect
          label="Connect From"
          value={formData.parentId}
          onChange={handleParentChange}
          options={[
            { value: "", label: "Select a person..." },
            ...availableNodes,
          ]}
          required
        />

        {formData.parentId && (
          <>
            {allRelationsUsed ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertCircle size={16} className="text-amber-500" />
                <p className="text-sm text-amber-700">
                  All relation types already exist between these people.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Relationship Type <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewRelation(!showNewRelation)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showNewRelation ? (
                        <>
                          <X className="h-3 w-3" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3" />
                          New Relation
                        </>
                      )}
                    </button>
                  </div>

                  {showNewRelation ? (
                    <div className="space-y-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <FormInput
                        label="Value (ID)"
                        value={newRelation.value}
                        onChange={(value) =>
                          setNewRelation({
                            ...newRelation,
                            value: value.toLowerCase().replace(/\s+/g, "_"),
                          })
                        }
                        placeholder="e.g., supervises"
                        required
                      />
                      <FormInput
                        label="Label"
                        value={newRelation.label}
                        onChange={(value) =>
                          setNewRelation({ ...newRelation, label: value })
                        }
                        placeholder="e.g., Supervises"
                        required
                      />
                      <FormInput
                        label="Line Color"
                        type="color"
                        value={newRelation.color}
                        onChange={(value) =>
                          setNewRelation({ ...newRelation, color: value })
                        }
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRelation.dashed}
                          onChange={(e) =>
                            setNewRelation({
                              ...newRelation,
                              dashed: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Dashed line
                        </span>
                      </label>
                      <Button
                        type="button"
                        onClick={handleCreateRelation}
                        disabled={
                          isSavingConfig ||
                          !newRelation.value ||
                          !newRelation.label
                        }
                        className="w-full"
                      >
                        {isSavingConfig ? "Creating..." : "Create Relation"}
                      </Button>
                    </div>
                  ) : (
                    <FormSelect
                      label=""
                      value={formData.relationType}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          relationType: value as PersonFormData["relationType"],
                        })
                      }
                      options={availableRelationTypes}
                      required
                    />
                  )}
                </div>
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">
                      {nodes.find((n) => n.key === formData.parentId)?.name}
                    </span>
                    <span
                      className="mx-2 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${currentRelationConfig.color}20`,
                        color: currentRelationConfig.color,
                      }}
                    >
                      {currentRelationConfig.label}
                    </span>
                    <span className="font-medium">{selectedNodeName}</span>
                  </p>
                </div>
              </>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!formData.parentId || !!allRelationsUsed}
          >
            Add Connection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
