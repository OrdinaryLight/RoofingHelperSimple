import { Button } from '@/components/ui/button';
import type { LineMeasurement, Point, WorkflowStep } from '../types';

interface MeasurementControlsProps {
  workflowStep: WorkflowStep;
  drawingMode: boolean;
  points: Point[];
  lines: LineMeasurement[];
  area: number;
  perimeter: number;
  onToggleDrawing: () => void;
  onClearDrawing: () => void;
  onClearLines: () => void;
  onGoToPrevious: () => void;
  onGoToNext: () => void;
}

export function MeasurementControls({
  workflowStep,
  drawingMode,
  points,
  lines,
  area,
  perimeter,
  onToggleDrawing,
  onClearDrawing,
  onClearLines,
  onGoToPrevious,
  onGoToNext
}: MeasurementControlsProps) {
  return (
    <>
      <div className="flex flex-wrap gap-4 mb-4">
        <Button
          onClick={onToggleDrawing}
          variant={drawingMode ? "destructive" : "default"}
        >
          {drawingMode ? `Exit ${workflowStep === 'lines' ? 'Capping' : 'Area'} Mode` : `Enter ${workflowStep === 'lines' ? 'Capping' : 'Area'} Mode`}
        </Button>

        {drawingMode && (
          <>
            <Button onClick={workflowStep === 'lines' ? onClearLines : onClearDrawing} variant="outline">
              Clear {workflowStep === 'lines' ? 'Cappings' : 'Drawing'}
            </Button>

            {workflowStep === 'area' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Points:</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-sm">
                    {points.length}
                  </span>
                </div>
                      {area > 0 && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Area:</span>
                            <span className="bg-green-100 px-2 py-1 rounded text-sm font-mono">
                              {area.toFixed(1)} ft² / {(area / 10.7639).toFixed(1)} m²
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Perimeter:</span>
                            <span className="bg-yellow-100 px-2 py-1 rounded text-sm font-mono">
                              {perimeter.toFixed(1)} ft / {(perimeter / 3.28084).toFixed(1)} m
                            </span>
                          </div>
                        </>
                      )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Lines:</span>
                  <span className="bg-orange-100 px-2 py-1 rounded text-sm">
                    {lines.length}
                  </span>
                </div>
                      {lines.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Total Length:</span>
                          <span className="bg-red-100 px-2 py-1 rounded text-sm font-mono">
                            {lines.reduce((sum, line) => sum + line.length, 0).toFixed(1)} ft / {lines.reduce((sum, line) => sum + line.lengthMeters, 0).toFixed(1)} m
                          </span>
                        </div>
                      )}
              </>
            )}
          </>
        )}
      </div>

      {/* Workflow Navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={onGoToPrevious}
          disabled={workflowStep === 'area'}
          variant="outline"
        >
          ← Previous: Area Measurement
        </Button>

        <div className="text-sm text-gray-600">
          Current: <span className="font-medium capitalize">{workflowStep === 'lines' ? 'capping' : workflowStep} Measurement</span>
        </div>

        <Button
          onClick={onGoToNext}
          disabled={workflowStep === 'lines'}
          variant="outline"
        >
          Next: Line Measurement →
        </Button>
      </div>
    </>
  );
}
