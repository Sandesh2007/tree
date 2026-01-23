"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import FormInput from "@/components/form/formInput";
import FormSelect from "@/components/form/formSelect";
import Button from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  PersonFormData,
  PersonData,
  CustomLevel,
  CustomRelation,
} from "@/types/types";
import { levelOptions, relationOptions } from "@/types/constants";
import axios from "axios";
import { toast } from "sonner";

interface AddPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PersonFormData;
  setFormData: (data: PersonFormData) => void;
  onSubmit: () => void;
  nodes: PersonData[];
  errors?: Record<string, string>;
  customLevels?: CustomLevel[];
  customRelations?: CustomRelation[];
}

export default function AddPersonDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  nodes,
  errors = {},
  customLevels = [],
  customRelations = [],
}: AddPersonDialogProps) {
  const [showNewLevel, setShowNewLevel] = useState(false);
  const [showNewRelation, setShowNewRelation] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const [newLevel, setNewLevel] = useState({
    value: "",
    label: "",
    color: "#374151",
    bgColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  });

  const [newRelation, setNewRelation] = useState({
    value: "",
    label: "",
    color: "#3b82f6",
    dashed: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleCreateLevel = async () => {
    if (!newLevel.value || !newLevel.label) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSavingConfig(true);
    try {
      const response = await axios.post("/api/config", {
        type: "level",
        data: newLevel,
      });

      if (response.data.success) {
        toast.success("Custom level created successfully");
        setFormData({ ...formData, level: newLevel.value as any });
        setShowNewLevel(false);
        setNewLevel({
          value: "",
          label: "",
          color: "#374151",
          bgColor: "#f3f4f6",
          borderColor: "#e5e7eb",
        });
        // Trigger parent to refetch configs
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to create custom level");
    } finally {
      setIsSavingConfig(false);
    }
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

  // Merge predefined and custom options
  const allLevelOptions = [
    ...levelOptions,
    ...customLevels.map((level) => ({
      value: level.value,
      label: level.label,
    })),
  ];

  const allRelationOptions = [
    ...relationOptions,
    ...customRelations.map((relation) => ({
      value: relation.value,
      label: relation.label,
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Person">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Full Name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          placeholder="Enter full name"
          required
        />

        <FormInput
          label="Role / Title"
          value={formData.role}
          onChange={(value) => setFormData({ ...formData, role: value })}
          placeholder="Enter job title"
          required
        />

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Level <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowNewLevel(!showNewLevel)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showNewLevel ? (
                <>
                  <X className="h-3 w-3" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  New Level
                </>
              )}
            </button>
          </div>

          {showNewLevel ? (
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <FormInput
                label="Value (ID)"
                value={newLevel.value}
                onChange={(value) =>
                  setNewLevel({
                    ...newLevel,
                    value: value.toLowerCase().replace(/\s+/g, "_"),
                  })
                }
                placeholder="e.g., senior_developer"
                required
              />
              <FormInput
                label="Label"
                value={newLevel.label}
                onChange={(value) => setNewLevel({ ...newLevel, label: value })}
                placeholder="e.g., Senior Developer"
                required
              />
              <div className="grid grid-cols-3 gap-2">
                <FormInput
                  label="Text Color"
                  type="color"
                  value={newLevel.color}
                  onChange={(value) =>
                    setNewLevel({ ...newLevel, color: value })
                  }
                />
                <FormInput
                  label="BG Color"
                  type="color"
                  value={newLevel.bgColor}
                  onChange={(value) =>
                    setNewLevel({ ...newLevel, bgColor: value })
                  }
                />
                <FormInput
                  label="Border"
                  type="color"
                  value={newLevel.borderColor}
                  onChange={(value) =>
                    setNewLevel({ ...newLevel, borderColor: value })
                  }
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateLevel}
                disabled={isSavingConfig || !newLevel.value || !newLevel.label}
                className="w-full"
              >
                {isSavingConfig ? "Creating..." : "Create Level"}
              </Button>
            </div>
          ) : (
            <FormSelect
              label=""
              value={formData.level}
              onChange={(value) =>
                setFormData({
                  ...formData,
                  level: value as PersonFormData["level"],
                })
              }
              options={allLevelOptions}
              required
            />
          )}
        </div>

        <FormInput
          label="Department"
          value={formData.department}
          onChange={(value) => setFormData({ ...formData, department: value })}
          placeholder="Enter department"
        />

        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          placeholder="Enter email address"
        />

        <FormInput
          label="Phone"
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          placeholder="Enter phone number"
        />

        {nodes.length > 0 && (
          <>
            <FormSelect
              label="Reports To"
              value={formData.parentId}
              onChange={(value) =>
                setFormData({ ...formData, parentId: value })
              }
              options={[
                { value: "", label: "None (Top Level)" },
                ...nodes.map((n) => ({ value: n.key, label: n.name })),
              ]}
            />

            {formData.parentId && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship Type
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
                    options={allRelationOptions}
                  />
                )}
              </div>
            )}
          </>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Person</Button>
        </div>
      </form>
    </Modal>
  );
}
