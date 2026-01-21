"use client";

import { useMemo } from "react";
import { AlertCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import FormSelect from "@/components/form/formSelect";
import Button from "@/components/ui/button";
import { PersonFormData, PersonData, LinkData } from "@/types/types";
import { relationOptions, relationConfig } from "@/types/constants";

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
}: AddRelationDialogProps) {
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
    if (!formData.parentId) return relationOptions;
    const usedRelations = existingRelations.get(formData.parentId) || new Set();
    return relationOptions.filter((opt) => !usedRelations.has(opt.value));
  }, [formData.parentId, existingRelations]);

  // Check if all relations are used
  const allRelationsUsed =
    formData.parentId && availableRelationTypes.length === 0;

  // Available nodes with relation count info
  const availableNodes = useMemo(() => {
    return nodes
      .filter((n) => n.key !== selectedNodeId)
      .map((n) => {
        const usedCount = existingRelations.get(n.key)?.size || 0;
        const allUsed = usedCount >= relationOptions.length;
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
  }, [nodes, selectedNodeId, existingRelations]);

  const handleParentChange = (value: string) => {
    const usedRelations = existingRelations.get(value) || new Set();
    const availableType = relationOptions.find(
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
                <FormSelect
                  label="Relationship Type"
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
                <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <p className="text-sm text-neutral-600">
                    <span className="font-medium">
                      {nodes.find((n) => n.key === formData.parentId)?.name}
                    </span>
                    <span
                      className="mx-2 px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${relationConfig[formData.relationType].color}20`,
                        color: relationConfig[formData.relationType].color,
                      }}
                    >
                      {relationConfig[formData.relationType].label}
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
