"use client";

import { getBezierPath, BaseEdge, EdgeLabelRenderer } from "@xyflow/react";
import { relationConfig } from "../tree-builder/constants";
import { RelationType } from "../tree-builder/types";

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationType = (data?.relationType as RelationType) || "reports_to";
  const config = relationConfig[relationType];

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: config.color,
          strokeWidth: 2,
          strokeDasharray: config.dashed ? "6,4" : "0",
        }}
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            }}
            className="px-2 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-600 shadow-sm pointer-events-none"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
