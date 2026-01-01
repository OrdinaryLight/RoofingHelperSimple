import type { LineMeasurement, Point } from "./types";

/**
 * Draw a polygon on the canvas
 */
export function drawPolygon(
    ctx: CanvasRenderingContext2D,
    points: Point[],
    strokeColor: string = "#ff0000",
    fillColor: string = "rgba(255, 0, 0, 0.1)",
    lineWidth: number = 3
): void {
    if (points.length === 0) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = fillColor;

    // Draw lines between points
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    if (points.length > 2) {
        ctx.closePath();
        ctx.fill();
    }

    ctx.stroke();

    // Draw points
    ctx.fillStyle = strokeColor;
    points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
        ctx.fill();

        // White border for points
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
    });
}

/**
 * Draw lines on the canvas
 */
export function drawLines(
    ctx: CanvasRenderingContext2D,
    lines: LineMeasurement[],
    currentPoints: Point[],
    strokeColor: string = "#ff4444",
    previewColor: string = "#ffaa44"
): void {
    // Draw completed lines
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();

        // Draw line endpoints
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(line.start.x, line.start.y, 4, 0, 2 * Math.PI);
        ctx.arc(line.end.x, line.end.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });

    // Draw current line being drawn
    if (currentPoints.length > 0) {
        ctx.strokeStyle = previewColor;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

        if (currentPoints.length === 1) {
            // Show point for first click
            ctx.arc(currentPoints[0].x, currentPoints[0].y, 4, 0, 2 * Math.PI);
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }
}

/**
 * Clear the entire canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Get canvas coordinates from mouse event
 */
export function getCanvasCoordinates(e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    return { x, y };
}

/**
 * Check if coordinates are within canvas bounds
 */
export function isWithinCanvas(x: number, y: number, canvas: HTMLCanvasElement): boolean {
    return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
}
