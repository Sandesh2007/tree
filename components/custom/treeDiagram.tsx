"use client";

interface TreeNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  label?: string;
}

interface TreeConnection {
  from: string;
  to: string;
}

interface TreeDiagramProps {
  nodes?: TreeNode[];
  connections?: TreeConnection[];
  width?: number;
  height?: number;
  nodeColor?: string;
  connectionColor?: string;
  className?: string;
  showLabels?: boolean;
}

const defaultNodes: TreeNode[] = [
  { id: "root", x: 400, y: 80, radius: 30, label: "Root" },
  { id: "a", x: 200, y: 180, radius: 25, label: "Team A" },
  { id: "b", x: 400, y: 180, radius: 25, label: "Team B" },
  { id: "c", x: 600, y: 180, radius: 25, label: "Team C" },
  { id: "a1", x: 100, y: 280, radius: 20, label: "A1" },
  { id: "a2", x: 250, y: 280, radius: 20, label: "A2" },
  { id: "b1", x: 400, y: 280, radius: 20, label: "B1" },
  { id: "c1", x: 550, y: 280, radius: 20, label: "C1" },
  { id: "c2", x: 700, y: 280, radius: 20, label: "C2" },
];

const defaultConnections: TreeConnection[] = [
  { from: "root", to: "a" },
  { from: "root", to: "b" },
  { from: "root", to: "c" },
  { from: "a", to: "a1" },
  { from: "a", to: "a2" },
  { from: "b", to: "b1" },
  { from: "c", to: "c1" },
  { from: "c", to: "c2" },
];

export function TreeDiagram({
  nodes = defaultNodes,
  connections = defaultConnections,
  width = 800,
  height = 400,
  nodeColor = "#3b82f6",
  connectionColor = "#3b82f6",
  className = "",
  showLabels = true,
}: TreeDiagramProps) {
  // Create a map for quick node lookup
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`h-full w-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={nodeColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Draw Connections */}
      {connections.map((conn, index) => {
        const fromNode = nodeMap.get(conn.from);
        const toNode = nodeMap.get(conn.to);

        if (!fromNode || !toNode) return null;

        return (
          <line
            key={`conn-${index}`}
            x1={fromNode.x}
            y1={fromNode.y}
            x2={toNode.x}
            y2={toNode.y}
            stroke={connectionColor}
            strokeWidth="2"
            opacity="0.5"
          />
        );
      })}

      {/* Draw Nodes */}
      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={node.radius}
            fill="url(#nodeGradient)"
            filter="url(#glow)"
          />
          {showLabels && node.label && (
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fill="white"
              fontSize={
                node.radius > 25 ? "12" : node.radius > 20 ? "11" : "10"
              }
              fontWeight={node.radius > 25 ? "bold" : "normal"}
            >
              {node.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
