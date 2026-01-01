import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AerialImageResult } from "./aerial-image";
import type { GeocodeResult } from "./geocoding";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Client-side API functions that call the server-side routes
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
    const response = await fetch("/api/geocoding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to geocode address");
    }

    return response.json();
}

export async function getAerialImage(latitude: number, longitude: number, zoom?: number): Promise<AerialImageResult> {
    const response = await fetch("/api/aerial-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude, zoom }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get aerial image");
    }

    return response.json();
}

export async function scrapeProductData(url: string): Promise<{
    name: string;
    price: number;
    unitType: string;
    coverageArea: number;
    currency: string;
}> {
    const response = await fetch("/api/scrape-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to scrape product data");
    }

    return response.json();
}

export async function getOrUpdateProductPrice(url: string): Promise<{
    name: string;
    price: number;
    unitType: string;
    coverageArea: number;
    lastUpdated: string;
}> {
    try {
        // First check if we have recent data in database
        const { getRoofingProduct, saveRoofingProduct, isProductDataStale } = await import("./database");

        const existingProduct = await getRoofingProduct(url);

        if (existingProduct.success && existingProduct.product && !isProductDataStale(existingProduct.product.last_updated)) {
            // Use existing data
            return {
                name: existingProduct.product.name,
                price: existingProduct.product.price_per_unit,
                unitType: existingProduct.product.unit_type,
                coverageArea: existingProduct.product.coverage_area,
                lastUpdated: existingProduct.product.last_updated,
            };
        }

        // Data is stale or doesn't exist, scrape new data
        console.log("Fetching fresh product data from web...");
        const scrapedData = await scrapeProductData(url);

        // Save to database
        const productData = {
            name: scrapedData.name,
            url: url,
            price_per_unit: scrapedData.price,
            unit_type: scrapedData.unitType,
            coverage_area: scrapedData.coverageArea,
            last_updated: new Date().toISOString(),
        };

        await saveRoofingProduct(productData);

        return {
            name: scrapedData.name,
            price: scrapedData.price,
            unitType: scrapedData.unitType,
            coverageArea: scrapedData.coverageArea,
            lastUpdated: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Error getting product price:", error);
        // Return fallback data based on URL
        if (url.includes("feltbuster") || url.includes("1000800427")) {
            return {
                name: "GAF FeltBuster Synthetic Roofing Underlayment",
                price: 151.0,
                unitType: "sqft",
                coverageArea: 1000,
                lastUpdated: new Date().toISOString(),
            };
        } else if (url.includes("timberline") || url.includes("1000730987")) {
            return {
                name: "GAF Timberline HDZ Weathered Wood High Definition Roof Shingles",
                price: 45.11,
                unitType: "sqft",
                coverageArea: 33.3,
                lastUpdated: new Date().toISOString(),
            };
        } else if (url.includes("weatherwatch") || url.includes("1000731325")) {
            return {
                name: "GAF WeatherWatch Mineral Surfaced Peel and Stick Roof Leak Barrier",
                price: 97.96,
                unitType: "sqft",
                coverageArea: 200,
                lastUpdated: new Date().toISOString(),
            };
        } else if (url.includes("weatherblocker") || url.includes("1000731326")) {
            return {
                name: "GAF WeatherBlocker Premium Eave and Rake Roof Starter Strip Shingles",
                price: 65.75,
                unitType: "linear_foot",
                coverageArea: 50,
                lastUpdated: new Date().toISOString(),
            };
        } else if (url.includes("timbertex") || url.includes("1001016707")) {
            return {
                name: "GAF Timbertex Charcoal Premium Hip and Ridge Cap Roof Shingles",
                price: 59.75, // Correct price from Home Depot
                unitType: "linear_foot",
                coverageArea: 20,
                lastUpdated: new Date().toISOString(),
            };
        } else {
            // Generic fallback
            return {
                name: "Unknown Roofing Product",
                price: 0,
                unitType: "unit",
                coverageArea: 1,
                lastUpdated: new Date().toISOString(),
            };
        }
    }
}
