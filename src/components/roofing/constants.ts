// Accurate scaling for Google Maps zoom level 20 satellite imagery
export const METERS_PER_PIXEL = 0.10275229357;
export const PIXELS_PER_METER = 1 / METERS_PER_PIXEL;
export const PIXELS_PER_FOOT = PIXELS_PER_METER * 0.3048;

// For backwards compatibility
export const PIXELS_PER_FOOT_LEGACY = 2;

export const WORKFLOW_STEPS = {
    ADDRESS: 1,
    AERIAL_VIEW: 2,
    MEASUREMENTS: 3,
    REVIEW: 4,
} as const;

export const MEASUREMENT_MODES = {
    AREA: "area" as const,
    LINES: "lines" as const,
};

export const STORAGE_KEYS = {
    MEASUREMENTS: "roofing-measurements",
} as const;
