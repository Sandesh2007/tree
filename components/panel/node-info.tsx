"use client";

import { User, Building2, Mail, Phone, X } from "lucide-react";
import { PersonData } from "@/types/types";
import { levelConfig } from "@/types/constants";
import { cn } from "@/lib/utils";

interface NodeInfoProps {
  data: PersonData;
  onClose?: () => void;
}

export default function NodeInfo({ data, onClose }: NodeInfoProps) {
  const config = levelConfig[data.level];

  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 min-w-60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
            <User size={14} className={config.color} />
          </div>
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            Selected
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-xs text-neutral-500">{data.role}</p>
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", config.bgColor)} />
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {config.label}
            </span>
          </div>

          {data.department && (
            <div className="flex items-center gap-2">
              <Building2 size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {data.department}
              </span>
            </div>
          )}

          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {data.email}
              </span>
            </div>
          )}

          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-600 dark:text-neutral-400">
                {data.phone}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
