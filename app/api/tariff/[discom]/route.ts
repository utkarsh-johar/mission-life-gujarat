import { NextRequest, NextResponse } from "next/server";
import { TARIFF_PLANS, Discom } from "../../../../config/tariffs";

export async function GET(
  request: NextRequest,
  { params }: { params: { discom: string } }
) {
  const discomKey = params.discom?.toUpperCase() as Discom;
  const plan = TARIFF_PLANS[discomKey];

  if (!plan) {
    return NextResponse.json(
      {
        error: {
          code: "DISCOM_NOT_FOUND",
          message: `Unknown DISCOM: ${params.discom}. Available: UGVCL, DGVCL, MGVCL, PGVCL, TORRENT_POWER`,
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json(plan, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
