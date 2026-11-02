import { getCached, setCached } from "./cache";
import { GUJARAT_CITY_GHI } from "../../config/solar";

export interface HourlyIrradiancePoint {
  time: string; // ISO or HH:mm
  hour: number;
  shortwaveRadiation: number; // W/m²
  directNormalIrradiance: number; // W/m²
  cloudCover: number; // %
}

export interface SolarIrradianceResponse {
  current: {
    temperature2m: number;
    relativeHumidity2m: number;
    cloudCover: number;
    shortwaveRadiation: number;
    directNormalIrradiance: number;
    isDay: number;
    fetchedAt: string;
  };
  hourlyToday: HourlyIrradiancePoint[];
  annualGhiKwhPerM2: number;
  peakSunHoursPerDay: number;
  isOfflineFallback: boolean;
  source: string;
  gridKey: string;
}

export async function fetchWithTimeout(url: string, timeoutMs = 7000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Generates synthetic sunny day irradiance curve for offline fallback
 */
function generateSeededHourlyToday(): HourlyIrradiancePoint[] {
  const points: HourlyIrradiancePoint[] = [];
  for (let h = 0; h < 24; h++) {
    let radiation = 0;
    let dni = 0;
    if (h >= 6 && h <= 18) {
      // Bell curve peaked at 12-13 with ~850 W/m² max
      const factor = Math.sin(((h - 6) / 12) * Math.PI);
      radiation = Math.round(factor * 850);
      dni = Math.round(factor * 780);
    }
    points.push({
      time: `${String(h).padStart(2, "0")}:00`,
      hour: h,
      shortwaveRadiation: radiation,
      directNormalIrradiance: dni,
      cloudCover: h > 11 && h < 16 ? 15 : 5,
    });
  }
  return points;
}

export async function getSolarIrradiance(lat: number, lng: number): Promise<SolarIrradianceResponse> {
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLng = Math.round(lng * 100) / 100;
  const hourBucket = Math.floor(Date.now() / (30 * 60 * 1000)); // 30 min grid
  const cacheKey = `irradiance:${roundedLat}:${roundedLng}:${hourBucket}`;

  const cached = getCached<SolarIrradianceResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${roundedLat}&longitude=${roundedLng}&hourly=shortwave_radiation,direct_normal_irradiance,diffuse_radiation,cloud_cover&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,cloud_cover&timezone=Asia%2FKolkata&forecast_days=1`;

    const response = await fetchWithTimeout(url, 6000);
    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const data = await response.json();
    const current = data.current || {};
    const hourly = data.hourly || {};

    const hourlyToday: HourlyIrradiancePoint[] = [];
    const times: string[] = hourly.time || [];
    const swList: number[] = hourly.shortwave_radiation || [];
    const dniList: number[] = hourly.direct_normal_irradiance || [];
    const clouds: number[] = hourly.cloud_cover || [];

    for (let i = 0; i < Math.min(24, times.length); i++) {
      const timeStr = times[i];
      const hour = new Date(timeStr).getHours();
      hourlyToday.push({
        time: `${String(hour).padStart(2, "0")}:00`,
        hour,
        shortwaveRadiation: swList[i] ?? 0,
        directNormalIrradiance: dniList[i] ?? 0,
        cloudCover: clouds[i] ?? 0,
      });
    }

    // Current hour irradiance
    const currentHour = new Date().getHours();
    const currentRad = swList[currentHour] ?? 0;
    const currentDni = dniList[currentHour] ?? 0;

    // Use Gujarat average GHI benchmark for annual yield calculation
    const annualGhiKwhPerM2 = GUJARAT_CITY_GHI.Ahmedabad ?? 1940;
    const peakSunHoursPerDay = Math.round((annualGhiKwhPerM2 / 365) * 100) / 100;

    const result: SolarIrradianceResponse = {
      current: {
        temperature2m: current.temperature_2m ?? 31.0,
        relativeHumidity2m: current.relative_humidity_2m ?? 52,
        cloudCover: current.cloud_cover ?? 10,
        shortwaveRadiation: currentRad,
        directNormalIrradiance: currentDni,
        isDay: current.is_day ?? 1,
        fetchedAt: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      },
      hourlyToday,
      annualGhiKwhPerM2,
      peakSunHoursPerDay,
      isOfflineFallback: false,
      source: `Open-Meteo API (${roundedLat}°N, ${roundedLng}°E)`,
      gridKey: `${roundedLat}:${roundedLng}`,
    };

    setCached(cacheKey, result, 1800); // 30 minutes
    return result;
  } catch (error) {
    console.warn("Open-Meteo fetch failed or offline; using cached Gujarat GHI benchmark:", error);

    const fallbackHourly = generateSeededHourlyToday();
    const currentHour = new Date().getHours();
    const currPoint = fallbackHourly[currentHour] || fallbackHourly[12];

    const fallbackResult: SolarIrradianceResponse = {
      current: {
        temperature2m: 32.5,
        relativeHumidity2m: 50,
        cloudCover: 10,
        shortwaveRadiation: currPoint.shortwaveRadiation,
        directNormalIrradiance: currPoint.directNormalIrradiance,
        isDay: currentHour >= 6 && currentHour <= 18 ? 1 : 0,
        fetchedAt: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      },
      hourlyToday: fallbackHourly,
      annualGhiKwhPerM2: 1940.0,
      peakSunHoursPerDay: 5.31,
      isOfflineFallback: true,
      source: "Offline Seeded Gujarat Solar Benchmark (GEDA/IMD)",
      gridKey: `${roundedLat}:${roundedLng}`,
    };

    return fallbackResult;
  }
}
