import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, checkRateLimit } from "../../../lib/services/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  // Rate limiting (60 req/min)
  const ip = request.headers.get("x-forwarded-for") || "local";
  if (!checkRateLimit(`nominatim:${ip}`, 30, 60000)) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many search requests. Please wait a moment." } },
      { status: 429 }
    );
  }

  const cacheKey = `geocode:${q.toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Append Gujarat to search query if not present to bias to Gujarat
    const queryWithGujarat = q.toLowerCase().includes("gujarat") ? q : `${q}, Gujarat`;
    const encoded = encodeURIComponent(queryWithGujarat);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&countrycodes=in&viewbox=68.1,24.7,74.5,20.1&bounded=1&limit=6`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "MissionLiFEGujarat-GEDA-CitizenPlatform/1.0 (contact: info@geda.gujarat.gov.in)",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Nominatim responded with status ${res.status}`);
    }

    const data = await res.json();
    const formatted = data.map((item: any) => ({
      placeId: item.place_id,
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
    }));

    setCached(cacheKey, formatted, 3600); // 1 hour cache
    return NextResponse.json(formatted);
  } catch (err) {
    console.warn("Nominatim proxy error, falling back to local city match:", err);

    // Fallback: local Gujarat city lookup
    const fallbackCities = [
      { displayName: "Ahmedabad, Gujarat, India", lat: 23.0225, lng: 72.5714 },
      { displayName: "Gandhinagar, Gujarat, India", lat: 23.2156, lng: 72.6369 },
      { displayName: "Surat, Gujarat, India", lat: 21.1702, lng: 72.8311 },
      { displayName: "Vadodara, Gujarat, India", lat: 22.3072, lng: 73.1812 },
      { displayName: "Rajkot, Gujarat, India", lat: 22.3039, lng: 70.8022 },
      { displayName: "Vastrapur, Ahmedabad, Gujarat", lat: 23.0353, lng: 72.5283 },
      { displayName: "Athwa, Surat, Gujarat", lat: 21.1715, lng: 72.7958 },
      { displayName: "Alkapuri, Vadodara, Gujarat", lat: 22.3108, lng: 73.1706 },
    ];

    const matched = fallbackCities.filter((c) =>
      c.displayName.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json(matched.length > 0 ? matched : fallbackCities.slice(0, 3));
  }
}
