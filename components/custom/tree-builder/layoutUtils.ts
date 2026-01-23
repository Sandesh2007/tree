import { Node, Edge } from "@xyflow/react";
import dagre from "dagre";

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";

interface LayoutOptions {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

/**
 * Layout algorithm using Dagre for better hierarchical layouts
 * Supports both horizontal (LR) and vertical (TB) orientations
 * from https://reactflow.dev/examples/layout/dagre
 */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "TB",
  options: LayoutOptions = {},
): { nodes: Node[]; edges: Edge[] } => {
  const {
    nodeWidth = 240,
    nodeHeight = 120,
    rankSep = 100,
    nodeSep = 50,
  } = options;

  if (nodes.length === 0) {
    return { nodes, edges };
  }

  const isHorizontal = direction === "LR" || direction === "RL";

  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure the graph layout
  dagreGraph.setGraph({
    rankdir: direction,
    ranksep: rankSep,
    nodesep: nodeSep,
    edgesep: 30,
    marginx: 20,
    marginy: 20,
  });

  // Add nodes to the graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Dagre returns the center position of the node
    // We need to adjust to top-left corner for react flow
    const x = nodeWithPosition.x - nodeWidth / 2;
    const y = nodeWithPosition.y - nodeHeight / 2;

    return {
      ...node,
      position: { x, y },
      // Set source and target positions based on direction
      sourcePosition: isHorizontal ? "right" : "bottom",
      targetPosition: isHorizontal ? "left" : "top",
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
};

/**
 * Apply tree layout specifically optimized for organizational charts (vertical)
 */
export const getTreeLayout = (
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } => {
  return getLayoutedElements(nodes, edges, "TB", {
    nodeWidth: 240,
    nodeHeight: 120,
    rankSep: 100,
    nodeSep: 50,
  });
};

/**
 * Apply horizontal tree layout
 */
export const getHorizontalLayout = (
  nodes: Node[],
  edges: Edge[],
): { nodes: Node[]; edges: Edge[] } => {
  return getLayoutedElements(nodes, edges, "LR", {
    nodeWidth: 240,
    nodeHeight: 120,
    rankSep: 150,
    nodeSep: 80,
  });
};

/**
 * Calculate bounds of all nodes
 */
export const getNodesBounds = (nodes: Node[]) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const width = node.width || 240;
    const height = node.height || 120;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};
