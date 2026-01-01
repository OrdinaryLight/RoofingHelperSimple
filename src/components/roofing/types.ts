export interface Point {
    x: number;
    y: number;
}

export interface GeocodeResult {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export interface AerialImageResult {
    imageUrl: string;
    latitude: number;
    longitude: number;
    zoom: number;
}

export interface LineMeasurement {
    start: Point;
    end: Point;
    length: number; // in feet
    lengthMeters: number; // in meters
}

export interface PolygonMetrics {
    area: number; // in square feet
    perimeter: number; // in feet
    areaMeters: number; // in square meters
    perimeterMeters: number; // in meters
}

export interface SavedMeasurements {
    address: string;
    coordinates: { lat: number; lng: number };
    area: number; // square feet
    perimeter: number; // feet
    areaMeters: number; // square meters
    perimeterMeters: number; // meters
    points: Point[];
    lines: LineMeasurement[];
    totalLineLength: number; // feet
    totalLineLengthMeters: number; // meters
    timestamp: string;
}

export type WorkflowStep = "area" | "lines";
export type DrawingMode = "area" | "lines";
