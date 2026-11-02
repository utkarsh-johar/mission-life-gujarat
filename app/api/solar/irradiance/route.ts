import { NextRequest, NextResponse } from "next/server";
import { getSolarIrradiance } from "../../../../lib/services/openMeteo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  const lat = latStr ? parseFloat(latStr) : 23.0225; // Default Ahmedabad
  const lng = lngStr ? parseFloat(lngStr) : 72.5714;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: { code: "INVALID_COORDINATES", message: "lat and lng must be valid numbers" } },
      { status: 400 }
    );
  }

  try {
    const data = await getSolarIrradiance(lat, lng);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Irradiance API error:", err);
    return NextResponse.json(
      { error: { code: "IRRADIANCE_ERROR", message: "Failed to retrieve solar irradiance" } },
      { status: 500 }
    );
  }
}
