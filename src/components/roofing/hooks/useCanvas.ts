import { useRef, useEffect, useCallback } from 'react';
import type { Point, LineMeasurement, WorkflowStep } from '../types';
import { drawPolygon, drawLines, clearCanvas, getCanvasCoordinates, isWithinCanvas } from '../drawing';

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  handleCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  clearCanvas: () => void;
}

interface UseCanvasProps {
  workflowStep: WorkflowStep;
  points: Point[];
  lines: LineMeasurement[];
  linePoints: Point[];
  onAddPoint: (point: Point) => void;
  onAddLinePoint: (point: Point) => void;
}

export function useCanvas({
  workflowStep,
  points,
  lines,
  linePoints,
  onAddPoint,
  onAddLinePoint
}: UseCanvasProps): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw canvas when data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    clearCanvas(ctx, canvas);

    // Draw based on current mode
    if (workflowStep === 'area') {
      drawPolygon(ctx, points);
    } else if (workflowStep === 'lines') {
      drawLines(ctx, lines, linePoints);
    }
  }, [workflowStep, points, lines, linePoints]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas);

    if (!isWithinCanvas(coords.x, coords.y, canvas)) return;

    if (workflowStep === 'area') {
      onAddPoint(coords);
    } else if (workflowStep === 'lines') {
      onAddLinePoint(coords);
    }
  }, [workflowStep, onAddPoint, onAddLinePoint]);

  const clearCanvasDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      clearCanvas(ctx, canvas);
    }
  }, []);

  return {
    canvasRef,
    handleCanvasClick,
    clearCanvas: clearCanvasDrawing
  };
}
