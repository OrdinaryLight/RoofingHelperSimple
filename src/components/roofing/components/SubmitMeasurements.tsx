import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { saveMeasurements } from '../../../lib/database';
import type { SavedMeasurements } from '../types';

interface SubmitMeasurementsProps {
  measurements: SavedMeasurements | null;
  onSuccess: (id: string) => void;
  onError: (error: string) => void;
}

export function SubmitMeasurements({ measurements, onSuccess, onError }: SubmitMeasurementsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!measurements) return;

    setIsSubmitting(true);
    try {
      const result = await saveMeasurements(measurements);
      if (result.success && result.id) {
        onSuccess(result.id);
      } else {
        onError(result.error || 'Failed to save measurements');
      }
    } catch (error) {
      onError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!measurements || measurements.area === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900">Save Measurements</CardTitle>
        <CardDescription className="text-gray-600">
          Store these measurements for future reference and avoid re-measuring this property.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {measurements.address}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Roof Area: {measurements.area.toFixed(1)} sq ft</div>
              <div>Ridge/Hip Lines: {measurements.lines.length} ({measurements.totalLineLength.toFixed(1)} ft)</div>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
          >
            {isSubmitting ? 'Saving...' : 'Save Measurements'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}