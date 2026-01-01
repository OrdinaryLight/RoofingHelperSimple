export interface AerialImageResult {
    imageUrl: string;
    latitude: number;
    longitude: number;
    zoom: number;
}

export async function getAerialImage(latitude: number, longitude: number, zoom: number = 20): Promise<AerialImageResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Google Maps API key not configured");
    }

    // Google Maps Static API parameters
    const size = "640x640"; // Maximum size for free tier
    const maptype = "satellite";
    const scale = "1"; // For higher resolution

    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${size}&maptype=${maptype}&scale=${scale}&key=${apiKey}`;

    return {
        imageUrl,
        latitude,
        longitude,
        zoom,
    };
}
