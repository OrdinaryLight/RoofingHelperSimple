import { useEffect, useState } from "react";
import { calculatePolygonMetrics, createLineMeasurement } from "../calculations";
import { STORAGE_KEYS } from "../constants";
import type { GeocodeResult, LineMeasurement, Point, SavedMeasurements, WorkflowStep } from "../types";

interface UseMeasurementsReturn {
    // State
    address: string;
    coordinates: any;
    aerialImage: any;
    loading: boolean;
    error: string;
    currentStep: number;
    workflowStep: WorkflowStep;
    points: Point[];
    lines: LineMeasurement[];
    linePoints: Point[];
    isDrawingLine: boolean;
    area: number;
    perimeter: number;
    totalLineLength: number;
    savedMeasurements: SavedMeasurements | null;

    // Actions
    setAddress: (address: string) => void;
    setCoordinates: (coords: any) => void;
    setAerialImage: (image: any) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string) => void;
    setCurrentStep: (step: number) => void;
    setWorkflowStep: (step: WorkflowStep) => void;
    setPoints: (points: Point[]) => void;
    setLines: (lines: LineMeasurement[]) => void;
    setLinePoints: (points: Point[]) => void;
    setIsDrawingLine: (drawing: boolean) => void;
    setArea: (area: number) => void;
    setPerimeter: (perimeter: number) => void;
    setSavedMeasurements: (measurements: SavedMeasurements | null) => void;

    // Helper functions
    addPoint: (point: Point) => void;
    addLinePoint: (point: Point) => void;
    clearDrawing: () => void;
    clearLines: () => void;
    clearAllMeasurements: () => void;
    reloadMeasurements: () => void;
    goToNextStep: () => void;
    goToPreviousStep: () => void;
}

