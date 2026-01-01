import { NextRequest, NextResponse } from 'next/server';

export interface AerialImageResult {
  imageUrl: string;
  latitude: number;
  longitude: number;
  zoom: number;
}

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude, zoom = 20 } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Google Maps Static API parameters
    const size = "640x640"; // Maximum size for free tier
    const maptype = "satellite";
    const scale = "1"; // For higher resolution

    const imageUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=${zoom}&size=${size}&maptype=${maptype}&scale=${scale}&key=${apiKey}`;

    const result: AerialImageResult = {
      imageUrl,
      latitude,
      longitude,
      zoom,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Aerial image error:', error);
    return NextResponse.json(
      { error: 'Failed to get aerial image' },
      { status: 500 }
    );
  }
}
