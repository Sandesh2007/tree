"use client";

// save history
import { useState, useCallback } from "react";
import { TreeNode, TreeEdge } from "@/types/types";

interface HistoryState {
  nodes: TreeNode[];
  edges: TreeEdge[];
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pushState = useCallback(
    (nodes: TreeNode[], edges: TreeEdge[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        });
        return newHistory.slice(-50); // Keep last 50 states
      });
      setCurrentIndex((prev) => Math.min(prev + 1, 49));
    },
    [currentIndex],
  );

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  return {
    pushState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}
