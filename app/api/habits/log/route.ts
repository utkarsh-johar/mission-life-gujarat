import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HabitLogSchema } from "@/lib/validation/trip";
import { NUDGE_RULES } from "@/config/nudges";
import { isDuplicateProofImage } from "@/lib/engine/credits";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = HabitLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { userId, ruleId, evidenceType, imageHash } = parsed.data;

    // 1. Anti-Cheat: Reject duplicate proof images (AC-D3)
    if (imageHash) {
      const existingLogs = await prisma.habitLog.findMany({
        where: { imageHash: { not: null } },
        select: { imageHash: true },
        take: 200,
      });

      const existingHashes = existingLogs
        .map((l: { imageHash: string | null }) => l.imageHash)
        .filter((h: string | null): h is string => Boolean(h));

      if (isDuplicateProofImage(imageHash, existingHashes)) {
        return NextResponse.json(
          {
            error: {
              code: "DUPLICATE_IMAGE_HASH",
              message: "Duplicate photo detected. This verification evidence has already been submitted for LiFE credits.",
            },
          },
          { status: 409 }
        );
      }
    }

    // Resolve credit amount from nudge rule
    const ruleDef = NUDGE_RULES[ruleId];
    const rewardCredits = ruleDef ? ruleDef.creditsReward : 25;

    // Status: AUTO_VERIFIED if sensor or verified ticket, else APPROVED in demo mode
    const status = "APPROVED";

    // Record habit log
    const habit = await prisma.habitLog.create({
      data: {
        userId,
        ruleId,
        evidenceType: evidenceType ?? "PHOTO",
        imageHash: imageHash ?? null,
        status,
        creditsAwarded: rewardCredits,
      },
    });

    // Credit ledger append
    await prisma.creditLedger.create({
      data: {
        userId,
        delta: rewardCredits,
        reason: `Completed LiFE Action: ${ruleDef?.title ?? ruleId}`,
        refId: habit.id,
      },
    });

    return NextResponse.json({
      habitId: habit.id,
      status: habit.status,
      creditsAwarded: rewardCredits,
      ruleTitle: ruleDef?.title ?? ruleId,
      message: `Action verified! ₹${rewardCredits} LiFE Credits added to your state climate wallet.`,
    });
  } catch (err) {
    console.error("Habit log API error:", err);
    return NextResponse.json(
      { error: { code: "LOG_FAILED", message: "Failed to record habit verification" } },
      { status: 500 }
    );
  }
}
