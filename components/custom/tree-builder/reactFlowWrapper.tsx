"use client";

import {
  useCallback,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  NodeChange,
  ReactFlowInstance,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PersonData, LinkData } from "@/types/types";
import PersonNode from "./PersonNode";
import { getLayoutedElements, LayoutDirection } from "./layoutUtils";

interface ReactFlowWrapperProps {
  nodes: PersonData[];
  links: LinkData[];
  onNodeSelect: (key: string | null) => void;
  onModelChange: (data: { nodes: PersonData[]; links: LinkData[] }) => void;
  onLinkCreated: (fromKey: string, toKey: string) => void;
}

export interface DiagramRef {
  zoomToFit: () => void;
  centerOnNode: (key: string) => void;
  applyLayout: (direction?: LayoutDirection) => void;
  exportImage: () => string | null;
  getDiagram: () => ReactFlowInstance | null;
}

const nodeTypes = { person: PersonNode };

const RELATION_COLOR: Record<string, string> = {
  reports_to: "#6366f1",
  manages:    "#3b82f6",
  collaborates: "#10b981",
  mentors:    "#f59e0b",
};

const RELATION_LABEL: Record<string, string> = {
  reports_to:   "Reports To",
  manages:      "Manages",
  collaborates: "Collaborates",
  mentors:      "Mentors",
}; 

const getHandlePositions = (direction: LayoutDirection) => {
  const isHorizontal = direction === "LR" || direction === "RL";
  return {
    sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
    targetPosition: isHorizontal ? Position.Left  : Position.Top,
  };
};


const stampHandles = (nodes: Node[], direction: LayoutDirection): Node[] => {
  const { sourcePosition, targetPosition } = getHandlePositions(direction);
  return nodes.map((n) => ({ ...n, sourcePosition, targetPosition }));
};


