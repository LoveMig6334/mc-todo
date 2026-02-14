"use client";

import { generateId } from "@/app/lib/utils";
import {
  FlowchartBlockData,
  FlowchartEdge,
  FlowchartNode,
  FlowchartNodeShape,
} from "@/app/types/playground";
import { useCallback, useRef, useState } from "react";

const BLOCK_COLORS = [
  { hex: "#27272a", label: "Zinc" },
  { hex: "#1e3a5f", label: "Blue" },
  { hex: "#3b1f2b", label: "Rose" },
  { hex: "#1a3324", label: "Green" },
  { hex: "#3d2b1a", label: "Amber" },
  { hex: "#2d1b4e", label: "Purple" },
];

const DEFAULT_NODE_SIZE: Record<
  FlowchartNodeShape,
  { width: number; height: number }
> = {
  rectangle: { width: 120, height: 50 },
  diamond: { width: 100, height: 70 },
  circle: { width: 70, height: 70 },
};

type PortSide = "top" | "right" | "bottom" | "left";

interface ConnectingState {
  sourceNodeId: string;
  sourcePort: PortSide;
  currentX: number;
  currentY: number;
}

function getPortPosition(
  node: FlowchartNode,
  port: PortSide,
): { x: number; y: number } {
  const { x, y } = node.position;
  const { width, height } = node.size;
  switch (port) {
    case "top":
      return { x: x + width / 2, y };
    case "bottom":
      return { x: x + width / 2, y: y + height };
    case "left":
      return { x, y: y + height / 2 };
    case "right":
      return { x: x + width, y: y + height / 2 };
  }
}

const ALL_PORTS: PortSide[] = ["top", "right", "bottom", "left"];

function getNearestPorts(
  source: FlowchartNode,
  target: FlowchartNode,
): { sourcePort: PortSide; targetPort: PortSide } {
  let bestDist = Infinity;
  let bestSource: PortSide = "right";
  let bestTarget: PortSide = "left";

  for (const sp of ALL_PORTS) {
    const s = getPortPosition(source, sp);
    for (const tp of ALL_PORTS) {
      const t = getPortPosition(target, tp);
      const dist = Math.hypot(s.x - t.x, s.y - t.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestSource = sp;
        bestTarget = tp;
      }
    }
  }
  return { sourcePort: bestSource, targetPort: bestTarget };
}

interface FlowchartBlockProps {
  data: FlowchartBlockData;
  isSelected: boolean;
  onUpdate: (data: Partial<FlowchartBlockData>) => void;
  blockSize: { width: number; height: number };
}

