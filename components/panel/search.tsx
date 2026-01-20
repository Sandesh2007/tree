"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { PersonData } from "@/types/types";
import { levelConfig } from "@/types/constants";
import { cn } from "@/lib/utils";

interface SearchPanelProps {
  nodes: PersonData[];
  onNodeSelect: (key: string) => void;
  onNodeFocus: (key: string) => void;
}

export default function SearchPanel({
  nodes,
  onNodeSelect,
  onNodeFocus,
}: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredNodes = nodes.filter(
    (node) =>
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.role.toLowerCase().includes(query.toLowerCase()) ||
      node.department?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleNodeClick = (key: string) => {
    onNodeSelect(key);
    onNodeFocus(key);
    setQuery("");
    setIsExpanded(false);
  };

  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-2">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsExpanded(true);
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder="Search people..."
          className="w-full pl-10 pr-10 py-3 text-sm bg-transparent focus:outline-none dark:text-white"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsExpanded(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isExpanded && query && (
        <div className="border-t border-neutral-100 dark:border-neutral-700 max-h-64 overflow-y-auto">
          {filteredNodes.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500 text-center">
              No results found
            </div>
          ) : (
            filteredNodes.map((node) => {
              const config = levelConfig[node.level];
              return (
                <button
                  key={node.key}
                  onClick={() => handleNodeClick(node.key)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                      config.bgColor,
                      config.color,
                    )}
                  >
                    {node.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                      {node.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {node.role}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
