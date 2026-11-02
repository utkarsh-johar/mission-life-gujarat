import { NUDGE_RULES, NudgeRuleDefinition } from "../../config/nudges";

export interface WeatherDataPoint {
  temperature2m: number; // Celsius
  relativeHumidity2m: number; // %
  apparentTemperature?: number;
  shortwaveRadiation?: number; // W/m²
  uvIndex?: number;
  precipitationProbability?: number; // %
  precipitationMm?: number;
  isDay?: number; // 1 or 0
  localHourIst: number; // 0 to 23
  localTimeFormatted?: string;
}

export interface EvaluatedNudge {
  id: string;
  title: string;
  body: string;
  cta: string;
  creditsReward: number;
  whyText: string;
  source: string;
  priority: number;
}

export function roundTwo(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Extracts the IST hour (0-23) from a Date or ISO timestamp
 */
export function getIstHour(date: Date = new Date()): number {
  const utcHours = date.getUTCHours();
  const utcMinutes = date.getUTCMinutes();
  // IST is UTC + 5:30
  let istMinutesTotal = utcHours * 60 + utcMinutes + 330;
  let istHours = Math.floor(istMinutesTotal / 60) % 24;
  if (istHours < 0) istHours += 24;
  return istHours;
}

/**
 * Pure evaluation of weather nudge rules in priority order
 */
export function evaluateWeatherNudges(
  weather: WeatherDataPoint,
  hasActiveSlabAlert = false
): EvaluatedNudge[] {
  const activeNudges: EvaluatedNudge[] = [];
  const hour = weather.localHourIst;
  const temp = weather.temperature2m;
  const humidity = weather.relativeHumidity2m;
  const radiation = weather.shortwaveRadiation ?? 0;
  const uv = weather.uvIndex ?? 0;
  const precipProb = weather.precipitationProbability ?? 0;
  const precipMm = weather.precipitationMm ?? 0;

  // Rule 1: AC_OFF_VENT
  // Local time 20:00–05:00 (i.e. hour >= 20 OR hour < 5) AND temp < 26 °C
  const isNightOrEarlyMorning = hour >= 20 || hour < 5;
  if (isNightOrEarlyMorning && temp < 26.0) {
    const rule = NUDGE_RULES.AC_OFF_VENT;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `Measured at your location: ${temp}°C outdoor temperature, ${humidity}% humidity at ${String(
        hour
      ).padStart(2, "0")}:00 IST.`,
      source: rule.source,
      priority: 1,
    });
  }

  // Rule 2: PEAK_SOLAR_SHIFT
  // Local time 12:00–15:00 (hour >= 12 AND hour < 15) AND shortwave_radiation > 750 W/m² (strictly greater)
  if (hour >= 12 && hour < 15 && radiation > 750.0) {
    const rule = NUDGE_RULES.PEAK_SOLAR_SHIFT;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `Solar irradiance is currently ${Math.round(radiation)} W/m² (> 750 W/m² threshold) at peak midday sun.`,
      source: rule.source,
      priority: 2,
    });
  }

  // Rule 3: HIGH_UV_WALK_SHADE
  // UV index >= 8
  if (uv >= 8.0) {
    const rule = NUDGE_RULES.HIGH_UV_WALK_SHADE;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `Current UV Index is ${roundTwo(uv)} (Very High / Extreme). Direct solar exposure can cause skin stress.`,
      source: rule.source,
      priority: 3,
    });
  }

  // Rule 4: COOL_MORNING_CYCLE
  // 06:00–09:00 (hour >= 6 AND hour < 9), temp 18–28 °C, no rain (precipMm <= 0.1)
  if (hour >= 6 && hour < 9 && temp >= 18.0 && temp <= 28.0 && precipMm <= 0.1) {
    const rule = NUDGE_RULES.COOL_MORNING_CYCLE;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `Current morning weather: ${temp}°C, crisp air with zero rainfall. Ideal for cycling.`,
      source: rule.source,
      priority: 4,
    });
  }

  // Rule 5: HUMID_FAN_SET
  // humidity > 70% AND temp 26–30 °C
  if (humidity > 70 && temp >= 26.0 && temp <= 30.0) {
    const rule = NUDGE_RULES.HUMID_FAN_SET;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `High relative humidity (${humidity}%) at ${temp}°C. Air circulation from a ceiling fan provides equivalent comfort to lower AC settings.`,
      source: rule.source,
      priority: 5,
    });
  }

  // Rule 6: RAIN_TRANSIT
  // precipitation_probability > 60%
  if (precipProb > 60) {
    const rule = NUDGE_RULES.RAIN_TRANSIT;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `${precipProb}% probability of monsoon precipitation. Public transit reduces traffic congestion during rain.`,
      source: rule.source,
      priority: 6,
    });
  }

  // Rule 7: SLAB_ALERT_LINK
  if (hasActiveSlabAlert) {
    const rule = NUDGE_RULES.SLAB_ALERT_LINK;
    activeNudges.push({
      id: rule.id,
      title: rule.title,
      body: rule.body,
      cta: rule.actionCta,
      creditsReward: rule.creditsReward,
      whyText: `Your electricity bill projection is nearing the upper tariff threshold this billing cycle.`,
      source: rule.source,
      priority: 0, // Highest priority
    });
  }

  // Sort by priority ascending
  return activeNudges.sort((a, b) => a.priority - b.priority);
}
