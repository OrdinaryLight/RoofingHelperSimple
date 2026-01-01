'use client';

import {
  AerialImageDisplay,
  MeasurementResults,
  ResourcesTable,
  SubmitMeasurements,
  useCanvas,
  useMeasurements,
  WorkflowProgress
} from '@/components/roofing';
import { STORAGE_KEYS } from '@/components/roofing/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loadMeasurementByAddress } from '@/lib/database';
import { geocodeAddress, getAerialImage } from '@/lib/utils';
import { useState } from 'react';

// Force dynamic rendering to avoid SSR issues with Supabase
export const dynamic = 'force-dynamic';

export default function RoofingPage() {
  // Use the custom measurement hook
  const measurements = useMeasurements();

  // Local drawing mode state
  const [drawingMode, setDrawingMode] = useState(false);

  // Feedback state
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState<string | null>(null);

  // Use the canvas hook
  const { canvasRef, handleCanvasClick } = useCanvas({
    workflowStep: measurements.workflowStep,
    points: measurements.points,
    lines: measurements.lines,
    linePoints: measurements.linePoints,
    onAddPoint: measurements.addPoint,
    onAddLinePoint: measurements.addLinePoint
  });

  // Event handlers
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    measurements.setLoading(true);
    measurements.setError('');
    measurements.setCoordinates(null);
    measurements.setAerialImage(null);
    measurements.clearDrawing();

    // Clear all feedback messages, saved measurements, and localStorage for new search
    setLoadSuccess(null);
    setSubmitSuccess(null);
    setSubmitError(null);
    // Clear all measurement data for new search
    measurements.setSavedMeasurements(null);
    measurements.clearAllMeasurements(); // Clear area, perimeter, lines, etc.
    localStorage.removeItem(STORAGE_KEYS.MEASUREMENTS);

    try {
      const geocodeResult = await geocodeAddress(measurements.address);
      measurements.setCoordinates(geocodeResult);

      // Check if measurements already exist for this address
      // Try both the original address and the formatted address for better matching
      console.log('Checking database for address:', measurements.address);
      console.log('Formatted address:', geocodeResult.formattedAddress);

      let existingMeasurements = await loadMeasurementByAddress(measurements.address);

      // If not found with original address, try with formatted address
      if (!existingMeasurements.success || !existingMeasurements.measurement) {
        console.log('Not found with original address, trying formatted address');
        existingMeasurements = await loadMeasurementByAddress(geocodeResult.formattedAddress);
      }

      console.log('Final database check result:', existingMeasurements.success, !!existingMeasurements.measurement);
      console.log('Database result:', existingMeasurements);

      if (existingMeasurements.success && existingMeasurements.measurement) {
        console.log('Found existing measurements:', existingMeasurements.measurement);
        // Load existing measurements
        const measurement = existingMeasurements.measurement;

        // Load measurements into localStorage for the hook to pick up
        const savedData = {
          address: measurement.property_address,
          coordinates: measurement.coordinates || { lat: geocodeResult.latitude, lng: geocodeResult.longitude },
          area: measurement.area_sqft || 0,
          perimeter: measurement.perimeter_ft || 0,
          areaMeters: measurement.area_sqm || 0,
          perimeterMeters: measurement.perimeter_m || 0,
          points: [], // Points are not stored in database
          lines: measurement.lines_data || [],
          totalLineLength: measurement.total_line_length_ft || 0,
          totalLineLengthMeters: measurement.total_line_length_m || 0,
          timestamp: measurement.created_at
        };

        console.log('Loading measurement data directly:', savedData);

        // Directly set the measurements in the hook instead of using localStorage
        measurements.setArea(savedData.area);
        measurements.setPerimeter(savedData.perimeter);
        measurements.setLines(savedData.lines);
        measurements.setSavedMeasurements(savedData);

        // Set appropriate step
        if ((savedData.area && savedData.area > 0) || (savedData.lines && savedData.lines.length > 0)) {
          measurements.setCurrentStep(3);
          if (savedData.lines && savedData.lines.length > 0) {
            measurements.setWorkflowStep('lines');
          }
        }

        // Show success message
        setLoadSuccess(`Previous measurements loaded for this address!`);
        setSubmitSuccess(null);
        setSubmitError(null);
      }

      // Always get the aerial image (even if measurements exist)
      const imageResult = await getAerialImage(geocodeResult.latitude, geocodeResult.longitude);
      measurements.setAerialImage(imageResult);

      if (!existingMeasurements.success || !existingMeasurements.measurement) {
        measurements.setCurrentStep(2);
      }

    } catch (err) {
      console.error('Error:', err);
      measurements.setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      measurements.setLoading(false);
    }
  };

  const toggleDrawingMode = () => {
    setDrawingMode(!drawingMode);
  };


  // Submit handlers
  const handleSubmitSuccess = (id: string) => {
    setSubmitSuccess(`Measurements saved successfully! ID: ${id}`);
    setSubmitError(null);
    setLoadSuccess(null);
  };

  const handleSubmitError = (error: string) => {
    setSubmitError(error);
    setSubmitSuccess(null);
    setLoadSuccess(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Roofing Helper</h1>
        <p className="text-gray-600 text-center">
          Enter a property address to get aerial imagery and measure roof areas
        </p>

        <WorkflowProgress
          currentStep={measurements.currentStep}
          workflowStep={measurements.workflowStep}
        />

        <div className="mt-2 text-center text-sm text-gray-600">
          <span className={measurements.currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Enter Address</span>
          <span className="mx-4">→</span>
          <span className={measurements.currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Get Aerial View</span>
          <span className="mx-4">→</span>
          <span className={measurements.workflowStep === 'area' && measurements.currentStep >= 3 ? 'text-green-600 font-medium' : ''}>Measure Roof Area</span>
          <span className="mx-4">→</span>
          <span className={measurements.workflowStep === 'lines' ? 'text-orange-600 font-medium' : ''}>Measure Cappings</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Property Address</CardTitle>
          <CardDescription>
            Enter the full address of the property you want to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddressSubmit} className="flex gap-2">
            <input
              type="text"
              value={measurements.address}
              onChange={(e) => measurements.setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, Anytown, USA"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={measurements.loading}
              required
            />
            <Button type="submit" disabled={measurements.loading}>
              {measurements.loading ? 'Analyzing...' : 'Get Aerial View'}
            </Button>
          </form>

        </CardContent>
      </Card>

      {measurements.error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{measurements.error}</p>
          </CardContent>
        </Card>
      )}

      {measurements.coordinates && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Property Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Address:</strong> {measurements.coordinates.formattedAddress}</p>
              <p><strong>Coordinates:</strong> {measurements.coordinates.latitude.toFixed(6)}, {measurements.coordinates.longitude.toFixed(6)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {measurements.aerialImage && (
        <Card>
          <CardHeader>
            <CardTitle>Aerial View & Area Measurement</CardTitle>
            <CardDescription>
              Satellite imagery for roofing analysis (Zoom level: {measurements.aerialImage.zoom})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AerialImageDisplay
              aerialImage={measurements.aerialImage}
              workflowStep={measurements.workflowStep}
              drawingMode={drawingMode}
              points={measurements.points}
              lines={measurements.lines}
              area={measurements.area}
              perimeter={measurements.perimeter}
              canvasRef={canvasRef}
              onCanvasClick={handleCanvasClick}
              onToggleDrawing={toggleDrawingMode}
              onClearDrawing={measurements.clearDrawing}
              onClearLines={measurements.clearLines}
              onGoToPrevious={measurements.goToPreviousStep}
              onGoToNext={measurements.goToNextStep}
            />

            <div className="mt-4 text-sm text-gray-600">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p><strong>Step-by-Step Process:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 mt-2">
                    <li className={measurements.currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
                      Enter your property address above
                    </li>
                    <li className={measurements.currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
                      Review the aerial satellite imagery
                    </li>
                    <li className={measurements.workflowStep === 'area' && measurements.currentStep >= 3 ? 'text-green-600 font-medium' : ''}>
                      Area Mode: Trace roof outline with connected points
                    </li>
                    <li className={measurements.workflowStep === 'lines' ? 'text-orange-600 font-medium' : ''}>
                      Capping Mode: Measure cappings with lines
                    </li>
                    <li className="text-gray-500">
                      Review all measurements and export for quotes
                    </li>
                  </ol>
                </div>
                <div>
                  <p><strong>Measuring Controls:</strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li><strong>Area Mode:</strong> Click points around roof perimeter, connect 3+ points</li>
                    <li><strong>Line Mode:</strong> Click once for start, click again for end of each line</li>
                    <li>Use Previous/Next buttons to switch between measurement types</li>
                    <li>Use &quot;Clear Drawing&quot; to start over</li>
                    <li><strong>Shortcuts:</strong> <kbd>Esc</kbd> to exit mode, <kbd>Delete</kbd> to clear</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <MeasurementResults
        area={measurements.area}
        perimeter={measurements.perimeter}
        points={measurements.points}
        lines={measurements.lines}
        savedMeasurements={measurements.savedMeasurements}
        onClearAll={measurements.clearAllMeasurements}
      />

      <ResourcesTable
        area={measurements.area}
        perimeter={measurements.perimeter}
        totalLineLength={measurements.totalLineLength}
        savedMeasurements={measurements.savedMeasurements}
      />

      {measurements.aerialImage && (
        <SubmitMeasurements
          measurements={measurements.savedMeasurements}
          onSuccess={handleSubmitSuccess}
          onError={handleSubmitError}
        />
      )}

      {/* Success/Error feedback */}
      {loadSuccess && (
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <p className="text-blue-800">{loadSuccess}</p>
          </CardContent>
        </Card>
      )}

      {submitSuccess && (
        <Card className="mt-4 bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <p className="text-green-800">{submitSuccess}</p>
          </CardContent>
        </Card>
      )}

      {submitError && (
        <Card className="mt-4 bg-red-50 border-red-200">
          <CardContent className="pt-4">
            <p className="text-red-800">{submitError}</p>
          </CardContent>
        </Card>
      )}

      {!measurements.coordinates && !measurements.loading && !measurements.error && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500">
              Enter an address above to get started with your roofing analysis
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
