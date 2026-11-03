import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { GAMIFICATION_CONFIG } from "../../../config/gamification";
import { FEATURES } from "../../../config/features";
import { getDeterministicWardsLeaderboard } from "../../../config/wards";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const range = searchParams.get("range") || "30"; // 7, 30, 90 days

  const daysCount = parseInt(range, 10) || 30;
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - daysCount);
  const sinceDateString = sinceDate.toISOString().slice(0, 10);

  try {
    // 1. Fetch wards matching city filter
    const wardWhere = city && city !== "All" ? { city } : {};
    const wards = await prisma.ward.findMany({
      where: wardWhere,
      include: {
        aggregates: {
          where: {
            day: { gte: sinceDateString },
          },
        },
      },
    });

    // 2. Compute composite metrics and LiFE Score per ward
    const scoredWards = wards.map((ward) => {
      let totalActiveUsers = 0;
      let totalKgCo2 = 0;
      let totalKwhShifted = 0;
      let totalGreenKm = 0;
      let totalPolygons = 0;
      let totalLeads = 0;

      for (const agg of ward.aggregates) {
        totalActiveUsers += agg.activeUsers;
        totalKgCo2 += agg.kgCo2Saved;
        totalKwhShifted += agg.kwhShifted;
        totalGreenKm += agg.greenKm;
        totalPolygons += agg.polygons;
        totalLeads += agg.leads;
      }

      const daysRecorded = Math.max(1, ward.aggregates.length);
      const avgDailyActive = Math.round(totalActiveUsers / daysRecorded);

      // K-anonymity check
      if (avgDailyActive < FEATURES.kAnonymityThreshold) {
        return null;
      }

      const co2PerActive = avgDailyActive > 0 ? totalKgCo2 / avgDailyActive : 0;
      const participationRate = ward.estimatedHouseholds > 0 ? (avgDailyActive / ward.estimatedHouseholds) * 100 : 0;
      const streakHealthScore = Math.min(100, avgDailyActive * 2.5);

      // Normalised components (0-100 scale)
      const normCo2 = Math.min(100, (co2PerActive / 25) * 100);
      const normParticipation = Math.min(100, participationRate * 50);

      const weights = GAMIFICATION_CONFIG.wardScoringWeights;
      const compositeLifeScore = Math.round(
        (normCo2 * weights.co2PerActiveUser +
          normParticipation * weights.participationRate +
          streakHealthScore * weights.streakHealth) *
          10
      ) / 10;

      return {
        wardId: ward.id,
        wardName: ward.name,
        city: ward.city,
        pincode: ward.pincode,
        discom: ward.discom,
        centroid: { lat: ward.centroidLat, lng: ward.centroidLng },
        households: ward.estimatedHouseholds,
        activeUsers: avgDailyActive,
        totalKgCo2: Math.round(totalKgCo2 * 100) / 100,
        totalTonnesCo2: Math.round((totalKgCo2 / 1000) * 100) / 100,
        totalKwhShifted: Math.round(totalKwhShifted),
        totalGreenKm: Math.round(totalGreenKm),
        solarPolygons: totalPolygons,
        solarLeads: totalLeads,
        lifeScore: compositeLifeScore,
      };
    }).filter(Boolean);

    // Sort descending by LiFE Score
    scoredWards.sort((a, b) => (b?.lifeScore ?? 0) - (a?.lifeScore ?? 0));

    // Assign rank
    const ranked = scoredWards.map((w, index) => ({
      rank: index + 1,
      ...w,
    }));

    if (ranked.length === 0) {
      const fallbackRanked = getDeterministicWardsLeaderboard(city, daysCount);
      return NextResponse.json({
        rangeDays: daysCount,
        city: city || "All",
        totalWards: fallbackRanked.length,
        leaderboard: fallbackRanked,
        kAnonymityEnforced: true,
        minUsersThreshold: FEATURES.kAnonymityThreshold,
      });
    }

    return NextResponse.json({
      rangeDays: daysCount,
      city: city || "All",
      totalWards: ranked.length,
      leaderboard: ranked,
      kAnonymityEnforced: true,
      minUsersThreshold: FEATURES.kAnonymityThreshold,
    });
  } catch (error) {
    console.warn("Leaderboard API fallback (serverless mode):", error);
    const fallbackRanked = getDeterministicWardsLeaderboard(city, daysCount);
    return NextResponse.json({
      rangeDays: daysCount,
      city: city || "All",
      totalWards: fallbackRanked.length,
      leaderboard: fallbackRanked,
      kAnonymityEnforced: true,
      minUsersThreshold: FEATURES.kAnonymityThreshold,
    });
  }
}
