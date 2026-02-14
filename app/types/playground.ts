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

export type BlockData = NoteBlockData | TodoBlockData;

export interface PlaygroundBlock {
  id: string;
  type: "note" | "todo";
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
