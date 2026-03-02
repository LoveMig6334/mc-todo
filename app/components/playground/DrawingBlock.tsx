"use client";

import { DrawingBlockData, DrawingStroke } from "@/app/types/playground";
import { useCallback, useEffect, useRef } from "react";

interface DrawingBlockProps {
  data: DrawingBlockData;
  isSelected: boolean;
  onUpdate: (data: Partial<DrawingBlockData>) => void;
  blockSize: { width: number; height: number };
}

const CANVAS_PADDING = 6; // px padding inside the block wrapper

export default function DrawingBlock({
  data,
  isSelected,
  onUpdate,
  blockSize,
}: DrawingBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentPoints = useRef<{ x: number; y: number }[]>([]);

  // Default drawing settings
  const strokeColor = useRef("#ffffff");
  const strokeWidth = useRef(3);

  // Canvas pixel dimensions (fill the block minus padding)
  const canvasWidth = Math.max(1, blockSize.width - CANVAS_PADDING * 2);
  const canvasHeight = Math.max(1, blockSize.height - CANVAS_PADDING * 2);

  // Redraw all strokes whenever data.strokes or canvas dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all saved strokes
    for (const stroke of data.strokes) {
      drawStroke(ctx, stroke);
    }
  }, [data.strokes, canvasWidth, canvasHeight]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length < 2) return;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.width;

    if (stroke.color === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = stroke.color;
    }

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
    ctx.restore();
  };

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

      // Start drawing on the canvas immediately
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = strokeWidth.current;

      if (strokeColor.current === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = strokeColor.current;
      }

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

      // Draw live line segment
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(pt.x, pt.y);
      ctx.stroke();
      // Re-begin path at current point to keep stroke continuous
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
        color: strokeColor.current,
        width: strokeWidth.current,
      };
      onUpdate({ strokes: [...data.strokes, newStroke] });
    }
    currentPoints.current = [];
  }, [data.strokes, onUpdate]);

  return (
    <div className="flex flex-col h-full" style={{ padding: CANVAS_PADDING }}>
      {/* Drawing info shown when not selected */}
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
        className="flex-1 rounded-lg cursor-crosshair"
        style={{
          width: canvasWidth,
          height: canvasHeight,
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
