import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { TripSaveSchema } from "../../../lib/validation/trip";
import {
  calculateTripCo2Saved,
  validateTripPlausibility,
  ClassifiedMode,
} from "../../../lib/engine/mobility";
import {
  calculateTripCredits,
  evaluateStreakUpdate,
  getIstDateString,
} from "../../../lib/engine/credits";
import { CommuteMode } from "../../../config/emission";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = TripSaveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Idempotency Check: prevent double-saving
    const existing = await prisma.trip.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      return NextResponse.json({
        trip: existing,
        message: "Trip already processed (idempotent)",
      });
    }

    // 2. Validate user
    let user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { streak: true },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: data.userId,
          displayName: "Citizen Asha",
          role: "CITIZEN",
          wardId: data.wardId ?? "AMD-NAV",
        },
        include: { streak: true },
      });
    }

    // 3. Plausibility check (anti-cheat)
    const plausibility = validateTripPlausibility(
      data.distanceKm,
      data.movingSeconds,
      data.maxKmh,
      data.detectedMode as ClassifiedMode
    );

    // 4. Calculate CO2 Saved
    const effectiveMode = (data.confirmedMode ?? (data.detectedMode === "WALK" ? "WALK" : data.detectedMode === "CYCLE" ? "CYCLE" : "BUS")) as CommuteMode;
    const kgCo2Saved = calculateTripCo2Saved(data.distanceKm, effectiveMode, "CAR_PETROL");

    // 5. Calculate Credits (capped daily)
    const todayIst = getIstDateString();
    const todayTrips = await prisma.creditLedger.findMany({
      where: {
        userId: user.id,
        reason: { contains: "Green Commute" },
        createdAt: {
          gte: new Date(todayIst + "T00:00:00Z"),
        },
      },
    });
    const todayExistingCredits = todayTrips.reduce((acc, t) => acc + t.delta, 0);

    let creditsToAward = 0;
    if (plausibility.status === "VERIFIED" && (!data.isSimulated || process.env.NEXT_PUBLIC_DEMO_MODE === "true")) {
      creditsToAward = calculateTripCredits(kgCo2Saved, todayExistingCredits);
    }

    // 6. Save Trip
    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        idempotencyKey: data.idempotencyKey,
        distanceKm: data.distanceKm,
        movingSeconds: data.movingSeconds,
        avgKmh: data.avgKmh,
        maxKmh: data.maxKmh,
        detectedMode: data.detectedMode,
        confirmedMode: data.confirmedMode ?? null,
        confidence: data.confidence,
        kgCo2Saved,
        status: plausibility.status,
        isSimulated: data.isSimulated,
        wardId: data.wardId ?? user.wardId ?? "AMD-NAV",
        startedAt: new Date(data.startedAt),
      },
    });

    // 7. Update Ledger if credits awarded
    if (creditsToAward > 0) {
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: creditsToAward,
          reason: `Verified Green Commute (${data.distanceKm} km by ${effectiveMode.toLowerCase().replace("_", " ")})`,
          refId: trip.id,
        },
      });
    }

    // 8. Update Streak
    let streakState = user.streak ?? {
      userId: user.id,
      current: 1,
      best: 1,
      lastActiveDay: todayIst,
      freezes: 1,
    };
    const streakResult = evaluateStreakUpdate(
      {
        current: streakState.current,
        best: streakState.best,
        lastActiveDay: streakState.lastActiveDay,
        freezesRemaining: streakState.freezes,
      },
      todayIst
    );

    await prisma.streak.upsert({
      where: { userId: user.id },
      update: {
        current: streakResult.streak.current,
        best: streakResult.streak.best,
        lastActiveDay: streakResult.streak.lastActiveDay,
        freezes: streakResult.streak.freezesRemaining,
      },
      create: {
        userId: user.id,
        current: streakResult.streak.current,
        best: streakResult.streak.best,
        lastActiveDay: streakResult.streak.lastActiveDay,
        freezes: streakResult.streak.freezesRemaining,
      },
    });

    if (streakResult.bonusCreditsAwarded > 0) {
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: streakResult.bonusCreditsAwarded,
          reason: streakResult.bonusReason ?? "Streak milestone reward",
        },
      });
    }

    // 9. Incremental Update on WardDailyAggregate
    const targetWardId = trip.wardId ?? "AMD-NAV";
    try {
      await prisma.wardDailyAggregate.upsert({
        where: {
          wardId_day: {
            wardId: targetWardId,
            day: todayIst,
          },
        },
        update: {
          activeUsers: { increment: 1 },
          kgCo2Saved: { increment: kgCo2Saved },
          greenKm: { increment: data.distanceKm },
        },
        create: {
          wardId: targetWardId,
          day: todayIst,
          activeUsers: 1,
          kgCo2Saved,
          kwhShifted: 0,
          greenKm: data.distanceKm,
          polygons: 0,
          leads: 0,
        },
      });
    } catch (aggErr) {
      console.warn("Aggregate incremental update error:", aggErr);
    }

    return NextResponse.json({
      trip,
      kgCo2Saved,
      creditsAwarded: creditsToAward,
      streak: streakResult.streak,
      plausibility,
    });
  } catch (error) {
    console.error("Trips API error:", error);
    return NextResponse.json(
      { error: { code: "TRIP_SAVE_FAILED", message: "Failed to record mobility trip" } },
      { status: 500 }
    );
  }
}
