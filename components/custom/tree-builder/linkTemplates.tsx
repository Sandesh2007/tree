import * as go from "gojs";

const relationColors: Record<string, { color: string; dash: number[] | null }> =
  {
    reports_to: { color: "#6366f1", dash: null },
    manages: { color: "#3b82f6", dash: null },
    collaborates: { color: "#10b981", dash: [6, 4] },
    mentors: { color: "#f59e0b", dash: [6, 4] },
  };

const relationLabels: Record<string, string> = {
  reports_to: "Reports To",
  manages: "Manages",
  collaborates: "Collaborates",
  mentors: "Mentors",
};

export function createLinkTemplate(): go.Link {
  const $ = go.GraphObject.make;

  return $(
    go.Link,
    {
      routing: go.Link.AvoidsNodes,
      corner: 10,
      curve: go.Link.JumpOver,
      reshapable: true,
      relinkableFrom: true,
      relinkableTo: true,
      toShortLength: 4,
      fromShortLength: 2,
    },
    new go.Binding("curviness", "curviness"),

    // Main line
    $(
      go.Shape,
      {
        strokeWidth: 2,
        stroke: "#6366f1",
      },
      new go.Binding(
        "stroke",
        "relationType",
        (rt) => relationColors[rt]?.color || "#6366f1",
      ),
      new go.Binding(
        "strokeDashArray",
        "relationType",
        (rt) => relationColors[rt]?.dash,
      ),
    ),

    // Arrow
    $(
      go.Shape,
      {
        toArrow: "Triangle",
        strokeWidth: 0,
        fill: "#6366f1",
        scale: 1.2,
      },
      new go.Binding(
        "fill",
        "relationType",
        (rt) => relationColors[rt]?.color || "#6366f1",
      ),
    ),

    // Label
    $(
      go.Panel,
      "Auto",
      {
        segmentIndex: NaN,
        segmentFraction: 0.5,
      },
      $(go.Shape, "RoundedRectangle", {
        fill: "white",
        strokeWidth: 1,
        stroke: "#e2e8f0",
        parameter1: 4,
      }),
      $(
        go.TextBlock,
        {
          font: "500 10px Inter, system-ui, sans-serif",
          margin: new go.Margin(3, 6, 3, 6),
        },
        new go.Binding(
          "text",
          "relationType",
          (rt) => relationLabels[rt] || rt,
        ),
        new go.Binding(
          "stroke",
          "relationType",
          (rt) => relationColors[rt]?.color || "#6366f1",
        ),
      ),
    ),
  );
}