export default function FlowchartBlock({
  data,
  isSelected,
  onUpdate,
  blockSize,
}: FlowchartBlockProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<ConnectingState | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);

  // --- Node operations ---
  const addNode = useCallback(
    (shape: FlowchartNodeShape) => {
      const size = DEFAULT_NODE_SIZE[shape];
      const newNode: FlowchartNode = {
        id: generateId(),
        label: shape === "diamond" ? "?" : "Label",
        shape,
        position: {
          x: (blockSize.width - 48) / 2 - size.width / 2,
          y: (blockSize.height - 80) / 2 - size.height / 2,
        },
        size,
      };
      onUpdate({ nodes: [...data.nodes, newNode] });
      setSelectedNodeId(newNode.id);
      setSelectedEdgeId(null);
    },
    [data.nodes, onUpdate, blockSize],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      onUpdate({
        nodes: data.nodes.filter((n) => n.id !== nodeId),
        edges: data.edges.filter(
          (e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId,
        ),
      });
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [data.nodes, data.edges, onUpdate, selectedNodeId],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      onUpdate({ edges: data.edges.filter((e) => e.id !== edgeId) });
      if (selectedEdgeId === edgeId) setSelectedEdgeId(null);
    },
    [data.edges, onUpdate, selectedEdgeId],
  );

  const updateNodePosition = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      onUpdate({
        nodes: data.nodes.map((n) =>
          n.id === nodeId ? { ...n, position } : n,
        ),
      });
    },
    [data.nodes, onUpdate],
  );

  const updateNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      onUpdate({
        nodes: data.nodes.map((n) =>
          n.id === nodeId ? { ...n, label } : n,
        ),
      });
      setEditingNodeId(null);
    },
    [data.nodes, onUpdate],
  );

  const updateEdgeLabel = useCallback(
    (edgeId: string, label: string) => {
      onUpdate({
        edges: data.edges.map((e) =>
          e.id === edgeId ? { ...e, label } : e,
        ),
      });
      setEditingEdgeId(null);
    },
    [data.edges, onUpdate],
  );

  // --- Node dragging ---
  const handleNodePointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string) => {
      e.stopPropagation();
      e.preventDefault();
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setDraggingNodeId(nodeId);
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        nodeX: node.position.x,
        nodeY: node.position.y,
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [data.nodes],
  );

  const handleNodePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingNodeId || !dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      updateNodePosition(draggingNodeId, {
        x: dragStartRef.current.nodeX + dx,
        y: dragStartRef.current.nodeY + dy,
      });
    },
    [draggingNodeId, updateNodePosition],
  );

  const handleNodePointerUp = useCallback(() => {
    setDraggingNodeId(null);
    dragStartRef.current = null;
  }, []);

  // --- Port connection ---
  const handlePortPointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string, port: PortSide) => {
      e.stopPropagation();
      e.preventDefault();
      const node = data.nodes.find((n) => n.id === nodeId);
      if (!node || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const portPos = getPortPosition(node, port);
      setConnecting({
        sourceNodeId: nodeId,
        sourcePort: port,
        currentX: portPos.x,
        currentY: portPos.y,
      });
      // Also capture on canvas level
      canvasRef.current.setPointerCapture(e.pointerId);

      // Store the initial port position for the line start
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      void rect; // used for bounds reference
    },
    [data.nodes],
  );

  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!connecting || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      setConnecting((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX - rect.left,
              currentY: e.clientY - rect.top,
            }
          : null,
      );
    },
    [connecting],
  );

  const handleCanvasPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!connecting || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const releaseX = e.clientX - rect.left;
      const releaseY = e.clientY - rect.top;

      // Find nearest port within 20px
      let bestNode: FlowchartNode | null = null;
      let bestDist = 20;
      for (const node of data.nodes) {
        if (node.id === connecting.sourceNodeId) continue;
        for (const port of ALL_PORTS) {
          const pos = getPortPosition(node, port);
          const dist = Math.hypot(pos.x - releaseX, pos.y - releaseY);
          if (dist < bestDist) {
            bestDist = dist;
            bestNode = node;
          }
        }
      }

      if (bestNode) {
        // Check no duplicate edge exists
        const exists = data.edges.some(
          (e) =>
            (e.sourceNodeId === connecting.sourceNodeId &&
              e.targetNodeId === bestNode!.id) ||
            (e.sourceNodeId === bestNode!.id &&
              e.targetNodeId === connecting.sourceNodeId),
        );
        if (!exists) {
          const newEdge: FlowchartEdge = {
            id: generateId(),
            sourceNodeId: connecting.sourceNodeId,
            targetNodeId: bestNode.id,
            label: "",
          };
          onUpdate({ edges: [...data.edges, newEdge] });
        }
      }

      setConnecting(null);
    },
    [connecting, data.nodes, data.edges, onUpdate],
  );

  // --- Keyboard ---
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (editingNodeId || editingEdgeId) return; // don't delete while editing label
        if (selectedNodeId) {
          e.preventDefault();
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          e.preventDefault();
          deleteEdge(selectedEdgeId);
        }
      }
    },
    [selectedNodeId, selectedEdgeId, editingNodeId, editingEdgeId, deleteNode, deleteEdge],
  );

  // --- Click canvas to deselect ---
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  // --- Rendering helpers ---
  const getNodeStyle = (node: FlowchartNode): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: "absolute",
      left: node.position.x,
      top: node.position.y,
      width: node.size.width,
      height: node.size.height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "grab",
      userSelect: "none",
      border: "2px solid",
      borderColor:
        selectedNodeId === node.id
          ? "rgb(249, 115, 22)"
          : "rgba(255,255,255,0.2)",
      backgroundColor:
        selectedNodeId === node.id
          ? "rgba(249, 115, 22, 0.15)"
          : "rgba(255,255,255,0.05)",
      transition: "border-color 0.15s, background-color 0.15s",
    };

    switch (node.shape) {
      case "circle":
        base.borderRadius = "50%";
        break;
      case "diamond":
        base.clipPath = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";
        base.border = "none";
        base.backgroundColor =
          selectedNodeId === node.id
            ? "rgba(249, 115, 22, 0.3)"
            : "rgba(255,255,255,0.1)";
        break;
      case "rectangle":
        base.borderRadius = "8px";
        break;
    }

    return base;
  };

  // Compute line start for the source port
  const getConnectingSourcePos = () => {
    if (!connecting) return { x: 0, y: 0 };
    const node = data.nodes.find((n) => n.id === connecting.sourceNodeId);
    if (!node) return { x: 0, y: 0 };
    return getPortPosition(node, connecting.sourcePort);
  };

  return (
    <div
      className="flex flex-col h-full"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Title */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <input
          type="text"
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Flowchart title"
          className="bg-transparent text-white text-sm font-semibold outline-none placeholder:text-zinc-500 w-full"
          onPointerDown={(e) => e.stopPropagation()}
        />
      </div>

      {/* Shape toolbar */}
      {isSelected && (
        <div
          className="flex gap-1 px-3 pb-1 shrink-0"
          data-testid="shape-toolbar"
        >
          <button
            onClick={() => addNode("rectangle")}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Add rectangle"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="3" width="12" height="8" rx="2" />
            </svg>
            Rect
          </button>
          <button
            onClick={() => addNode("diamond")}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Add diamond"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="7,1 13,7 7,13 1,7" />
            </svg>
            Diamond
          </button>
          <button
            onClick={() => addNode("circle")}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Add circle"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="6" />
            </svg>
            Circle
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden"
        onClick={handleCanvasClick}
        onPointerMove={connecting ? handleCanvasPointerMove : undefined}
        onPointerUp={connecting ? handleCanvasPointerUp : undefined}
        data-testid="flowchart-canvas"
      >
        {/* SVG edge layer */}
        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="rgba(255,255,255,0.5)"
              />
            </marker>
            <marker
              id="arrowhead-selected"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="rgb(249, 115, 22)" />
            </marker>
          </defs>

          {/* Edges */}
          {data.edges.map((edge) => {
            const sourceNode = data.nodes.find(
              (n) => n.id === edge.sourceNodeId,
            );
            const targetNode = data.nodes.find(
              (n) => n.id === edge.targetNodeId,
            );
            if (!sourceNode || !targetNode) return null;

            const { sourcePort, targetPort } = getNearestPorts(
              sourceNode,
              targetNode,
            );
            const start = getPortPosition(sourceNode, sourcePort);
            const end = getPortPosition(targetNode, targetPort);
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const isEdgeSelected = selectedEdgeId === edge.id;

            return (
              <g key={edge.id}>
                {/* Invisible wide hitbox */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke="transparent"
                  strokeWidth="12"
                  style={{ pointerEvents: "stroke", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    setSelectedNodeId(null);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    setEditingEdgeId(edge.id);
                  }}
                />
                {/* Visible line */}
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={
                    isEdgeSelected
                      ? "rgb(249, 115, 22)"
                      : "rgba(255,255,255,0.4)"
                  }
                  strokeWidth={isEdgeSelected ? 2.5 : 1.5}
                  markerEnd={
                    isEdgeSelected
                      ? "url(#arrowhead-selected)"
                      : "url(#arrowhead)"
                  }
                />
                {/* Edge label */}
                {editingEdgeId === edge.id ? (
                  <foreignObject
                    x={midX - 40}
                    y={midY - 12}
                    width="80"
                    height="24"
                    style={{ pointerEvents: "all" }}
                  >
                    <input
                      type="text"
                      defaultValue={edge.label}
                      autoFocus
                      className="w-full h-full bg-zinc-800 text-white text-xs text-center rounded border border-orange-500 outline-none px-1"
                      onBlur={(e) => updateEdgeLabel(edge.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          updateEdgeLabel(
                            edge.id,
                            (e.target as HTMLInputElement).value,
                          );
                        }
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                    />
                  </foreignObject>
                ) : edge.label ? (
                  <text
                    x={midX}
                    y={midY - 4}
                    textAnchor="middle"
                    fill={
                      isEdgeSelected
                        ? "rgb(249, 115, 22)"
                        : "rgba(255,255,255,0.6)"
                    }
                    fontSize="11"
                    style={{ pointerEvents: "none" }}
                  >
                    {edge.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Temp connection line */}
          {connecting && (() => {
            const src = getConnectingSourcePos();
            return (
              <line
                x1={src.x}
                y1={src.y}
                x2={connecting.currentX}
                y2={connecting.currentY}
                stroke="rgb(249, 115, 22)"
                strokeWidth="2"
                strokeDasharray="6 3"
              />
            );
          })()}
        </svg>

        {/* Nodes */}
        {data.nodes.map((node) => (
          <div
            key={node.id}
            style={getNodeStyle(node)}
            onPointerDown={(e) => handleNodePointerDown(e, node.id)}
            onPointerMove={
              draggingNodeId === node.id ? handleNodePointerMove : undefined
            }
            onPointerUp={
              draggingNodeId === node.id ? handleNodePointerUp : undefined
            }
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingNodeId(node.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNodeId(node.id);
              setSelectedEdgeId(null);
            }}
            data-testid={`flowchart-node-${node.shape}`}
          >
            {/* Diamond outline overlay (since clip-path hides border) */}
            {node.shape === "diamond" && (
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ pointerEvents: "none" }}
              >
                <polygon
                  points="50,2 98,50 50,98 2,50"
                  fill="none"
                  stroke={
                    selectedNodeId === node.id
                      ? "rgb(249, 115, 22)"
                      : "rgba(255,255,255,0.2)"
                  }
                  strokeWidth="3"
                />
              </svg>
            )}

            {/* Label or editing input */}
            {editingNodeId === node.id ? (
              <input
                type="text"
                defaultValue={node.label}
                autoFocus
                className="bg-transparent text-white text-xs text-center outline-none w-[80%] border-b border-orange-500"
                onBlur={(e) => updateNodeLabel(node.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateNodeLabel(
                      node.id,
                      (e.target as HTMLInputElement).value,
                    );
                  }
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                className="text-white text-xs text-center px-1 select-none pointer-events-none"
                style={{ zIndex: 1 }}
              >
                {node.label}
              </span>
            )}

            {/* Connection ports (visible on hover / when selected) */}
            {ALL_PORTS.map((port) => {
              const portStyle: React.CSSProperties = { position: "absolute" };
              switch (port) {
                case "top":
                  portStyle.top = -4;
                  portStyle.left = "50%";
                  portStyle.transform = "translateX(-50%)";
                  break;
                case "bottom":
                  portStyle.bottom = -4;
                  portStyle.left = "50%";
                  portStyle.transform = "translateX(-50%)";
                  break;
                case "left":
                  portStyle.left = -4;
                  portStyle.top = "50%";
                  portStyle.transform = "translateY(-50%)";
                  break;
                case "right":
                  portStyle.right = -4;
                  portStyle.top = "50%";
                  portStyle.transform = "translateY(-50%)";
                  break;
              }

              return (
                <div
                  key={port}
                  style={portStyle}
                  className="w-2 h-2 rounded-full bg-zinc-500 hover:bg-orange-500 opacity-0 hover:opacity-100 transition-opacity cursor-crosshair group-hover:opacity-100"
                  data-testid={`port-${port}`}
                  onPointerDown={(e) => handlePortPointerDown(e, node.id, port)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Color picker */}
      {isSelected && (
        <div className="flex gap-1.5 px-3 py-2 border-t border-white/10 shrink-0">
          {BLOCK_COLORS.map((c) => (
            <button
              key={c.hex}
              onClick={() => onUpdate({ color: c.hex })}
              className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c.hex,
                borderColor:
                  data.color === c.hex
                    ? "rgb(249, 115, 22)"
                    : "rgba(255,255,255,0.15)",
              }}
              title={c.label}
              onPointerDown={(e) => e.stopPropagation()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
