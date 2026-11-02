import { describe, it, expect } from "vitest";
import { evaluateWeatherNudges, WeatherDataPoint } from "../../lib/engine/nudges";

describe("Weather Nudges Engine - Golden Test Cases (Appendix A)", () => {
  it("Nudge: 24 °C at 01:00 -> AC_OFF_VENT fires", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 24.0,
      relativeHumidity2m: 60,
      localHourIst: 1, // 01:00 AM
    };

    const nudges = evaluateWeatherNudges(weather);
    const acOff = nudges.find((n) => n.id === "AC_OFF_VENT");
    expect(acOff).toBeDefined();
    expect(acOff?.title).toContain("AC-Off Natural Ventilation");
    expect(acOff?.creditsReward).toBe(35);
  });

  it("Nudge: 800 W/m² at 13:00 -> PEAK_SOLAR_SHIFT fires", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 34.0,
      relativeHumidity2m: 45,
      shortwaveRadiation: 800.0,
      localHourIst: 13, // 1:00 PM
    };

    const nudges = evaluateWeatherNudges(weather);
    const solarShift = nudges.find((n) => n.id === "PEAK_SOLAR_SHIFT");
    expect(solarShift).toBeDefined();
    expect(solarShift?.creditsReward).toBe(40);
  });

  it("Nudge: 750 W/m² at 13:00 -> PEAK_SOLAR_SHIFT does NOT fire (strictly greater)", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 34.0,
      relativeHumidity2m: 45,
      shortwaveRadiation: 750.0, // exactly 750 W/m²
      localHourIst: 13,
    };

    const nudges = evaluateWeatherNudges(weather);
    const solarShift = nudges.find((n) => n.id === "PEAK_SOLAR_SHIFT");
    expect(solarShift).toBeUndefined();
  });

  it("Nudge: 750.1 W/m² at 13:00 -> PEAK_SOLAR_SHIFT fires", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 34.0,
      relativeHumidity2m: 45,
      shortwaveRadiation: 750.1,
      localHourIst: 13,
    };

    const nudges = evaluateWeatherNudges(weather);
    const solarShift = nudges.find((n) => n.id === "PEAK_SOLAR_SHIFT");
    expect(solarShift).toBeDefined();
  });

  it("Nudge: 22 °C at 07:00 AM without rain -> COOL_MORNING_CYCLE fires", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 22.0,
      relativeHumidity2m: 55,
      precipitationMm: 0,
      localHourIst: 7,
    };

    const nudges = evaluateWeatherNudges(weather);
    const cycle = nudges.find((n) => n.id === "COOL_MORNING_CYCLE");
    expect(cycle).toBeDefined();
  });

  it("Includes SLAB_ALERT_LINK as top priority when active slab alert exists", () => {
    const weather: WeatherDataPoint = {
      temperature2m: 24.0,
      relativeHumidity2m: 60,
      localHourIst: 1,
    };

    const nudges = evaluateWeatherNudges(weather, true);
    expect(nudges[0].id).toBe("SLAB_ALERT_LINK");
  });

  it("Triggers HUMID_FAN_SET and RAIN_TRANSIT", () => {
    const humidWeather: WeatherDataPoint = {
      temperature2m: 28.0,
      relativeHumidity2m: 80,
      localHourIst: 16,
    };
    const nudges1 = evaluateWeatherNudges(humidWeather);
    expect(nudges1.find((n) => n.id === "HUMID_FAN_SET")).toBeDefined();

    const rainWeather: WeatherDataPoint = {
      temperature2m: 29.0,
      relativeHumidity2m: 75,
      precipitationProbability: 80,
      localHourIst: 10,
    };
    const nudges2 = evaluateWeatherNudges(rainWeather);
    expect(nudges2.find((n) => n.id === "RAIN_TRANSIT")).toBeDefined();
  });
});
