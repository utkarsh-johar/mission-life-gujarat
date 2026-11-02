import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateWalletBalance } from "@/lib/engine/credits";
import { REWARDS_CATALOGUE, RewardItem } from "@/config/gamification";

export async function POST(request: NextRequest) {
  try {
    const { userId = "demo-citizen-id", rewardId } = await request.json();

    const reward = REWARDS_CATALOGUE.find((r: RewardItem) => r.id === rewardId);
    if (!reward) {
      return NextResponse.json(
        { error: { code: "REWARD_NOT_FOUND", message: "Reward item does not exist" } },
        { status: 404 }
      );
    }

    // Check balance
    const userLedger = await prisma.creditLedger.findMany({
      where: { userId },
    });
    const currentBalance = calculateWalletBalance(userLedger);

    if (currentBalance < reward.creditsCost) {
      return NextResponse.json(
        {
          error: {
            code: "INSUFFICIENT_CREDITS",
            message: `You need ${reward.creditsCost} credits to redeem this reward, but currently have ${currentBalance} credits.`,
          },
        },
        { status: 400 }
      );
    }

    // Append negative ledger row (transactional redemption)
    await prisma.creditLedger.create({
      data: {
        userId,
        delta: -reward.creditsCost,
        reason: `Redeemed Reward: ${reward.title}`,
        refId: reward.id,
      },
    });

    return NextResponse.json({
      success: true,
      reward,
      newBalance: currentBalance - reward.creditsCost,
      redemptionCode: `GEDA-${reward.category}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      message: `Successfully redeemed ${reward.title}! Check your email or notifications for issuance details.`,
    });
  } catch (err) {
    console.error("Reward redemption error:", err);
    return NextResponse.json(
      { error: { code: "REDEMPTION_FAILED", message: "Failed to process reward redemption" } },
      { status: 500 }
    );
  }
}
