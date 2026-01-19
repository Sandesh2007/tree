"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import { relationConfig } from "@/types/constants";
import { RelationType } from "@/types/types";

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
}: any) {
  const relationType = (data?.relationType as RelationType) || "reports_to";
  const config = relationConfig[relationType];

  // Calculate offset for multiple edges between same nodes
  const edgeIndex = data?.edgeIndex || 0;
  const totalEdges = data?.totalEdges || 1;
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
            className="px-2 py-1 rounded-md text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm"
          >
            <span style={{ color: config.color }}>{data.label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
