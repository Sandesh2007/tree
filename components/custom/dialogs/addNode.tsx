"use client";

import Modal from "@/components/ui/modal";
import FormInput from "@/components/custom/form/form-input";
import FormSelect from "@/components/custom/form/form-select";
import Button from "@/components/ui/button";
import {
  PersonFormData,
  TreeNode,
} from "@/components/custom/tree-builder/types";
import {
  levelOptions,
  relationOptions,
} from "@/components/custom/tree-builder/constants";

interface AddNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PersonFormData;
  setFormData: (data: PersonFormData) => void;
  onSubmit: () => void;
  nodes: TreeNode[];
}

export default function AddNodeDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  nodes,
}: AddNodeDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

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

        <FormSelect
          label="Level"
          value={formData.level}
          onChange={(value) =>
            setFormData({
              ...formData,
              level: value as PersonFormData["level"],
            })
          }
          options={levelOptions}
          required
        />

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
                ...nodes.map((n) => ({ value: n.id, label: n.data.name })),
              ]}
            />

            {formData.parentId && (
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
              />
            )}
          </>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Person</Button>
        </div>
      </form>
    </Modal>
  );
}
