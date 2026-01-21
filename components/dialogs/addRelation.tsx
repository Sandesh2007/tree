"use client";

import Modal from "@/components/ui/modal";
import FormSelect from "@/components/form/formSelect";
import Button from "@/components/ui/button";
import { PersonFormData, PersonData } from "@/types/types";
import { relationOptions } from "@/types/constants";

interface AddRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PersonFormData;
  setFormData: (data: PersonFormData) => void;
  onSubmit: () => void;
  nodes: PersonData[];
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
  selectedNodeId,
  selectedNodeName,
}: AddRelationDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const availableNodes = nodes.filter((n) => n.key !== selectedNodeId);

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
          onChange={(value) => setFormData({ ...formData, parentId: value })}
          options={[
            { value: "", label: "Select a person..." },
            ...availableNodes.map((n) => ({ value: n.key, label: n.name })),
          ]}
          required
          placeholder="Select a person..."
        />

        <FormSelect
          label="Relationship Type"
          value={formData.relationType}
          onChange={(value) =>
            setFormData({
              ...formData,
              relationType: value as PersonFormData["relationType"],
            })
          }
          options={relationOptions}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!formData.parentId}>
            Add Connection
          </Button>
        </div>
      </form>
    </Modal>
  );
}
