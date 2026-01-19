"use client";

import { User, Briefcase, Building2, Mail, Phone } from "lucide-react";
import { PersonData } from "../../../types/types";
import { levelConfig } from "@/types/constants";

interface NodeInfoProps {
  data: PersonData;
}

export default function NodeInfo({ data }: NodeInfoProps) {
  const config = levelConfig[data.level];

  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-4 min-w-60">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${config.bgColor} dark:opacity-90`}>
          <User size={14} className={`${config.color} dark:brightness-125`} />
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Selected Person
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
            {data.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {data.role}
          </p>
        </div>

        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-700 space-y-1.5">
          <div className="flex items-center gap-2">
            <Briefcase
              size={12}
              className="text-neutral-400 dark:text-neutral-500"
            />
            <span
              className={`text-xs font-medium ${config.color} dark:brightness-125`}
            >
              {config.label}
            </span>
          </div>

          {data.department && (
            <div className="flex items-center gap-2">
              <Building2
                size={12}
                className="text-neutral-400 dark:text-neutral-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                {data.department}
              </span>
            </div>
          )}

          {data.email && (
            <div className="flex items-center gap-2">
              <Mail
                size={12}
                className="text-neutral-400 dark:text-neutral-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                {data.email}
              </span>
            </div>
          )}

          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone
                size={12}
                className="text-neutral-400 dark:text-neutral-500"
              />
              <span className="text-xs text-neutral-600 dark:text-neutral-300">
                {data.phone}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
