import * as go from "gojs";
import { Phone } from "lucide-react";
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
  lead: { bg: "#ecfdf5", border: "#10b981", text: "#047857", badge: "#10b981" },
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

export function createNodeTemplate(): go.Node {
  const $ = go.GraphObject.make;

  return $(
    go.Node,
    "Auto",
    {
      locationSpot: go.Spot.Center,
      isShadowed: true,
      shadowOffset: new go.Point(0, 4),
      shadowColor: "rgba(0, 0, 0, 0.1)",
      shadowBlur: 12,
      cursor: "pointer",
      selectionAdornmentTemplate: $(
        go.Adornment,
        "Auto",
        $(go.Shape, "RoundedRectangle", {
          fill: null,
          stroke: "#1e293b",
          strokeWidth: 2,
          parameter1: 12,
        }),
        $(go.Placeholder),
      ),
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
      go.Point.stringify,
    ),

    // Main container
    $(
      go.Shape,
      "RoundedRectangle",
      {
        parameter1: 12,
        fill: "white",
        strokeWidth: 2,
        minSize: new go.Size(220, 100),
        portId: "",
        fromLinkable: true,
        toLinkable: true,
        fromSpot: go.Spot.Bottom,
        toSpot: go.Spot.Top,
      },
      new go.Binding(
        "stroke",
        "level",
        (level) => levelColors[level]?.border || "#64748b",
      ),
    ),

    // Content panel
    $(
      go.Panel,
      "Vertical",
      { margin: 0, defaultAlignment: go.Spot.Left },

      // Level badge header
      $(
        go.Panel,
        "Auto",
        {
          stretch: go.GraphObject.Horizontal,
          margin: new go.Margin(0, 0, 0, 0),
        },
        $(
          go.Shape,
          "RoundedRectangle",
          {
            parameter1: 12,
            parameter2: 0 | 0 | 2 | 2, // Only top corners rounded
            height: 28,
            stretch: go.GraphObject.Horizontal,
          },
          new go.Binding(
            "fill",
            "level",
            (level) => levelColors[level]?.bg || "#f8fafc",
          ),
        ),
        $(
          go.Panel,
          "Horizontal",
          { margin: new go.Margin(6, 12, 6, 12) },
          $(
            go.Shape,
            "Circle",
            { width: 8, height: 8, margin: new go.Margin(0, 6, 0, 0) },
            new go.Binding(
              "fill",
              "level",
              (level) => levelColors[level]?.badge || "#64748b",
            ),
          ),
          $(
            go.TextBlock,
            {
              font: "600 11px Inter, system-ui, sans-serif",
            },
            new go.Binding(
              "text",
              "level",
              (level) => levelLabels[level] || "Member",
            ),
            new go.Binding(
              "stroke",
              "level",
              (level) => levelColors[level]?.text || "#334155",
            ),
          ),
        ),
      ),

      // Main content
      $(
        go.Panel,
        "Horizontal",
        {
          margin: new go.Margin(12, 12, 12, 12),
          defaultAlignment: go.Spot.Top,
        },

        // Avatar
        $(
          go.Panel,
          "Auto",
          { margin: new go.Margin(0, 12, 0, 0) },
          $(
            go.Shape,
            "RoundedRectangle",
            {
              parameter1: 8,
              width: 44,
              height: 44,
              strokeWidth: 0,
            },
            new go.Binding(
              "fill",
              "level",
              (level) => levelColors[level]?.bg || "#f8fafc",
            ),
          ),
          $(
            go.TextBlock,
            {
              font: "600 14px Inter, system-ui, sans-serif",
              textAlign: "center",
              verticalAlignment: go.Spot.Center,
            },
            new go.Binding("text", "name", (name: string) => {
              const parts = name.split(" ");
              return parts
                .map((p) => p[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
            }),
            new go.Binding(
              "stroke",
              "level",
              (level) => levelColors[level]?.text || "#334155",
            ),
          ),
        ),

        // Info
        $(
          go.Panel,
          "Vertical",
          { defaultAlignment: go.Spot.Left },
          $(
            go.TextBlock,
            {
              font: "600 14px Inter, system-ui, sans-serif",
              stroke: "#0f172a",
              maxSize: new go.Size(140, NaN),
              overflow: go.TextBlock.OverflowEllipsis,
            },
            new go.Binding("text", "name"),
          ),
          $(
            go.TextBlock,
            {
              font: "400 12px Inter, system-ui, sans-serif",
              stroke: "#64748b",
              margin: new go.Margin(2, 0, 0, 0),
              maxSize: new go.Size(140, NaN),
              overflow: go.TextBlock.OverflowEllipsis,
            },
            new go.Binding("text", "role"),
          ),
        ),
      ),

      // Details section (department, email, phone)
      $(
        go.Panel,
        "Vertical",
        {
          margin: new go.Margin(0, 12, 12, 12),
          defaultAlignment: go.Spot.Left,
          stretch: go.GraphObject.Horizontal,
        },
        new go.Binding(
          "visible",
          "",
          (data) => !!(data.department || data.email || data.phone),
        ),

        // Separator
        $(go.Shape, "LineH", {
          stroke: "#e2e8f0",
          strokeWidth: 1,
          height: 1,
          stretch: go.GraphObject.Horizontal,
          margin: new go.Margin(0, 0, 8, 0),
        }),

        // Department
        $(
          go.Panel,
          "Horizontal",
          { margin: new go.Margin(0, 0, 4, 0) },
          new go.Binding("visible", "department", (d) => !!d),
          $(go.TextBlock, "🏢 ", { font: "12px sans-serif" }),
          $(
            go.TextBlock,
            {
              font: "400 11px Inter, system-ui, sans-serif",
              stroke: "#64748b",
              maxSize: new go.Size(180, NaN),
              overflow: go.TextBlock.OverflowEllipsis,
            },
            new go.Binding("text", "department"),
          ),
        ),

        // Email
        $(
          go.Panel,
          "Horizontal",
          { margin: new go.Margin(0, 0, 4, 0) },
          new go.Binding("visible", "email", (e) => !!e),
          $(go.TextBlock, "📧 ", { font: "12px sans-serif" }),
          $(
            go.TextBlock,
            {
              font: "400 11px Inter, system-ui, sans-serif",
              stroke: "#64748b",
              maxSize: new go.Size(180, NaN),
              overflow: go.TextBlock.OverflowEllipsis,
            },
            new go.Binding("text", "email"),
          ),
        ),

        // Phone
        $(
          go.Panel,
          "Horizontal",
          new go.Binding("visible", "phone", (p) => !!p),
          $(go.TextBlock, "", { font: "12px sans-serif" }),
          $(
            go.TextBlock,
            {
              font: "400 11px Inter, system-ui, sans-serif",
              stroke: "#64748b",
            },
            new go.Binding("text", "phone"),
          ),
        ),
      ),
    ),
  );
}
