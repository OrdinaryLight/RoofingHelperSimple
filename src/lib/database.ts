// Lazy load supabase to avoid SSR issues
let supabaseClient: any = null;

const getSupabase = () => {
    if (!supabaseClient) {
        try {
            const { supabase } = require("./supabase");
            supabaseClient = supabase;
        } catch (error) {
            console.warn("Supabase not available:", error);
            return null;
        }
    }
    return supabaseClient;
};

// Local type definition to avoid circular imports
export interface SavedMeasurements {
    address: string;
    coordinates: { lat: number; lng: number };
    area: number;
    perimeter: number;
    areaMeters: number;
    perimeterMeters: number;
    points: Array<{ x: number; y: number }>;
    lines: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; length: number; lengthMeters: number }>;
    totalLineLength: number;
    totalLineLengthMeters: number;
    timestamp: string;
}

export interface DatabaseMeasurement {
    id: string;
    property_address: string;
    coordinates: any;
    area_sqft: number | null;
    area_sqm: number | null;
    perimeter_ft: number | null;
    perimeter_m: number | null;
    lines_data: any;
    total_line_length_ft: number | null;
    total_line_length_m: number | null;
    created_at: string;
    updated_at: string;
}

export interface RoofingProduct {
    id: string;
    name: string;
    url: string;
    price_per_unit: number;
    unit_type: string; // 'sqft', 'linear_foot', etc.
    coverage_area: number; // how much area one unit covers
    last_updated: string;
    created_at: string;
}

/**
 * Save measurements to database
 */
export async function saveMeasurements(measurements: SavedMeasurements): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Database not available" };
        }

        const dbMeasurement = {
            property_address: measurements.address,
            coordinates: measurements.coordinates,
            area_sqft: measurements.area,
            area_sqm: measurements.areaMeters,
            perimeter_ft: measurements.perimeter,
            perimeter_m: measurements.perimeterMeters,
            lines_data: measurements.lines,
            total_line_length_ft: measurements.totalLineLength,
            total_line_length_m: measurements.totalLineLengthMeters,
        };

        const { data, error } = await supabase
            .from("roofing_measurements")
            .upsert(dbMeasurement, {
                onConflict: "property_address",
                ignoreDuplicates: false,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Error saving measurements:", error);
            return { success: false, error: error?.message || error?.details || "Database error saving measurements" };
        }

        return { success: true, id: data.id };
    } catch (error) {
        console.error("Error saving measurements:", error);
        return { success: false, error: "Failed to save measurements" };
    }
}

export async function loadMeasurements(): Promise<{ success: boolean; measurements?: DatabaseMeasurement[]; error?: string }> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Database not available" };
        }

        console.log("Loading all measurements from database");
        const { data, error } = await supabase.from("roofing_measurements").select("*").order("updated_at", { ascending: false });
        console.log("All measurements result:", { data, error });

        if (error) {
            console.error("Error loading measurements:", error);
            return { success: false, error: error?.message || error?.details || "Database error loading measurements" };
        }

        return { success: true, measurements: data };
    } catch (error) {
        console.error("Error loading measurements:", error);
        return { success: false, error: "Failed to load measurements" };
    }
}

/**
 * Load specific measurement by address
 */
// Product management functions
export async function getRoofingProduct(url: string): Promise<{ success: boolean; product?: RoofingProduct; error?: string }> {
    try {
        console.log("Getting roofing product for URL:", url);
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Database not available" };
        }

        const { data, error } = await supabase.from("roofing_products").select("*").eq("url", url).single();

        if (error && error.code !== "PGRST116") {
            console.log("Error getting product:", error);
            return { success: false, error: error?.message || error?.details || "Database error getting product" };
        }

        console.log("Product data:", data);
        return { success: true, product: data };
    } catch (error) {
        console.error("Error getting roofing product:", error);
        return { success: false, error: "Failed to get roofing product" };
    }
}

export async function saveRoofingProduct(product: Omit<RoofingProduct, "id" | "created_at">): Promise<{ success: boolean; product?: RoofingProduct; error?: string }> {
    try {
        console.log("Saving roofing product:", product);
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Database not available" };
        }

        const { data, error } = await supabase
            .from("roofing_products")
            .upsert(
                {
                    name: product.name,
                    url: product.url,
                    price_per_unit: product.price_per_unit,
                    unit_type: product.unit_type,
                    coverage_area: product.coverage_area,
                    last_updated: new Date().toISOString(),
                },
                {
                    onConflict: "url",
                }
            )
            .select()
            .single();

        if (error) {
            console.error("Error saving product:", error);
            return { success: false, error: error?.message || error?.details || "Database error saving product" };
        }

        console.log("Product saved:", data);
        return { success: true, product: data };
    } catch (error) {
        console.error("Error saving roofing product:", error);
        return { success: false, error: "Failed to save roofing product" };
    }
}

export function isProductDataStale(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 7; // More than 7 days old
}

export async function loadMeasurementByAddress(address: string): Promise<{ success: boolean; measurement?: DatabaseMeasurement; error?: string }> {
    try {
        console.log("loadMeasurementByAddress called with:", address);
        const supabase = getSupabase();
        if (!supabase) {
            console.log("Supabase not available");
            return { success: false, error: "Database not available" };
        }

        console.log("Querying database for address:", address);

        // First try exact match
        let { data, error } = await supabase.from("roofing_measurements").select("*").eq("property_address", address).single();

        // If not found, try case-insensitive match
        if (error && error.code === "PGRST116") {
            console.log("Exact match not found, trying case-insensitive search");
            const { data: fuzzyData, error: fuzzyError } = await supabase.from("roofing_measurements").select("*").ilike("property_address", `%${address}%`).limit(1).single();

            if (!fuzzyError && fuzzyData) {
                data = fuzzyData;
                error = null;
                console.log("Found with fuzzy match:", fuzzyData);
            }
        }

        console.log("Database query result:", { data, error });

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows returned
            console.error("Error loading measurement:", error);
            return { success: false, error: error?.message || error?.details || "Database error loading measurement" };
        }

        return { success: true, measurement: data };
    } catch (error) {
        console.error("Error loading measurement:", error);
        return { success: false, error: "Failed to load measurement" };
    }
}

/**
 * Delete a measurement
 */
export async function deleteMeasurement(id: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = getSupabase();
        if (!supabase) {
            return { success: false, error: "Database not available" };
        }

        const { error } = await supabase.from("roofing_measurements").delete().eq("id", id);

        if (error) {
            console.error("Error deleting measurement:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting measurement:", error);
        return { success: false, error: "Failed to delete measurement" };
    }
}
