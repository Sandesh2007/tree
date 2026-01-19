"use client";

import { User, Briefcase, Building2, Mail, Phone } from "lucide-react";
import { PersonData } from "../tree-builder/types";
import { levelConfig } from "../tree-builder/constants";

interface NodeInfoProps {
  data: PersonData;
}

export default function NodeInfo({ data }: NodeInfoProps) {
  const config = levelConfig[data.level];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4 min-w-[240px]">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
          <User size={14} className={config.color} />
        </div>
        <span className="text-sm font-semibold text-slate-900">
          Selected Person
        </span>
      </div>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium text-slate-900">{data.name}</p>
          <p className="text-xs text-slate-500">{data.role}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center gap-2">
            <Briefcase size={12} className="text-slate-400" />
            <span className={`text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>

          {data.department && (
            <div className="flex items-center gap-2">
              <Building2 size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">{data.department}</span>
            </div>
          )}

          {data.email && (
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">{data.email}</span>
            </div>
          )}

          {data.phone && (
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-slate-400" />
              <span className="text-xs text-slate-600">{data.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
