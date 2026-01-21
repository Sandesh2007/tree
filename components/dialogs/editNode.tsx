"use client";

import Modal from "@/components/ui/modal";
import FormInput from "@/components/form/formInput";
import FormSelect from "@/components/form/formSelect";
import Button from "@/components/ui/button";
import { PersonFormData } from "@/types/types";
import { levelOptions } from "@/types/constants";

interface EditPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formData: PersonFormData;
  setFormData: (data: PersonFormData) => void;
  onSubmit: () => void;
}

export default function EditPersonDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
}: EditPersonDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Person">
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

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
