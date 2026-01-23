"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";

const levelColors: Record<
  string,
  { bg: string; border: string; text: string; badge: string }
> = {
  executive: {
    bg: "#f5f3ff",
    border: "#8b5cf6",
    text: "#5b21b6",
    badge: "#8b5cf6",
  },
  manager: {
    bg: "#eff6ff",
    border: "#3b82f6",
    text: "#1d4ed8",
    badge: "#3b82f6",
  },
  lead: {
    bg: "#ecfdf5",
    border: "#10b981",
    text: "#047857",
    badge: "#10b981",
  },
  member: {
    bg: "#f8fafc",
    border: "#64748b",
    text: "#334155",
    badge: "#64748b",
  },
};

const levelLabels: Record<string, string> = {
  executive: "Executive",
  manager: "Manager",
  lead: "Lead",
  member: "Member",
};

const PersonNode = ({ data, selected }: NodeProps) => {
  const personData = data as any;
  const level = personData.level || "member";
  const colors = levelColors[level];
  const label = levelLabels[level];

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasDetails = !!(
    personData.department ||
    personData.email ||
    personData.phone
  );

  return (
    <div
      className="relative bg-white rounded-xl shadow-lg transition-all duration-200"
      style={{
        minWidth: "220px",
        minHeight: "100px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: selected ? "#1e293b" : colors.border,
        boxShadow: selected
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400! border-2 border-white"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-400! border-2 border-white"
        style={{ bottom: -6 }}
      />

      {/* Level badge header */}
      <div
        className="rounded-t-xl px-3 py-1.5 flex items-center gap-2"
        style={{ backgroundColor: colors.bg }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.badge }}
        />
        <span
          className="text-xs font-semibold"
          style={{
            color: colors.text,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          {label}
        </span>
      </div>

      {/* Main content */}
      <div className="p-3 flex items-start gap-3">
        {/* Avatar */}
        <div
          className="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.bg }}
        >
          <span
            className="text-sm font-semibold"
            style={{
              color: colors.text,
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            {getInitials(personData.name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-sm font-semibold text-gray-900 truncate"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            title={personData.name}
          >
            {personData.name}
          </h3>
          <p
            className="text-xs text-gray-500 truncate mt-0.5"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
            title={personData.role}
          >
            {personData.role}
          </p>
        </div>
      </div>

      {/* Details section */}
      {hasDetails && (
        <>
          <div className="mx-3 border-t border-gray-200" />
          <div className="px-3 pb-3 pt-2 space-y-1">
            {personData.department && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>🏢</span>
                <span
                  className="truncate"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  title={personData.department}
                >
                  {personData.department}
                </span>
              </div>
            )}
            {personData.email && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>📧</span>
                <span
                  className="truncate"
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  title={personData.email}
                >
                  {personData.email}
                </span>
              </div>
            )}
            {personData.phone && (
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>📞</span>
                <span
                  style={{ fontFamily: "Inter, system-ui, sans-serif" }}
                  title={personData.phone}
                >
                  {personData.phone}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(PersonNode);
