import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city")?.trim();
  const kwStr = searchParams.get("kw");
  const kw = kwStr ? parseFloat(kwStr) : undefined;

  try {
    const vendors = await prisma.vendor.findMany();

    // Filter by city and capacity if requested
    let filtered = vendors;
    if (city && city !== "Other") {
      filtered = filtered.filter(
        (v) =>
          v.city.toLowerCase() === city.toLowerCase() ||
          v.districts.toLowerCase().includes(city.toLowerCase()) ||
          v.districts.toLowerCase().includes("all")
      );
    }

    if (kw !== undefined && !isNaN(kw)) {
      filtered = filtered.filter((v) => kw >= v.minKw && kw <= v.maxKw);
    }

    return NextResponse.json(filtered.length > 0 ? filtered : vendors);
  } catch (error) {
    console.error("Vendors API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to load vendors" } },
      { status: 500 }
    );
  }
}
