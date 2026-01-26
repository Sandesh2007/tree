"use client";

import { X } from "lucide-react";
import Button from "@/components/ui/button";
import { RelationType } from "@/types/types";
import { relationConfig } from "@/types/constants";
import { CustomRelation } from "@/types/types";

interface LinkRelationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (relationType: RelationType) => void;
  fromNodeName: string;
  toNodeName: string;
  customRelations?: CustomRelation[];
}

export default function LinkRelationDialog({
  isOpen,
  onClose,
  onSubmit,
  fromNodeName,
  toNodeName,
  customRelations = [],
}: LinkRelationDialogProps) {
  if (!isOpen) return null;

  const allRelations = [
    ...Object.entries(relationConfig).map(([key, config]) => ({
      key: key as RelationType,
      label: config.label,
      color: config.color,
    })),
    ...customRelations.map((r) => ({
      key: r.key as RelationType,
      label: r.label,
      color: r.color,
    })),
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl w-full h-fit max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Create Connection
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Choose the relationship type between:
          </p>

          <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-xl">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-1">
                <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  {fromNodeName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate block max-w-20">
                {fromNodeName}
              </span>
            </div>

            <div className="flex-1 border-t-2 border-dashed border-neutral-300 dark:border-neutral-600 relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900 px-2">
                →
              </span>
            </div>

            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-1">
                <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                  {toNodeName.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate block max-w-20">
                {toNodeName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Relationship Type
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-full overflow-y-auto">
              {allRelations.map((relation) => (
                <Button
                  variant="ghost"
                  key={relation.key}
                  onClick={() => onSubmit(relation.key)}
                  className="flex items-center gap-3 p-3 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-left group"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: relation.color }}
                  />
                  <div className="flex-1">
                    <span className="font-medium text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {relation.label}
                    </span>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {fromNodeName} {relation.label.toLowerCase()} {toNodeName}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
