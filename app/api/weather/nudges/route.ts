import { NextRequest, NextResponse } from "next/server";
import { getSolarIrradiance } from "../../../../lib/services/openMeteo";
import { evaluateWeatherNudges, getIstHour, WeatherDataPoint } from "../../../../lib/engine/nudges";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const hasSlabAlert = searchParams.get("slabAlert") === "true";

  const lat = latStr ? parseFloat(latStr) : 23.0225;
  const lng = lngStr ? parseFloat(lngStr) : 72.5714;

  try {
    const irradianceData = await getSolarIrradiance(lat, lng);
    const curr = irradianceData.current;
    const istHour = getIstHour();

    const weatherPoint: WeatherDataPoint = {
      temperature2m: curr.temperature2m,
      relativeHumidity2m: curr.relativeHumidity2m,
      shortwaveRadiation: curr.shortwaveRadiation,
      uvIndex: curr.shortwaveRadiation > 600 ? 8.5 : 4.0, // derive reasonable UV index from radiation
      precipitationProbability: 10,
      precipitationMm: 0,
      isDay: curr.isDay,
      localHourIst: istHour,
    };

    const nudges = evaluateWeatherNudges(weatherPoint, hasSlabAlert);

    return NextResponse.json({
      nudges,
      weather: {
        temperature: curr.temperature2m,
        humidity: curr.relativeHumidity2m,
        solarRadiationWp: curr.shortwaveRadiation,
        hourIst: istHour,
        fetchedAt: curr.fetchedAt,
      },
      isOfflineFallback: irradianceData.isOfflineFallback,
      source: irradianceData.source,
    });
  } catch (err) {
    console.error("Weather nudges API error:", err);
    return NextResponse.json(
      { error: { code: "NUDGES_FAILED", message: "Failed to evaluate weather nudges" } },
      { status: 500 }
    );
  }
}
