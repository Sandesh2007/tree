"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { TreeNode } from "@/types/types";
import { levelConfig } from "@/types/constants";
import { cn } from "@/lib/utils";

interface SearchPanelProps {
  nodes: TreeNode[];
  onNodeSelect: (nodeId: string) => void;
  onNodeFocus: (nodeId: string) => void;
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
      node.data.name.toLowerCase().includes(query.toLowerCase()) ||
      node.data.role.toLowerCase().includes(query.toLowerCase()) ||
      node.data.department?.toLowerCase().includes(query.toLowerCase()),
  );

  const handleNodeClick = (nodeId: string) => {
    onNodeSelect(nodeId);
    onNodeFocus(nodeId);
    setQuery("");
    setIsExpanded(false);
  };

  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
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
          className="w-full pl-10 pr-10 py-3 text-sm bg-transparent focus:outline-none text-neutral-900 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsExpanded(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isExpanded && query && (
        <div className="border-t border-neutral-100 dark:border-neutral-700 max-h-64 overflow-y-auto">
          {filteredNodes.length === 0 ? (
            <div className="px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 text-center">
              No results found
            </div>
          ) : (
            filteredNodes.map((node) => {
              const config = levelConfig[node.data.level];
              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node.id)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors text-left"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold dark:opacity-90",
                      config.bgColor,
                      config.color,
                      "dark:brightness-125",
                    )}
                  >
                    {node.data.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-50 truncate">
                      {node.data.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {node.data.role}
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
