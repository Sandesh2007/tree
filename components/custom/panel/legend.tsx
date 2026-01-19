"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { levelConfig, relationConfig } from "@/types/constants";

export default function Legend() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
      >
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          Legend
        </span>
        {isExpanded ? (
          <ChevronUp
            size={16}
            className="text-neutral-400 dark:text-neutral-500"
          />
        ) : (
          <ChevronDown
            size={16}
            className="text-neutral-400 dark:text-neutral-500"
          />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Levels */}
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Levels
            </p>
            <div className="space-y-1.5">
              {Object.entries(levelConfig).map(([level, config]) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${config.bgColor} ${config.borderColor} border dark:opacity-90`}
                  />
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    {config.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Relations */}
          <div>
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
              Relations
            </p>
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
                  <span className="text-xs text-neutral-600 dark:text-neutral-300">
                    {config.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
