import { NextRequest, NextResponse } from "next/server";
import * as turf from "@turf/turf";
import { calculateSolarEstimate } from "../../../../lib/engine/solar";
import { TARIFF_PLANS, Discom } from "../../../../config/tariffs";
import { getSolarIrradiance } from "../../../../lib/services/openMeteo";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      polygon,
      monthlyKwh,
      discom,
      sensitivityCloudierYear,
      sensitivityFlatTariff,
    } = body;

    if (!polygon || polygon.type !== "Polygon" || !Array.isArray(polygon.coordinates)) {
      return NextResponse.json(
        { error: { code: "INVALID_GEOMETRY", message: "A valid GeoJSON Polygon is required" } },
        { status: 400 }
      );
    }

    const turfPolygon = turf.polygon(polygon.coordinates);

    // 1. Validation: Self-intersection (turf.kinks)
    const kinks = turf.kinks(turfPolygon);
    if (kinks.features.length > 0) {
      return NextResponse.json(
        {
          error: {
            code: "SELF_INTERSECTING_POLYGON",
            message: "Rooftop boundary cannot self-intersect. Please adjust vertices to create a clean perimeter.",
          },
        },
        { status: 422 }
      );
    }

    // 2. Validation: Area limits (>= 10 m², hard cap 20,000 m²)
    const areaSqM = Math.round(turf.area(turfPolygon) * 100) / 100;
    if (areaSqM < 10) {
      return NextResponse.json(
        {
          error: {
            code: "AREA_TOO_SMALL",
            message: `Selected rooftop area is ${areaSqM} m². A minimum of 10 m² is required for a viable solar installation.`,
          },
        },
        { status: 422 }
      );
    }

    if (areaSqM > 20000) {
      return NextResponse.json(
        {
          error: {
            code: "AREA_EXCEEDS_MAX",
            message: `Rooftop area (${areaSqM} m²) exceeds maximum residential threshold (20,000 m²).`,
          },
        },
        { status: 422 }
      );
    }

    // 3. Centroid calculation
    const centroidFeature = turf.centroid(turfPolygon);
    const [centroidLng, centroidLat] = centroidFeature.geometry.coordinates;

    // 4. Fetch live/fallback irradiance for centroid
    const irradiance = await getSolarIrradiance(centroidLat, centroidLng);

    // 5. Tariff plan resolution
    const plan = discom ? TARIFF_PLANS[discom as Discom] : TARIFF_PLANS.UGVCL;

    // 6. Calculate Solar Estimation with pure engine
    const estimate = calculateSolarEstimate({
      totalPolygonAreaSqM: areaSqM,
      peakSunHoursPerDay: irradiance.peakSunHoursPerDay,
      monthlyKwhConsumption: monthlyKwh,
      tariffPlan: plan,
      sensitivityCloudierYear,
      sensitivityFlatTariff,
    });

    return NextResponse.json({
      estimate,
      areaSqM,
      areaSqFt: Math.round(areaSqM * 10.7639 * 100) / 100,
      centroid: { lat: centroidLat, lng: centroidLng },
      irradianceSnapshot: irradiance,
      isOfflineFallback: irradiance.isOfflineFallback,
    });
  } catch (err: any) {
    console.error("Solar estimate API error:", err);
    return NextResponse.json(
      { error: { code: "ESTIMATION_FAILED", message: err.message || "Failed to compute solar estimate" } },
      { status: 500 }
    );
  }
}
