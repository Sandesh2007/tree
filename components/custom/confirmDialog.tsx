"use client";

import { AlertTriangle } from "lucide-react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle size={32} className="text-red-500 dark:text-red-400" />
        </div>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
