// takes in an address and returns coordinates along with a formatted address

export interface GeocodeResult {
    latitude: number;
    longitude: number;
    formattedAddress: string;
}

export interface GeocodeError {
    message: string;
    status: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        throw new Error("Google Maps API key not configured");
    }

    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK") {
            throw new Error(`Geocoding failed: ${data.status}`);
        }

        if (!data.results || data.results.length === 0) {
            throw new Error("No results found for this address");
        }

        const result = data.results[0];
        const location = result.geometry.location;

        return {
            latitude: location.lat,
            longitude: location.lng,
            formattedAddress: result.formatted_address,
        };
    } catch (error) {
        // makes sure all errors are of type Error
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to geocode address");
    }
}
