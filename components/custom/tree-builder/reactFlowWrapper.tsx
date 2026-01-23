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
  useNodesState,
  useEdgesState,
  Connection,
  ConnectionMode,
  ReactFlowProvider,
  useReactFlow,
  MarkerType,
  NodeChange,
  ReactFlowInstance,
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

const nodeTypes = {
  person: PersonNode,
};

const ReactFlowDiagram = forwardRef<DiagramRef, ReactFlowWrapperProps>(
  (
    {
      nodes: nodeData,
      links: linkData,
      onNodeSelect,
      onModelChange,
      onLinkCreated,
    },
    ref,
  ) => {
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const initializedRef = useRef(false);

    // Convert PersonData to React Flow nodes
    const convertToReactFlowNodes = useCallback(
      (data: PersonData[]): Node[] => {
        return data.map((person) => {
          const position = person.loc
            ? (() => {
                const [x, y] = person.loc.split(" ").map(Number);
                return { x, y };
              })()
            : { x: 0, y: 0 };

          return {
            id: person.key,
            type: "person",
            position,
            data: person as unknown as Record<string, unknown>,
            draggable: true,
          };
        });
      },
      [],
    );

    // Convert LinkData to React Flow edges
    const convertToReactFlowEdges = useCallback((data: LinkData[]): Edge[] => {
      const relationColors: Record<string, string> = {
        reports_to: "#6366f1",
        manages: "#3b82f6",
        collaborates: "#10b981",
        mentors: "#f59e0b",
      };

      const relationLabels: Record<string, string> = {
        reports_to: "Reports To",
        manages: "Manages",
        collaborates: "Collaborates",
        mentors: "Mentors",
      };

      return data.map((link) => ({
        id: link.key,
        source: link.from,
        target: link.to,
        type: "default",
        animated:
          link.relationType === "collaborates" ||
          link.relationType === "mentors",
        style: {
          stroke: relationColors[link.relationType] || "#6366f1",
          strokeWidth: 2,
          strokeDasharray:
            link.relationType === "collaborates" ||
            link.relationType === "mentors"
              ? "6 4"
              : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: relationColors[link.relationType] || "#6366f1",
          width: 20,
          height: 20,
        },
        label: relationLabels[link.relationType] || link.relationType,
        labelStyle: {
          fill: relationColors[link.relationType] || "#6366f1",
          fontSize: 10,
          fontWeight: 500,
          fontFamily: "Inter, system-ui, sans-serif",
        },
        labelBgStyle: {
          fill: "white",
          fillOpacity: 0.9,
        },
        labelBgPadding: [6, 8] as [number, number],
        labelBgBorderRadius: 4,
        data: {
          relationType: link.relationType,
        },
      }));
    }, []);

    useEffect(() => {
      if (nodeData.length > 0 || linkData.length > 0) {
        const flowNodes = convertToReactFlowNodes(nodeData);
        const flowEdges = convertToReactFlowEdges(linkData);

        const needsLayout = flowNodes.some(
          (n) => n.position.x === 0 && n.position.y === 0,
        );

        if (needsLayout && !initializedRef.current) {
          const { nodes: layoutedNodes, edges: layoutedEdges } =
            getLayoutedElements(flowNodes, flowEdges);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          initializedRef.current = true;

          // Fit view after layout
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
          }, 50);
        } else {
          setNodes(flowNodes);
          setEdges(flowEdges);
          if (!initializedRef.current) {
            initializedRef.current = true;
            setTimeout(() => {
              reactFlowInstance.fitView({ padding: 0.2, duration: 300 });
            }, 50);
          }
        }
      } else {
        setNodes([]);
        setEdges([]);
        initializedRef.current = false;
      }
    }, [
      nodeData,
      linkData,
      convertToReactFlowNodes,
      convertToReactFlowEdges,
      reactFlowInstance,
      setNodes,
      setEdges,
    ]);

    const handleNodesChange = useCallback(
      (changes: NodeChange[]) => {
        onNodesChange(changes);

        const positionChange = changes.find(
          (c) =>
            c.type === "position" && "dragging" in c && c.dragging === false,
        );
        if (positionChange) {
          setTimeout(() => {
            const updatedNodes = nodes.map((node) => {
              const flowNode = reactFlowInstance.getNode(node.id);
              if (flowNode && flowNode.data) {
                return {
                  ...(flowNode.data as unknown as PersonData),
                  loc: `${Math.round(flowNode.position.x)} ${Math.round(flowNode.position.y)}`,
                };
              }
              return node.data as unknown as PersonData;
            });
            onModelChange({ nodes: updatedNodes, links: linkData });
          }, 100);
        }
      },
      [onNodesChange, nodes, linkData, onModelChange, reactFlowInstance],
    );

    const onConnect = useCallback(
      (connection: Connection) => {
        if (connection.source && connection.target) {
          onLinkCreated(connection.source, connection.target);
        }
      },
      [onLinkCreated],
    );

    const onNodeClick = useCallback(
      (_event: React.MouseEvent, node: Node) => {
        onNodeSelect(node.id);
      },
      [onNodeSelect],
    );

    const onPaneClick = useCallback(() => {
      onNodeSelect(null);
    }, [onNodeSelect]);

    useImperativeHandle(ref, () => ({
      zoomToFit: () => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      },
      centerOnNode: (key: string) => {
        const node = reactFlowInstance.getNode(key);
        if (node) {
          reactFlowInstance.setCenter(
            node.position.x + (node.width || 0) / 2,
            node.position.y + (node.height || 0) / 2,
            { zoom: 1.2, duration: 400 },
          );
          onNodeSelect(key);
        }
      },
      applyLayout: (direction: LayoutDirection = "TB") => {
        const { nodes: layoutedNodes, edges: layoutedEdges } =
          getLayoutedElements(nodes, edges, direction);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Update parent with new positions
        setTimeout(() => {
          const updatedNodes = layoutedNodes.map((node) => ({
            ...(node.data as unknown as PersonData),
            loc: `${Math.round(node.position.x)} ${Math.round(node.position.y)}`,
          }));
          onModelChange({ nodes: updatedNodes, links: linkData });
          reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
        }, 50);
      },
      exportImage: () => {
        const viewport = document.querySelector(".react-flow__viewport");
        if (!viewport) return null;
        // TODO: add export to image
        // will add later
        console.warn("Image export requires html-to-image library");
        return null;
      },
      getDiagram: () => {
        return reactFlowInstance;
      },
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
          attributionPosition="bottom-left"
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "default",
            animated: false,
          }}
        >
          <Background color="#e5e5e5" gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    );
  },
);

ReactFlowDiagram.displayName = "ReactFlowDiagram";

const ReactFlowWrapper = forwardRef<DiagramRef, ReactFlowWrapperProps>(
  (props, ref) => {
    return (
      <ReactFlowProvider>
        <ReactFlowDiagram {...props} ref={ref} />
      </ReactFlowProvider>
    );
  },
);

ReactFlowWrapper.displayName = "ReactFlowWrapper";

export default ReactFlowWrapper;
