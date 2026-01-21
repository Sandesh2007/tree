import { Node, Edge } from "@xyflow/react";
import { RelationType, NodeLevel } from "@/types/types";

interface NodeData {
  name?: string;
  level?: NodeLevel | string;
  [key: string]: unknown;
}

interface EdgeData {
  relationType?: RelationType | string;
  [key: string]: unknown;
}

interface LayoutOptions {
  nodeWidth?: number;
  nodeHeight?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  treeSpacing?: number;
  direction?: "TB" | "BT" | "LR" | "RL"; // Top-Bottom, Bottom-Top, Left-Right, Right-Left
}

interface SubtreeInfo {
  width: number;
  height: number;
  level: number;
  children: string[];
}

export function calculateTreeLayout(
  nodes: Node<NodeData>[],
  edges: Edge<EdgeData>[],
  options: LayoutOptions = {},
): Map<string, { x: number; y: number }> {
  const {
    nodeWidth = 220,
    nodeHeight = 150,
    horizontalSpacing = 60,
    verticalSpacing = 100,
    treeSpacing = 150,
    direction = "TB",
  } = options;

  const levelHeight = nodeHeight + verticalSpacing;

  // Build parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  nodes.forEach((n) => childrenMap.set(n.id, []));

  edges.forEach((edge) => {
    const relationType = edge.data?.relationType;
    if (relationType === "reports_to" || relationType === "manages") {
      if (!parentMap.has(edge.target)) {
        const children = childrenMap.get(edge.source) || [];
        children.push(edge.target);
        childrenMap.set(edge.source, children);
        parentMap.set(edge.target, edge.source);
      }
    }
  });

  // Sort children by level priority
  const levelOrder: Record<string, number> = {
    executive: 0,
    manager: 1,
    lead: 2,
    member: 3,
  };

  childrenMap.forEach((children) => {
    children.sort((a, b) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      const levelA = levelOrder[nodeA?.data?.level || "unknown"] ?? 4;
      const levelB = levelOrder[nodeB?.data?.level || "unknown"] ?? 4;
      return (
        levelA - levelB ||
        (nodeA?.data?.name || "").localeCompare(nodeB?.data?.name || "")
      );
    });
  });

  // Find roots
  const rootNodes = nodes.filter((n) => !parentMap.has(n.id));

  // Calculate subtree info
  const subtreeInfo = new Map<string, SubtreeInfo>();

  const calculateSubtree = (
    nodeId: string,
    level: number,
  ): { width: number; height: number } => {
    const children = childrenMap.get(nodeId) || [];

    if (children.length === 0) {
      subtreeInfo.set(nodeId, {
        width: nodeWidth,
        height: nodeHeight,
        level,
        children: [],
      });
      return { width: nodeWidth, height: nodeHeight };
    }

    let totalWidth = 0;
    let maxChildHeight = 0;

    children.forEach((childId, index) => {
      if (index > 0) totalWidth += horizontalSpacing;
      const childDim = calculateSubtree(childId, level + 1);
      totalWidth += childDim.width;
      maxChildHeight = Math.max(maxChildHeight, childDim.height);
    });

    const width = Math.max(nodeWidth, totalWidth);
    const height = nodeHeight + verticalSpacing + maxChildHeight;

    subtreeInfo.set(nodeId, { width, height, level, children });
    return { width, height };
  };

  // Calculate positions
  const positions = new Map<string, { x: number; y: number }>();

  const positionSubtree = (nodeId: string, centerX: number, y: number) => {
    const isHorizontal = direction === "LR" || direction === "RL";

    if (isHorizontal) {
      positions.set(nodeId, { x: y, y: centerX - nodeWidth / 2 });
    } else {
      positions.set(nodeId, { x: centerX - nodeWidth / 2, y });
    }

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    let totalChildrenWidth = 0;
    children.forEach((childId, index) => {
      if (index > 0) totalChildrenWidth += horizontalSpacing;
      totalChildrenWidth += subtreeInfo.get(childId)?.width || nodeWidth;
    });

    let currentX = centerX - totalChildrenWidth / 2;
    const childY = y + levelHeight;

    children.forEach((childId) => {
      const childWidth = subtreeInfo.get(childId)?.width || nodeWidth;
      const childCenterX = currentX + childWidth / 2;
      positionSubtree(childId, childCenterX, childY);
      currentX += childWidth + horizontalSpacing;
    });
  };

  // Sort and position roots
  rootNodes.forEach((root) => calculateSubtree(root.id, 0));
  rootNodes.sort((a, b) => {
    const levelA = levelOrder[a.data?.level || "member"] ?? 4;
    const levelB = levelOrder[b.data?.level || "member"] ?? 4;
    if (levelA !== levelB) return levelA - levelB;
    return (
      (subtreeInfo.get(b.id)?.width || 0) - (subtreeInfo.get(a.id)?.width || 0)
    );
  });

  let currentX = 0;
  rootNodes.forEach((root) => {
    const treeWidth = subtreeInfo.get(root.id)?.width || nodeWidth;
    positionSubtree(root.id, currentX + treeWidth / 2, 0);
    currentX += treeWidth + treeSpacing;
  });

  // Handle disconnected nodes
  const positioned = new Set(positions.keys());
  const disconnected = nodes.filter((n) => !positioned.has(n.id));

  if (disconnected.length > 0) {
    const allY = Array.from(positions.values()).map((p) => p.y);
    const maxY = allY.length > 0 ? Math.max(...allY) : 0;
    const disconnectedY = maxY + levelHeight + 80;
    const totalWidth = currentX - treeSpacing;

    disconnected.sort((a, b) => {
      const levelA = levelOrder[a.data?.level || "member"] ?? 4;
      const levelB = levelOrder[b.data?.level || "member"] ?? 4;
      return levelA - levelB;
    });

    const disconnectedWidth =
      disconnected.length * (nodeWidth + horizontalSpacing) - horizontalSpacing;
    const startX = totalWidth / 2 - disconnectedWidth / 2;

    disconnected.forEach((node, index) => {
      positions.set(node.id, {
        x: startX + index * (nodeWidth + horizontalSpacing),
        y: disconnectedY,
      });
    });
  }

  // Center layout
  const allPos = Array.from(positions.values());
  if (allPos.length === 0) return positions;

  const minX = Math.min(...allPos.map((p) => p.x));
  const maxX = Math.max(...allPos.map((p) => p.x)) + nodeWidth;
  const minY = Math.min(...allPos.map((p) => p.y));

  const offsetX = -(minX + maxX) / 2 + nodeWidth / 2;
  const offsetY = -minY + 50;

  // Apply offsets and handle direction
  positions.forEach((pos, id) => {
    let finalX = pos.x + offsetX;
    let finalY = pos.y + offsetY;

    if (direction === "BT") {
      const maxYVal = Math.max(...allPos.map((p) => p.y));
      finalY = maxYVal - pos.y + offsetY;
    } else if (direction === "RL") {
      const maxXVal = Math.max(...allPos.map((p) => p.x));
      finalX = maxXVal - pos.x + offsetX;
    }

    positions.set(id, { x: finalX, y: finalY });
  });

  return positions;
}
