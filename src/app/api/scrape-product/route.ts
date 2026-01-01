import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

interface ProductResult {
    name: string;
    price: number;
    unitType: "sqft" | "linear_foot" | "unit";
    coverageArea: number;
    currency: string;
    sku?: string;
}

// Simple in-memory rate limiter (resets on server restart)
const lastRequest = new Map<string, number>();
const RATE_LIMIT_MS = 2000; // 2 seconds between requests per domain

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    let url = "";

    try {
        const body = await request.json();
        url = body.url;

        if (!url || typeof url !== "string") {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        // Rate limiting
        const domain = new URL(url).hostname;
        const now = Date.now();
        const last = lastRequest.get(domain) || 0;

        if (now - last < RATE_LIMIT_MS) {
            const waitTime = RATE_LIMIT_MS - (now - last);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
        lastRequest.set(domain, Date.now());

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const res = await fetch(url, {
            headers: {
                // Realistic UA prevents stripped HTML
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                "Accept-Language": "en-CA,en;q=0.9",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // =========================
        // 1) Try JSON-LD (fastest)
        // =========================
        let product: Partial<ProductResult> = {};

        $('script[type="application/ld+json"]').each((_, el) => {
            try {
                const json = JSON.parse($(el).text());
                if (json["@type"] === "Product") {
                    product.name = json.name;
                    product.sku = json.sku;

                    if (json.offers) {
                        const price = Number(json.offers.price);
                        if (isNaN(price) || price <= 0 || price > 10000) {
                            throw new Error(`Invalid price from JSON-LD: ${price}`);
                        }
                        product.price = price;
                        product.currency = json.offers.priceCurrency || "CAD";
                    }
                }
            } catch {}
        });

        // =================================
        // 2) Fallback: __NEXT_DATA__ parsing
        // =================================
        if (!product.name || product.price == null) {
            const nextDataRaw = $("#__NEXT_DATA__").text();
            if (nextDataRaw) {
                const nextData = JSON.parse(nextDataRaw);

                const pageProps = nextData?.props?.pageProps;

                // Heuristic search for product object (depth-limited)
                const findProduct = (obj: any, depth = 0): any => {
                    if (depth > 10) return null; // Prevent infinite recursion
                    if (!obj || typeof obj !== "object") return null;

                    // More specific checks for product objects
                    if (obj.name && typeof obj.name === "string" && (obj.price || obj.pricing || obj.currentPrice)) {
                        return obj;
                    }

                    for (const key of Object.keys(obj)) {
                        const found = findProduct(obj[key], depth + 1);
                        if (found) return found;
                    }
                    return null;
                };

                const prod = findProduct(pageProps);
                if (prod) {
                    product.name = product.name ?? prod.name;

                    const price = Number(prod.price ?? prod.pricing?.currentPrice ?? prod.pricing?.price);
                    if (!isNaN(price) && price > 0 && price <= 10000) {
                        product.price = product.price ?? price;
                    }

                    product.currency = product.currency ?? "CAD";
                    product.sku = product.sku ?? prod.sku;
                }
            }
        }

        if (!product.name || product.price == null) {
            throw new Error("Could not extract product data");
        }

        // =================================
        // 3) Infer unit type + coverage
        // =================================
        const name = product.name.toLowerCase();

        let unitType: ProductResult["unitType"] = "unit";
        let coverageArea = 1;

        // More robust patterns for unit detection
        const patterns = [
            { regex: /([\d.]+)\s*(?:sq\.?\s*)?ft/i, unit: "sqft" as const },
            { regex: /([\d.]+)\s*lin\.?\s*ft/i, unit: "linear_foot" as const },
            { regex: /([\d.]+)\s*ft\.?\s*(?:long|lin|linear)?/i, unit: "linear_foot" as const },
        ];

        for (const { regex, unit } of patterns) {
            const match = name.match(regex);
            if (match) {
                unitType = unit;
                coverageArea = Number(match[1]);
                break;
            }
        }

        const result: ProductResult = {
            name: product.name,
            price: product.price,
            unitType,
            coverageArea,
            currency: product.currency ?? "CAD",
            sku: product.sku,
        };

        return NextResponse.json(result, {
            headers: {
                "Cache-Control": "public, max-age=3600", // Cache for 1 hour
            },
        });
    } catch (error) {
        console.error("Scraping error for URL:", url, error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        // Specific error handling
        if (error instanceof Error && error.name === "AbortError") {
            return NextResponse.json(
                {
                    error: "Request timeout - website took too long to respond",
                    url: url,
                },
                { status: 408 }
            );
        }

        if (errorMessage.includes("HTTP")) {
            return NextResponse.json(
                {
                    error: `Website error: ${errorMessage}`,
                    url: url,
                },
                { status: 502 }
            );
        }

        return NextResponse.json(
            {
                error: `Scraping failed: ${errorMessage}`,
                url: url,
            },
            { status: 500 }
        );
    }
}
