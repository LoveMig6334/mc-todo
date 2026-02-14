"use client";

import { generateId } from "@/app/lib/utils";
import {
  BlockData,
  PlaygroundBlock,
  PlaygroundState,
  PlaygroundViewport,
} from "@/app/types/playground";
import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

const DEFAULT_STATE: PlaygroundState = {
  blocks: [],
  viewport: { x: 0, y: 0, zoom: 1 },
};

const DEFAULT_NOTE_DATA: BlockData = {
  title: "",
  body: "",
  color: "#27272a", // zinc-800
};

const DEFAULT_TODO_DATA: BlockData = {
  title: "",
  items: [],
  color: "#27272a", // zinc-800
};

const DEFAULT_FLOWCHART_DATA: BlockData = {
  title: "",
  nodes: [],
  edges: [],
  color: "#27272a", // zinc-800
};

const DEFAULT_BLOCK_SIZE = { width: 280, height: 200 };
const FLOWCHART_BLOCK_SIZE = { width: 400, height: 300 };

export function usePlayground(taskId: string) {
  const [state, setState] = useLocalStorage<PlaygroundState>(
    `playground-${taskId}`,
    DEFAULT_STATE,
  );

  const addBlock = useCallback(
    (type: PlaygroundBlock["type"], position: { x: number; y: number }) => {
      const maxZ = state.blocks.reduce((max, b) => Math.max(max, b.zIndex), 0);
      const defaultData =
        type === "flowchart"
          ? { ...DEFAULT_FLOWCHART_DATA }
          : type === "todo"
            ? { ...DEFAULT_TODO_DATA }
            : { ...DEFAULT_NOTE_DATA };
      const newBlock: PlaygroundBlock = {
        id: generateId(),
        type,
        position,
        size:
          type === "flowchart"
            ? { ...FLOWCHART_BLOCK_SIZE }
            : { ...DEFAULT_BLOCK_SIZE },
        zIndex: maxZ + 1,
        data: defaultData,
      };
      setState((prev) => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
      }));
      return newBlock.id;
    },
    [state.blocks, setState],
  );

  const updateBlock = useCallback(
    (id: string, dataUpdates: Partial<BlockData>) => {
      setState((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.id === id ? { ...b, data: { ...b.data, ...dataUpdates } } : b,
        ),
      }));
    },
    [setState],
  );

  const deleteBlock = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        blocks: prev.blocks.filter((b) => b.id !== id),
      }));
    },
    [setState],
  );

  const moveBlock = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setState((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === id ? { ...b, position } : b)),
      }));
    },
    [setState],
  );

  const resizeBlock = useCallback(
    (id: string, size: { width: number; height: number }) => {
      setState((prev) => ({
        ...prev,
        blocks: prev.blocks.map((b) => (b.id === id ? { ...b, size } : b)),
      }));
    },
    [setState],
  );

  const bringToFront = useCallback(
    (id: string) => {
      setState((prev) => {
        const maxZ = prev.blocks.reduce((max, b) => Math.max(max, b.zIndex), 0);
        return {
          ...prev,
          blocks: prev.blocks.map((b) =>
            b.id === id ? { ...b, zIndex: maxZ + 1 } : b,
          ),
        };
      });
    },
    [setState],
  );

  const sendToBack = useCallback(
    (id: string) => {
      setState((prev) => {
        const minZ = prev.blocks.reduce((min, b) => Math.min(min, b.zIndex), 0);
        return {
          ...prev,
          blocks: prev.blocks.map((b) =>
            b.id === id ? { ...b, zIndex: minZ - 1 } : b,
          ),
        };
      });
    },
    [setState],
  );

  const setViewport = useCallback(
    (viewport: PlaygroundViewport) => {
      setState((prev) => ({ ...prev, viewport }));
    },
    [setState],
  );

  return {
    blocks: state.blocks,
    viewport: state.viewport,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    resizeBlock,
    bringToFront,
    sendToBack,
    setViewport,
  };
}
