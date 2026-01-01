import { METERS_PER_PIXEL } from "./constants";
import type { LineMeasurement, Point, PolygonMetrics } from "./types";

/**
 * Calculate polygon area and perimeter using the shoelace formula
 */
export function calculatePolygonMetrics(polygonPoints: Point[]): PolygonMetrics {
    if (polygonPoints.length < 3) {
        return { area: 0, perimeter: 0, areaMeters: 0, perimeterMeters: 0 };
    }

    let area = 0;
    let perimeter = 0;
    const n = polygonPoints.length;

    // Calculate area using shoelace formula
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += polygonPoints[i].x * polygonPoints[j].y;
        area -= polygonPoints[j].x * polygonPoints[i].y;
    }
    area = Math.abs(area) / 2;

    // Calculate perimeter
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const dx = polygonPoints[j].x - polygonPoints[i].x;
        const dy = polygonPoints[j].y - polygonPoints[i].y;
        perimeter += Math.sqrt(dx * dx + dy * dy);
    }

    // Convert to real-world measurements
    // Area: pixels² * meters²/pixel² = meters², then convert to feet²
    const areaInMetersSquared = area * (METERS_PER_PIXEL * METERS_PER_PIXEL);
    const areaInFeetSquared = areaInMetersSquared * 10.7639; // 1 m² = 10.7639 ft²

    // Perimeter: pixels * meters/pixel = meters, then convert to feet
    const perimeterInMeters = perimeter * METERS_PER_PIXEL;
    const perimeterInFeet = perimeterInMeters * 3.28084; // 1 meter = 3.28084 feet

    return {
        area: areaInFeetSquared,
        perimeter: perimeterInFeet,
        areaMeters: areaInMetersSquared,
        perimeterMeters: perimeterInMeters,
    };
}

/**
 * Calculate the distance between two points in feet
 */
export function calculateDistance(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy);
    const distanceInMeters = distanceInPixels * METERS_PER_PIXEL;
    return distanceInMeters * 3.28084; // Convert meters to feet
}

/**
 * Calculate the distance between two points in meters
 */
export function calculateDistanceMeters(point1: Point, point2: Point): number {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    const distanceInPixels = Math.sqrt(dx * dx + dy * dy);
    return distanceInPixels * METERS_PER_PIXEL;
}

/**
 * Create a line measurement from two points
 */
export function createLineMeasurement(start: Point, end: Point): LineMeasurement {
    return {
        start,
        end,
        length: calculateDistance(start, end),
        lengthMeters: calculateDistanceMeters(start, end),
    };
}

/**
 * Calculate total length of all lines
 */
export function calculateTotalLineLength(lines: LineMeasurement[]): number {
    return lines.reduce((sum, line) => sum + line.length, 0);
}
