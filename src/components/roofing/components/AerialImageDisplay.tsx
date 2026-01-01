import Image from 'next/image';
import type { AerialImageResult, LineMeasurement, Point, WorkflowStep } from '../types';
import { MeasurementControls } from './MeasurementControls';

interface AerialImageDisplayProps {
  aerialImage: AerialImageResult;
  workflowStep: WorkflowStep;
  drawingMode: boolean;
  points: Point[];
  lines: LineMeasurement[];
  area: number;
  perimeter: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCanvasClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onToggleDrawing: () => void;
  onClearDrawing: () => void;
  onClearLines: () => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
}

export function AerialImageDisplay({
  aerialImage,
  workflowStep,
  drawingMode,
  points,
  lines,
  area,
  perimeter,
  canvasRef,
  onCanvasClick,
  onToggleDrawing,
  onClearDrawing,
  onClearLines,
  onGoToPrevious,
  onGoToNext
}: AerialImageDisplayProps) {
  return (
    <div className="relative inline-block border rounded-lg overflow-hidden shadow-lg">
      <Image
        src={aerialImage.imageUrl}
        alt="Aerial view for roofing analysis"
        width={640}
        height={640}
        className="block"
        priority
      />

      {drawingMode && (
        <>
          <canvas
            ref={canvasRef}
            width={640}
            height={640}
            className="absolute top-0 left-0 cursor-crosshair"
            onClick={onCanvasClick}
            style={{ pointerEvents: drawingMode ? 'auto' : 'none' }}
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
            Drawing Mode Active
          </div>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-4">
        <MeasurementControls
          workflowStep={workflowStep}
          drawingMode={drawingMode}
          points={points}
          lines={lines}
          area={area}
          perimeter={perimeter}
          onToggleDrawing={onToggleDrawing}
          onClearDrawing={onClearDrawing}
          onClearLines={onClearLines}
          onGoToPrevious={onGoToPrevious}
          onGoToNext={onGoToNext}
        />
      </div>
    </div>
  );
}
