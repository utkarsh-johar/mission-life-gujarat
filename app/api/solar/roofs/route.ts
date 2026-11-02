import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { SaveRoofProjectSchema } from "../../../../lib/validation/solar";
import { GAMIFICATION_CONFIG } from "../../../../config/gamification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SaveRoofProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Check user exists
    let user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: data.userId,
          displayName: "Citizen Asha",
          role: "CITIZEN",
        },
      });
    }

    // Save Roof Project
    const project = await prisma.roofProject.create({
      data: {
        userId: user.id,
        geojson: typeof data.geojson === "string" ? data.geojson : JSON.stringify(data.geojson),
        areaSqM: data.areaSqM,
        usableSqM: data.usableSqM,
        systemKw: data.systemKw,
        annualKwh: data.annualKwh,
        grossCost: data.grossCost,
        subsidy: data.subsidy,
        netCost: data.netCost,
        paybackYears: data.paybackYears,
        lat: data.lat,
        lng: data.lng,
        irradianceSnapshot: typeof data.irradianceSnapshot === "string" ? data.irradianceSnapshot : JSON.stringify(data.irradianceSnapshot),
      },
    });

    // Check if user already got roof credits
    const existingRoofCredits = await prisma.creditLedger.findFirst({
      where: {
        userId: user.id,
        reason: { contains: "Roof" },
      },
    });

    let creditsAwarded = 0;
    if (!existingRoofCredits) {
      creditsAwarded = GAMIFICATION_CONFIG.credits.roofSaved;
      await prisma.creditLedger.create({
        data: {
          userId: user.id,
          delta: creditsAwarded,
          reason: `Saved Rooftop Solar Project (${data.systemKw} kW)`,
          refId: project.id,
        },
      });
    }

    return NextResponse.json({
      project,
      creditsAwarded,
    });
  } catch (error) {
    console.error("Save roof API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to save rooftop project" } },
      { status: 500 }
    );
  }
}
