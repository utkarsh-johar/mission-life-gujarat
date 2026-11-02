import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "leaderboard";

  try {
    if (type === "leads") {
      const leads = await prisma.solarLead.findMany({
        include: {
          user: true,
          vendor: true,
          roof: true,
        },
        orderBy: { createdAt: "desc" },
      });

      let csv = "Lead ID,Created At,Citizen Name,Vendor,City,System kW,Subsidy (₹),Status\n";
      for (const l of leads) {
        csv += `"${l.id}","${l.createdAt.toISOString()}","${l.user.displayName || "Citizen"}","${l.vendor.name}","${l.vendor.city}",${l.roof.systemKw},${l.roof.subsidy},"${l.status}"\n`;
      }

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="geda-solar-leads-${Date.now()}.csv"`,
        },
      });
    }

    // Default: Export ward leaderboard
    const wards = await prisma.ward.findMany({
      include: { aggregates: true },
    });

    let csv = "Rank,Ward ID,Ward Name,City,PIN Code,DISCOM,Households,Total CO2 Avoided (kg),Total Green KM,Solar Polygons,Solar Leads\n";
    let rank = 1;

    for (const w of wards) {
      const totalKg = Math.round(w.aggregates.reduce((acc: number, a: { kgCo2Saved: number }) => acc + a.kgCo2Saved, 0));
      const totalKm = Math.round(w.aggregates.reduce((acc: number, a: { greenKm: number }) => acc + a.greenKm, 0));
      const polygons = w.aggregates.reduce((acc: number, a: { polygons: number }) => acc + a.polygons, 0);
      const leads = w.aggregates.reduce((acc: number, a: { leads: number }) => acc + a.leads, 0);

      csv += `${rank},"${w.id}","${w.name}","${w.city}","${w.pincode}","${w.discom}",${w.estimatedHouseholds},${totalKg},${totalKm},${polygons},${leads}\n`;
      rank++;
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="geda-ward-leaderboard-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("CSV Export error:", error);
    return NextResponse.json(
      { error: { code: "EXPORT_FAILED", message: "Failed to generate CSV export" } },
      { status: 500 }
    );
  }
}
