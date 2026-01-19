"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { levelConfig, relationConfig } from "../tree-builder/constants";

export default function Legend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-900">Legend</span>
        {isExpanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Levels */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Levels</p>
            <div className="space-y-1.5">
              {Object.entries(levelConfig).map(([level, config]) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${config.bgColor} ${config.borderColor} border`}
                  />
                  <span className="text-xs text-slate-600">{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relations */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Relations</p>
            <div className="space-y-1.5">
              {Object.entries(relationConfig).map(([relation, config]) => (
                <div key={relation} className="flex items-center gap-2">
                  <div
                    className="w-4 h-0.5 rounded"
                    style={{
                      backgroundColor: config.color,
                      borderStyle: config.dashed ? "dashed" : "solid",
                    }}
                  />
                  <span className="text-xs text-slate-600">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
