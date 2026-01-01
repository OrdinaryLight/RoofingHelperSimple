import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LineMeasurement, Point, SavedMeasurements } from '../types';

interface MeasurementResultsProps {
  area: number;
  perimeter: number;
  points: Point[];
  lines: LineMeasurement[];
  savedMeasurements: SavedMeasurements | null;
  onClearAll: () => void;
}

export function MeasurementResults({
  area,
  perimeter,
  points,
  lines,
  savedMeasurements,
  onClearAll
}: MeasurementResultsProps) {
  // Only show measurements if we have saved/persisted data
  if (!savedMeasurements) return null;

  return (
    <Card className="mt-6 border-gray-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-gray-900 text-lg">Property Measurements</CardTitle>
        <CardDescription className="text-gray-600">
          Complete measurement data for roofing calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Roof Area Section */}
          {area > 0 && (
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Roof Area</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{area.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">sq ft</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{(area / 10.7639).toFixed(1)}</div>
                  <div className="text-sm text-gray-600">m²</div>
                </div>
              </div>
            </div>
          )}

          {/* Eave Length Section */}
          {area > 0 && (
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-medium text-gray-900 mb-3">Eave Length</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{perimeter.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">linear ft</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{(perimeter / 3.28084).toFixed(1)}</div>
                  <div className="text-sm text-gray-600">m</div>
                </div>
              </div>
            </div>
          )}

          {/* Ridge/Hip Length Section */}
          {lines.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Ridge & Hip Length</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{lines.length}</div>
                  <div className="text-sm text-gray-600">lines</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {lines.reduce((sum, line) => sum + line.length, 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">linear ft</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {lines.reduce((sum, line) => sum + line.lengthMeters, 0).toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">m</div>
                </div>
              </div>
            </div>
          )}
        </div>

            <div className="flex justify-end mt-4">
              <Button
                onClick={onClearAll}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear All Measurements
              </Button>
            </div>
      </CardContent>
    </Card>
  );
}
