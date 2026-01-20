"use client";

import { useState, useCallback } from "react";

interface HistoryState {
  nodes: any[];
  edges: any[];
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pushState = useCallback(
    (nodes: any[], edges: any[]) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push({
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
        });
        return newHistory.slice(-50);
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
