import { NextRequest, NextResponse } from "next/server";
import { AuditInputSchema } from "../../../lib/validation/audit";
import { calculateFootprint } from "../../../lib/engine/carbon";
import { evaluateSlabJumpAlert } from "../../../lib/engine/tariff";
import { TARIFF_PLANS } from "../../../config/tariffs";
import { prisma } from "../../../lib/prisma";
import { GAMIFICATION_CONFIG } from "../../../config/gamification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = AuditInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid baseline audit input data",
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 1. Calculate Carbon Footprint using pure engine
    const footprint = calculateFootprint({
      monthlyKwh: data.monthlyKwh,
      cookingFuel: data.cookingFuel,
      lpgCylindersPerYear: data.lpgCylindersPerYear,
      pngScmPerMonth: data.pngScmPerMonth,
      commuteMode: data.commuteMode,
      dailyKm: data.dailyKm,
      workingDaysPerMonth: data.workingDaysPerMonth,
      householdSize: data.householdSize,
    });

    // 2. Evaluate Tariff Slab Alert
    const tariffPlan = TARIFF_PLANS[data.discom] ?? TARIFF_PLANS.UGVCL;
    const slabAlert = evaluateSlabJumpAlert(data.monthlyKwh, 15, tariffPlan, 15);

    // 3. User Resolution (default to demo citizen if not authenticated)
    const userId = data.userId || "demo-citizen-id";

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          role: "CITIZEN",
          displayName: "Citizen Asha",
          locale: "en",
          wardId: data.wardId ?? "AMD-NAV",
        },
      });
    }

    // 4. Persist Baseline Audit
    const auditRecord = await prisma.baselineAudit.create({
      data: {
        userId: user.id,
        monthlyKwh: data.monthlyKwh,
        cookingFuel: data.cookingFuel,
        lpgCylindersPerYear: data.lpgCylindersPerYear ?? null,
        pngScmPerMonth: data.pngScmPerMonth ?? null,
        commuteMode: data.commuteMode,
        dailyKm: data.dailyKm,
        workingDays: data.workingDaysPerMonth ?? 26,
        electricityKg: footprint.monthly.electricity,
        cookingKg: footprint.monthly.cooking,
        commuteKg: footprint.monthly.commute,
        totalKg: footprint.monthly.total,
        source: data.source ?? "MANUAL",
        factorsVersion: "CEA-v19-2024",
      },
    });

    // 5. Check if user already got baseline audit credits
    const existingAuditCredits = await prisma.creditLedger.findFirst({
      where: {
        userId: user.id,
        reason: { contains: "Baseline" },
      },
    });

    let creditsAwarded = 0;
    if (!existingAuditCredits) {
      creditsAwarded = GAMIFICATION_CONFIG.credits.baselineAudit;
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: creditsAwarded,
          reason: "Completed Baseline Carbon & Bill Audit",
          refId: auditRecord.id,
        },
      });
    }

    return NextResponse.json({
      auditId: auditRecord.id,
      footprint,
      slabAlert,
      creditsAwarded,
      discom: data.discom,
      city: data.city,
      pincode: data.pincode,
    });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate and store baseline audit",
        },
      },
      { status: 500 }
    );
  }
}
