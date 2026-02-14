export interface NoteBlockData {
  title: string;
  body: string;
  color: string; // bg color hex
}

export type BlockData = NoteBlockData;

export interface PlaygroundBlock {
  id: string;
  type: "note"; // extensible: "todo" | "flowchart" | "drawing" later
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