const ReactFlowDiagram = forwardRef<DiagramRef, ReactFlowWrapperProps>(
  (
    { nodes: nodeData, links: linkData, onNodeSelect, onModelChange, onLinkCreated },
    ref,
  ) => {
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    const initializedRef      = useRef(false);
    const layoutInProgressRef = useRef(false);
    // Track current direction so stampHandles always uses the right value
    const directionRef        = useRef<LayoutDirection>("TB");

    const convertNodes = useCallback(
      (data: PersonData[]): Node[] =>
        data.map((person) => {
          const position = person.loc
            ? (() => {
                const [x, y] = person.loc.split(" ").map(Number);
                return { x, y };
              })()
            : { x: 0, y: 0 };

          const { sourcePosition, targetPosition } = getHandlePositions(
            directionRef.current,
          );

          return {
            id: person.key,
            type: "person",
            position,
            sourcePosition,
            targetPosition,
            data: person as unknown as Record<string, unknown>,
            draggable: true,
          };
        }),
      [],
    );

    const convertEdges = useCallback(
      (data: LinkData[]): Edge[] =>
        data.map((link) => {
          const color     = RELATION_COLOR[link.relationType] ?? "#6366f1";
          const isAnimated =
            link.relationType === "collaborates" ||
            link.relationType === "mentors";

          return {
            id: link.key,
            source: link.from,
            target: link.to,
            type: "smoothstep",
            animated: isAnimated,
            style: {
              stroke: color,
              strokeWidth: 2,
              strokeDasharray: isAnimated ? "6 4" : undefined,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color,
              width: 18,
              height: 18,
            },
            label: RELATION_LABEL[link.relationType] ?? link.relationType,
            labelStyle: {
              fill: color,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: "Inter, system-ui, sans-serif",
            },
            labelBgStyle:       { fill: "#ffffff", fillOpacity: 0.95 },
            labelBgPadding:     [6, 8] as [number, number],
            labelBgBorderRadius: 4,
            data: { relationType: link.relationType },
          };
        }),
      [],
    );

    const runLayout = useCallback(
      async (
        rawNodes: Node[],
        rawEdges: Edge[],
        direction: LayoutDirection,
        fitAfter = true,
      ) => {
        if (layoutInProgressRef.current) return;
        layoutInProgressRef.current = true;
        directionRef.current = direction;

        try {
          const { nodes: laid, edges: laidEdges } = await getLayoutedElements(
            rawNodes,
            rawEdges,
            direction,
          );

          setNodes(stampHandles(laid, direction));
          setEdges(laidEdges);

          if (fitAfter) {
            requestAnimationFrame(() => {
              setTimeout(() => {
                reactFlowInstance.fitView({
                  padding: 0.15,
                  duration: 400,
                  minZoom: 0.1,
                  maxZoom: 1.5,
                });
              }, 60);
            });
          }
        } finally {
          layoutInProgressRef.current = false;
        }
      },
      [reactFlowInstance, setNodes, setEdges],
    );

    useEffect(() => {
      if (nodeData.length === 0 && linkData.length === 0) {
        setNodes([]);
        setEdges([]);
        initializedRef.current = false;
        return;
      }

      const flowNodes = convertNodes(nodeData);
      const flowEdges = convertEdges(linkData);

      const allAtOrigin = flowNodes.every(
        (n) => n.position.x === 0 && n.position.y === 0,
      );

      if (allAtOrigin && !initializedRef.current) {
        initializedRef.current = true;
        runLayout(flowNodes, flowEdges, directionRef.current, true);
      } else {
        // Keep existing positions, just re-stamp handles in case direction changed
        setNodes(stampHandles(flowNodes, directionRef.current));
        setEdges(flowEdges);

        if (!initializedRef.current) {
          initializedRef.current = true;
          requestAnimationFrame(() => {
            setTimeout(
              () => reactFlowInstance.fitView({ padding: 0.15, duration: 300 }),
              60,
            );
          });
        }
      }
    }, [
      nodeData,
      linkData,
      convertNodes,
      convertEdges,
      runLayout,
      reactFlowInstance,
      setNodes,
      setEdges,
    ]);

    const handleNodesChange = useCallback(
      (changes: NodeChange[]) => {
        onNodesChange(changes);

        const dropped = changes.find(
          (c) => c.type === "position" && "dragging" in c && c.dragging === false,
        );
        if (dropped) {
          setTimeout(() => {
            const updated = reactFlowInstance.getNodes().map((n) => ({
              ...(n.data as unknown as PersonData),
              loc: `${Math.round(n.position.x)} ${Math.round(n.position.y)}`,
            }));
            onModelChange({ nodes: updated, links: linkData });
          }, 100);
        }
      },
      [onNodesChange, linkData, onModelChange, reactFlowInstance],
    );

    const onConnect = useCallback(
      (connection: Connection) => {
        if (connection.source && connection.target)
          onLinkCreated(connection.source, connection.target);
      },
      [onLinkCreated],
    );

    const onNodeClick = useCallback(
      (_: React.MouseEvent, node: Node) => onNodeSelect(node.id),
      [onNodeSelect],
    );

    const onPaneClick = useCallback(() => onNodeSelect(null), [onNodeSelect]);


    useImperativeHandle(ref, () => ({
      zoomToFit: () =>
        reactFlowInstance.fitView({ padding: 0.15, duration: 400 }),

      centerOnNode: (key: string) => {
        const node = reactFlowInstance.getNode(key);
        if (node) {
          reactFlowInstance.setCenter(
            node.position.x + (node.width ?? 0) / 2,
            node.position.y + (node.height ?? 0) / 2,
            { zoom: 1.2, duration: 400 },
          );
          onNodeSelect(key);
        }
      },

      applyLayout: (direction: LayoutDirection = "TB") => {
        // Use live nodes/edges from the store so positions are current
        const liveNodes = reactFlowInstance.getNodes();
        const liveEdges = reactFlowInstance.getEdges();

        runLayout(liveNodes, liveEdges, direction, true).then(() => {
          setTimeout(() => {
            const updated = reactFlowInstance.getNodes().map((n) => ({
              ...(n.data as unknown as PersonData),
              loc: `${Math.round(n.position.x)} ${Math.round(n.position.y)}`,
            }));
            onModelChange({ nodes: updated, links: linkData });
          }, 500);
        });
      },

      exportImage: () => {
        console.warn("Image export requires html-to-image library");
        return null;
      },

      getDiagram: () => reactFlowInstance,
    }));

    return (
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.15, minZoom: 0.1, maxZoom: 1.5 }}
          attributionPosition="bottom-left"
          minZoom={0.05}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep", animated: false }}
          nodesDraggable
          nodesConnectable
          elementsSelectable
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#d1d5db"
          />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
    );
  },
);

ReactFlowDiagram.displayName = "ReactFlowDiagram";

const ReactFlowWrapper = forwardRef<DiagramRef, ReactFlowWrapperProps>(
  (props, ref) => (
    <ReactFlowProvider>
      <ReactFlowDiagram {...props} ref={ref} />
    </ReactFlowProvider>
  ),
);

ReactFlowWrapper.displayName = "ReactFlowWrapper";

export default ReactFlowWrapper;
