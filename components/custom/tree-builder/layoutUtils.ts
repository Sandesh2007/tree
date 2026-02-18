import { Node, Edge } from "@xyflow/react";

let elkInstance: any = null;

const getElk = async () => {
  if (elkInstance) return elkInstance;
  const mod = await import("elkjs/lib/elk.bundled.js");
  const ELK = (mod && (mod.default || mod)) as any;
  elkInstance = new ELK();
  return elkInstance;
};

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";

interface LayoutOptions {
  direction?: LayoutDirection;
  nodeWidth?: number;
  nodeHeight?: number;
  rankSep?: number;
  nodeSep?: number;
}

const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 120;

 /* Layout algorithm using ELK for better hierarchical layouts
 * Supports both horizontal (LR) and vertical (TB) orientations
 * from https://reactflow.dev/examples/layout/elkjs
 */
export const getLayoutedElements = async (
  nodes: Node[],
  edges: Edge[],
  direction: LayoutDirection = "TB",
  options: LayoutOptions = {},
): Promise<{ nodes: Node[]; edges: Edge[] }> => {
  if (nodes.length === 0) return { nodes, edges };

  const isHorizontal = direction === "LR" || direction === "RL";

  const {
    nodeWidth = DEFAULT_NODE_WIDTH,
    nodeHeight = DEFAULT_NODE_HEIGHT,
    // Horizontal needs more rank separation because nodes are wider than tall
    rankSep = isHorizontal ? 120 : 80,
    nodeSep = isHorizontal ? 50 : 60,
  } = options;

  const dirMap: Record<LayoutDirection, string> = {
    TB: "DOWN",
    LR: "RIGHT",
    BT: "UP",
    RL: "LEFT",
  };

  const elkDir = dirMap[direction] ?? "DOWN";

  const elkNodes = nodes.map((n) => {
    const data: any = (n as any).data ?? {};
    const hasDetails = !!(data.department || data.email || data.phone);

    // In horizontal mode swap width/height assumptions slightly
    // so nodes don't overlap on the cross axis
    const w = n.width ?? (hasDetails ? Math.max(nodeWidth, 260) : nodeWidth);
    const h = n.height ?? (hasDetails ? Math.max(nodeHeight, 140) : nodeHeight);

    return { id: n.id, width: w, height: h };
  });

  const elkEdges = edges.map((e) => ({
    id: e.id || `${e.source}->${e.target}`,
    sources: [e.source],
    targets: [e.target],
  }));

  const graph: any = {
    id: "root",
    layoutOptions: {
      
      "elk.algorithm": "layered",
      "elk.direction": elkDir,

      
      "elk.spacing.nodeNode": String(nodeSep),
      "elk.layered.spacing.nodeNodeBetweenLayers": String(rankSep),
      "elk.spacing.edgeNode": "25",
      "elk.spacing.edgeEdge": "15",
      "elk.padding": "[top=50, left=50, bottom=50, right=50]",

      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",

      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",

      "elk.edgeRouting": "ORTHOGONAL",
      "elk.layered.mergeEdges": "true",

      "elk.layered.layering.strategy": "NETWORK_SIMPLEX",

      "elk.layered.compactComponents": "true",

      "elk.aspectRatio": isHorizontal ? "2.5" : "0.6",

      ...(isHorizontal && {
        "elk.layered.nodePlacement.bk.fixedAlignment": "BALANCED",
        "elk.layered.unnecessaryBendpoints": "true",
      }),
    },
    children: elkNodes,
    edges: elkEdges,
  };

  const elk = await getElk();
  const result = await elk.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const placed =
      (result.children ?? []).find((c: any) => c.id === node.id) ?? {};

    const x = typeof placed.x === "number" ? placed.x : 0;
    const y = typeof placed.y === "number" ? placed.y : 0;

    return {
      ...node,
      position: { x, y },
      // These tell React Flow which side of the node to attach edges.
      sourcePosition: isHorizontal ? ("right" as const) : ("bottom" as const),
      targetPosition: isHorizontal ? ("left" as const) : ("top" as const),
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
};

export const getTreeLayout = async (
  nodes: Node[],
  edges: Edge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> =>
  getLayoutedElements(nodes, edges, "TB", {
    nodeWidth: 240,
    nodeHeight: 120,
    rankSep: 80,
    nodeSep: 60,
  });

export const getHorizontalLayout = async (
  nodes: Node[],
  edges: Edge[],
): Promise<{ nodes: Node[]; edges: Edge[] }> =>
  getLayoutedElements(nodes, edges, "LR", {
    nodeWidth: 240,
    nodeHeight: 120,
    rankSep: 120,
    nodeSep: 50,
  });

export const getNodesBounds = (nodes: Node[]) => {
  if (nodes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  nodes.forEach(({ position, width, height }) => {
    minX = Math.min(minX, position.x);
    minY = Math.min(minY, position.y);
    maxX = Math.max(maxX, position.x + (width ?? DEFAULT_NODE_WIDTH));
    maxY = Math.max(maxY, position.y + (height ?? DEFAULT_NODE_HEIGHT));
  });

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};
