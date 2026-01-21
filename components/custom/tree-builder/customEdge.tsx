"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  Position,
} from "@xyflow/react";
import { relationConfig } from "@/types/constants";
import { RelationType } from "@/types/types";

interface CustomEdgeData {
  relationType?: RelationType;
  label?: string;
  edgeIndex?: number;
  totalEdges?: number;
}

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
  data?: CustomEdgeData;
  markerEnd?: string;
  selected?: boolean;
}

export default function CustomEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}: CustomEdgeProps) {
  const relationType = (data?.relationType as RelationType) || "reports_to";
  const config = relationConfig[relationType];

  // Calculate offset for multiple edges between same nodes
  const edgeIndex = data?.edgeIndex || 0;
  const totalEdges = data?.totalEdges || 1;

  // Calculate offset - spread edges apart
  const offsetMultiplier = 50;
  const baseOffset = (edgeIndex - (totalEdges - 1) / 2) * offsetMultiplier;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: sourceX + baseOffset,
    sourceY,
    sourcePosition,
    targetX: targetX + baseOffset,
    targetY,
    targetPosition,
    borderRadius: 16,
    offset: 30,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: config.color,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: config.dashed ? "6,4" : "0",
          transition: "stroke-width 0.2s",
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
            }}
            className={`px-2 py-1 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 border shadow-sm transition-all ${
              selected
                ? "border-neutral-400 dark:border-neutral-500 shadow-md"
                : "border-neutral-200 dark:border-neutral-700"
            }`}
          >
            <span style={{ color: config.color }}>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
