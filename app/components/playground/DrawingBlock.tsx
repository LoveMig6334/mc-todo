"use client";

import { DrawingBlockData, DrawingStroke } from "@/app/types/playground";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DrawingBlockProps {
  data: DrawingBlockData;
  isSelected: boolean;
  onUpdate: (data: Partial<DrawingBlockData>) => void;
  blockSize: { width: number; height: number };
}

const CANVAS_PADDING = 6;

const STROKE_COLORS = [
  { hex: "#ffffff", label: "White" },
  { hex: "#f97316", label: "Orange" },
  { hex: "#ef4444", label: "Red" },
  { hex: "#22c55e", label: "Green" },
  { hex: "#3b82f6", label: "Blue" },
  { hex: "#a855f7", label: "Purple" },
  { hex: "#eab308", label: "Yellow" },
];

const STROKE_WIDTHS = [
  { value: 2, label: "Thin" },
  { value: 4, label: "Medium" },
  { value: 8, label: "Thick" },
];

const BLOCK_COLORS = [
  { hex: "#27272a", label: "Zinc" },
  { hex: "#1e3a5f", label: "Blue" },
  { hex: "#3b1f2b", label: "Rose" },
  { hex: "#1a3324", label: "Green" },
  { hex: "#3d2b1a", label: "Amber" },
  { hex: "#2d1b4e", label: "Purple" },
];

function applyStrokeStyle(
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;
  if (color === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: DrawingStroke) {
  if (stroke.points.length < 2) return;

  ctx.save();
  applyStrokeStyle(ctx, stroke.color, stroke.width);
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

export default function DrawingBlock({
  data,
  isSelected,
  onUpdate,
  blockSize,
}: DrawingBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);

  // Drawing tool state
  const [activeColor, setActiveColor] = useState("#ffffff");
  const [activeWidth, setActiveWidth] = useState(4);
  const [isEraser, setIsEraser] = useState(false);

  // Refs for pointer event callbacks (avoid stale closures)
  const strokeColorRef = useRef(activeColor);
  const strokeWidthRef = useRef(activeWidth);

  useEffect(() => {
    strokeColorRef.current = isEraser ? "eraser" : activeColor;
    strokeWidthRef.current = isEraser ? 16 : activeWidth;
  }, [activeColor, activeWidth, isEraser]);

  // Canvas pixel dimensions
  const canvasWidth = useMemo(
    () => Math.max(1, blockSize.width - CANVAS_PADDING * 2),
    [blockSize.width],
  );
  const canvasHeight = useMemo(
    () => Math.max(1, blockSize.height - CANVAS_PADDING * 2),
    [blockSize.height],
  );

  // Redraw all strokes whenever data.strokes or canvas dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of data.strokes) {
      drawStroke(ctx, stroke);
    }
  }, [data.strokes, canvasWidth, canvasHeight]);

  const getCanvasPoint = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      isDrawing.current = true;
      currentPoints.current = [getCanvasPoint(e)];
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      applyStrokeStyle(ctx, strokeColorRef.current, strokeWidthRef.current);
      ctx.beginPath();
      const pt = currentPoints.current[0];
      ctx.moveTo(pt.x, pt.y);
    },
    [getCanvasPoint],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing.current) return;
      const pt = getCanvasPoint(e);
      currentPoints.current.push(pt);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
    },
    [getCanvasPoint],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (currentPoints.current.length >= 2) {
      const newStroke: DrawingStroke = {
        points: currentPoints.current,
        color: strokeColorRef.current,
        width: strokeWidthRef.current,
      };
      onUpdate({ strokes: [...data.strokes, newStroke] });
    }
    currentPoints.current = [];
  }, [data.strokes, onUpdate]);

  const handleClear = useCallback(() => {
    onUpdate({ strokes: [] });
  }, [onUpdate]);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="flex flex-col h-full" style={{ padding: CANVAS_PADDING }}>
      {/* Drawing toolbar — shown when selected */}
      {isSelected && (
        <div
          className="flex items-center gap-2 pb-1.5 mb-1 border-b border-white/10 shrink-0 flex-wrap"
          data-testid="drawing-toolbar"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Pen / Eraser toggle */}
          <div className="flex gap-0.5">
            <button
              onClick={() => setIsEraser(false)}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${
                !isEraser
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
              title="Pen tool"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="17" y1="3" x2="21" y2="7" />
                <path d="M13 7l-8.414 8.414a2 2 0 00-.586 1.414V21h4.172a2 2 0 001.414-.586L18 12" />
              </svg>
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-xs transition-colors ${
                isEraser
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-zinc-400 hover:text-white hover:bg-white/10"
              }`}
              title="Eraser tool"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 20H7L3 16l9-9 8 8-4 5z" />
                <path d="M6 11l4 4" />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Stroke colors */}
          <div className="flex gap-1">
            {STROKE_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => {
                  setActiveColor(c.hex);
                  setIsEraser(false);
                }}
                className="w-5 h-5 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c.hex,
                  borderColor:
                    activeColor === c.hex && !isEraser
                      ? "rgb(249, 115, 22)"
                      : "rgba(255,255,255,0.15)",
                }}
                title={c.label}
              />
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Stroke widths */}
          <div className="flex gap-0.5">
            {STROKE_WIDTHS.map((w) => (
              <button
                key={w.value}
                onClick={() => setActiveWidth(w.value)}
                className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                  activeWidth === w.value
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
                title={w.label}
              >
                <div
                  className="rounded-full bg-current"
                  style={{ width: w.value + 2, height: w.value + 2 }}
                />
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="h-5 w-px bg-white/10" />

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Clear canvas"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>

          {/* Export PNG button */}
          <button
            onClick={handleExport}
            className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Export as PNG"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isSelected && data.strokes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-zinc-500 text-sm">Click to draw</span>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        data-testid="drawing-canvas"
        width={canvasWidth}
        height={canvasHeight}
        className="flex-1 rounded-lg"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          touchAction: "none",
          cursor: isEraser ? "grab" : "crosshair",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {/* Block color picker */}
      {isSelected && (
        <div className="flex gap-1.5 pt-1.5 mt-1 border-t border-white/10 shrink-0">
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
