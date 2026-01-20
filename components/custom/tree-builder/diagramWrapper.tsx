"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { createNodeTemplate } from "./nodeTemplates";
import { createLinkTemplate } from "./linkTemplates";
import { PersonData, LinkData } from "@/types/types";

interface DiagramWrapperProps {
  nodes: PersonData[];
  links: LinkData[];
  onNodeSelect: (key: string | null) => void;
  onModelChange: (data: { nodes: PersonData[]; links: LinkData[] }) => void;
  onLinkCreated: (fromKey: string, toKey: string) => void;
}

export interface DiagramRef {
  zoomToFit: () => void;
  centerOnNode: (key: string) => void;
  applyLayout: () => void;
  exportImage: () => string | null;
  getDiagram: () => go.Diagram | null;
}

const DiagramWrapper = forwardRef<DiagramRef, DiagramWrapperProps>(
  ({ nodes, links, onNodeSelect, onModelChange, onLinkCreated }, ref) => {
    const diagramRef = useRef<ReactDiagram>(null);

    const initDiagram = (): go.Diagram => {
      const $ = go.GraphObject.make;

      const diagram = $(go.Diagram, {
        "undoManager.isEnabled": true,
        "clickCreatingTool.archetypeNodeData": null, // Disable click-to-create
        "linkingTool.isEnabled": true,
        "linkingTool.direction": go.LinkingTool.ForwardsOnly,
        layout: $(go.TreeLayout, {
          angle: 90,
          layerSpacing: 80,
          nodeSpacing: 40,
          arrangement: go.TreeLayout.ArrangementHorizontal,
          compaction: go.TreeLayout.CompactionBlock,
        }),
        initialAutoScale: go.Diagram.Uniform,
        initialContentAlignment: go.Spot.Center,
        padding: new go.Margin(50),
        "animationManager.isEnabled": true,
        "animationManager.duration": 500,
        // Grid
        grid: $(
          go.Panel,
          "Grid",
          { gridCellSize: new go.Size(24, 24), visible: true },
          $(go.Shape, "LineH", { stroke: "#e5e5e5", strokeWidth: 0.5 }),
          $(go.Shape, "LineV", { stroke: "#e5e5e5", strokeWidth: 0.5 }),
        ),
        "draggingTool.isGridSnapEnabled": true,
        // Selection
        "commandHandler.deletesTree": false,
        model: new go.GraphLinksModel({
          linkKeyProperty: "key",
          nodeKeyProperty: "key",
        }),
      });

      // Set templates
      diagram.nodeTemplate = createNodeTemplate();
      diagram.linkTemplate = createLinkTemplate();

      // Selection changed
      diagram.addDiagramListener("ChangedSelection", (e) => {
        const selectedNode = diagram.selection.first();
        if (selectedNode instanceof go.Node) {
          onNodeSelect(selectedNode.key as string);
        } else {
          onNodeSelect(null);
        }
      });

      // Link drawn
      diagram.addDiagramListener("LinkDrawn", (e) => {
        const link = e.subject as go.Link;
        const fromNode = link.fromNode;
        const toNode = link.toNode;
        if (fromNode && toNode) {
          onLinkCreated(fromNode.key as string, toNode.key as string);
          // Remove the auto-created link, we'll add it through state
          diagram.model.removeLinkData(link.data);
        }
      });

      // Background click
      diagram.addDiagramListener("BackgroundSingleClicked", () => {
        onNodeSelect(null);
      });

      return diagram;
    };

    useImperativeHandle(ref, () => ({
      zoomToFit: () => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
          diagram.zoomToFit();
        }
      },
      centerOnNode: (key: string) => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
          const node = diagram.findNodeForKey(key);
          if (node) {
            diagram.centerRect(node.actualBounds);
            diagram.select(node);
          }
        }
      },
      applyLayout: () => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
          diagram.startTransaction("layout");
          diagram.layout = go.GraphObject.make(go.TreeLayout, {
            angle: 90,
            layerSpacing: 100,
            nodeSpacing: 50,
            arrangement: go.TreeLayout.ArrangementHorizontal,
            compaction: go.TreeLayout.CompactionBlock,
            setsPortSpot: false,
            setsChildPortSpot: false,
          });
          diagram.layoutDiagram(true);
          diagram.commitTransaction("layout");
          setTimeout(() => diagram.zoomToFit(), 100);
        }
      },
      exportImage: () => {
        const diagram = diagramRef.current?.getDiagram();
        if (diagram) {
          return diagram.makeImageData({
            scale: 2,
            background: "white",
            type: "image/png",
          }) as string;
        }
        return null;
      },
      getDiagram: () => {
        return diagramRef.current?.getDiagram() || null;
      },
    }));

    const handleModelChange = (e: go.IncrementalData) => {
      // Get current model data
      const diagram = diagramRef.current?.getDiagram();
      if (!diagram) return;

      const nodeDataArray = diagram.model.nodeDataArray as PersonData[];
      const linkDataArray = (diagram.model as go.GraphLinksModel)
        .linkDataArray as LinkData[];

      onModelChange({
        nodes: nodeDataArray.map((n) => ({ ...n })),
        links: linkDataArray.map((l) => ({ ...l })),
      });
    };

    return (
      <ReactDiagram
        ref={diagramRef}
        divClassName="w-full h-full"
        initDiagram={initDiagram}
        nodeDataArray={nodes}
        linkDataArray={links}
        onModelChange={handleModelChange}
        skipsDiagramUpdate={false}
      />
    );
  },
);

DiagramWrapper.displayName = "DiagramWrapper";

export default DiagramWrapper;