export function useMeasurements(): UseMeasurementsReturn {
    // Basic state
    const [address, setAddress] = useState("");
    const [coordinates, setCoordinates] = useState<GeocodeResult | null>(null);
    const [aerialImage, setAerialImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Workflow state
    const [currentStep, setCurrentStep] = useState(1);
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>("area");

    // Drawing state
    const [points, setPoints] = useState<Point[]>([]);
    const [lines, setLines] = useState<LineMeasurement[]>([]);
    const [linePoints, setLinePoints] = useState<Point[]>([]);
    const [isDrawingLine, setIsDrawingLine] = useState(false);

    // Computed values
    const totalLineLength = lines.reduce((sum, line) => sum + line.length, 0);

    // Calculations
    const [area, setArea] = useState(0);
    const [perimeter, setPerimeter] = useState(0);
    const [savedMeasurements, setSavedMeasurements] = useState<SavedMeasurements | null>(null);

    // Load basic measurements from localStorage but don't set savedMeasurements
    // savedMeasurements should only be set when loaded from database after search
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
        if (saved) {
            try {
                const measurements: SavedMeasurements = JSON.parse(saved);
                // Only restore basic measurement data, not savedMeasurements
                if (measurements.area) {
                    setArea(measurements.area);
                    setPerimeter(measurements.perimeter);
                    setPoints(measurements.points || []);
                }
                if (measurements.lines) {
                    setLines(measurements.lines);
                }
                // Don't set savedMeasurements here - that should only happen from database
            } catch (error) {
                console.error("Error loading saved measurements:", error);
            }
        }
    }, []);

    // Save measurements whenever they change
    useEffect(() => {
        if (coordinates && (area > 0 || lines.length > 0)) {
            const measurements: SavedMeasurements = {
                address: coordinates.formattedAddress,
                coordinates: { lat: coordinates.latitude, lng: coordinates.longitude },
                area,
                perimeter,
                areaMeters: area / 10.7639, // Convert sq ft to sq meters
                perimeterMeters: perimeter / 3.28084, // Convert ft to meters
                points,
                lines,
                totalLineLength: lines.reduce((sum, line) => sum + line.length, 0),
                totalLineLengthMeters: lines.reduce((sum, line) => sum + line.lengthMeters, 0),
                timestamp: new Date().toISOString(),
            };
            localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
            setSavedMeasurements(measurements);
        }
    }, [coordinates, area, perimeter, points, lines]);

    // Update calculations when points change
    useEffect(() => {
        if (points.length > 0) {
            const metrics = calculatePolygonMetrics(points);
            setArea(metrics.area);
            setPerimeter(metrics.perimeter);
        } else {
            setArea(0);
            setPerimeter(0);
        }
    }, [points]);

    // Helper functions
    const addPoint = (point: Point) => {
        const newPoints = [...points, point];
        setPoints(newPoints);
        if (newPoints.length >= 3) {
            setCurrentStep(3);
        }
    };

    const addLinePoint = (point: Point) => {
        if (!isDrawingLine) {
            // Start new line
            setLinePoints([point]);
            setIsDrawingLine(true);
        } else {
            // Complete line
            const newLines = [...lines, createLineMeasurement(linePoints[0], point)];
            setLines(newLines);
            setLinePoints([]);
            setIsDrawingLine(false);
        }
    };

    const clearDrawing = () => {
        setPoints([]);
        setArea(0);
        setPerimeter(0);
    };

    const clearLines = () => {
        setLines([]);
        setLinePoints([]);
        setIsDrawingLine(false);
    };

    const clearAllMeasurements = () => {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.MEASUREMENTS);

        // Reset all state
        setAddress("");
        setCoordinates(null);
        setAerialImage(null);
        setLoading(false);
        setError("");
        setCurrentStep(1);
        setWorkflowStep("area");
        setPoints([]);
        setLines([]);
        setLinePoints([]);
        setIsDrawingLine(false);
        setArea(0);
        setPerimeter(0);
        setSavedMeasurements(null);
    };

    const reloadMeasurements = () => {
        // Reload from localStorage
        const saved = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
        if (saved) {
            try {
                const measurements: SavedMeasurements = JSON.parse(saved);
                console.log("Reloading measurements from localStorage:", measurements);

                // Restore area measurements
                setArea(measurements.area || 0);
                setPerimeter(measurements.perimeter || 0);
                setPoints(measurements.points || []);
                console.log("Set area:", measurements.area, "perimeter:", measurements.perimeter);

                // Restore line measurements
                if (measurements.lines) {
                    setLines(measurements.lines);
                    console.log("Set lines:", measurements.lines.length);
                }

                // Update saved measurements
                setSavedMeasurements(measurements);

                // Set appropriate step
                if ((measurements.area && measurements.area > 0) || (measurements.lines && measurements.lines.length > 0)) {
                    setCurrentStep(3);
                    if (measurements.lines && measurements.lines.length > 0) {
                        setWorkflowStep("lines");
                    }
                }
            } catch (error) {
                console.error("Error reloading measurements:", error);
            }
        }
    };

    const goToNextStep = () => {
        if (workflowStep === "area") {
            setWorkflowStep("lines");
            clearLines();
        }
    };

    const goToPreviousStep = () => {
        if (workflowStep === "lines") {
            setWorkflowStep("area");
            clearLines();
        }
    };

    return {
        // State
        address,
        coordinates,
        aerialImage,
        loading,
        error,
        currentStep,
        workflowStep,
        points,
        lines,
        linePoints,
        isDrawingLine,
        area,
        perimeter,
        totalLineLength,
        savedMeasurements,

        // Actions
        setAddress,
        setCoordinates,
        setAerialImage,
        setLoading,
        setError,
        setCurrentStep,
        setWorkflowStep,
        setPoints,
        setLines,
        setLinePoints,
        setIsDrawingLine,
        setArea,
        setPerimeter,
        setSavedMeasurements,

        // Helper functions
        addPoint,
        addLinePoint,
        clearDrawing,
        clearLines,
        clearAllMeasurements,
        reloadMeasurements,
        goToNextStep,
        goToPreviousStep,
    };
}
