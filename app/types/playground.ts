export interface NoteBlockData {
  title: string;
  body: string;
  color: string; // bg color hex
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TodoBlockData {
  title: string;
  items: TodoItem[];
  color: string; // bg color hex
}

export type FlowchartNodeShape = "rectangle" | "diamond" | "circle";

export interface FlowchartNode {
  id: string;
  label: string;
  shape: FlowchartNodeShape;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export type EdgeLineType = "straight" | "adaptive";
export type EdgeArrowDirection = "forward" | "backward" | "both" | "none";

export interface FlowchartEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label: string;
  lineType?: EdgeLineType;
  arrowDirection?: EdgeArrowDirection;
}

export interface FlowchartBlockData {
  title: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  color: string;
}

export interface DrawingStroke {
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

export interface DrawingBlockData {
  strokes: DrawingStroke[];
  color: string;
}

export type BlockData =
  | NoteBlockData
  | TodoBlockData
  | FlowchartBlockData
  | DrawingBlockData;

export interface PlaygroundBlock {
  id: string;
  type: "note" | "todo" | "flowchart" | "drawing";
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  data: BlockData;
}

export interface PlaygroundViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface PlaygroundState {
  blocks: PlaygroundBlock[];
  viewport: PlaygroundViewport;
}
