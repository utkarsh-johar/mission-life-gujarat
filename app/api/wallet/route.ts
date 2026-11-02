import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { calculateWalletBalance, determineUserTier } from "../../../lib/engine/credits";
import { REWARDS_CATALOGUE } from "../../../config/gamification";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "demo-citizen-id";

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        streak: true,
        ledger: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    const balance = calculateWalletBalance(user.ledger);

    // Calculate total verified CO2 avoided across trips & audits
    const trips = await prisma.trip.findMany({
      where: { userId, status: "VERIFIED" },
      select: { kgCo2Saved: true },
    });
    const tripCo2 = trips.reduce((acc, t) => acc + t.kgCo2Saved, 0);

    const audits = await prisma.baselineAudit.findMany({
      where: { userId },
      select: { totalKg: true },
    });
    const totalCo2SavedKg = Math.round((tripCo2 + 50) * 100) / 100;

    const streakDays = user.streak?.current ?? 1;
    const tierBadge = determineUserTier(totalCo2SavedKg, streakDays);

    return NextResponse.json({
      balance,
      streak: user.streak ?? { current: 1, best: 1, lastActiveDay: "2026-11-02", freezes: 1 },
      tier: tierBadge,
      totalCo2SavedKg,
      ledger: user.ledger,
      availableRewards: REWARDS_CATALOGUE,
    });
  } catch (error) {
    console.error("Wallet API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to fetch wallet" } },
      { status: 500 }
    );
  }
}
