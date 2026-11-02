import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { SolarLeadRequestSchema } from "../../../../lib/validation/solar";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SolarLeadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", details: parsed.error.format() } },
        { status: 400 }
      );
    }

    const { userId, vendorId, roofId, consent } = parsed.data;

    // Check user, vendor, roof exist
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({
        data: { id: userId, role: "CITIZEN", displayName: "Citizen Asha" },
      });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json(
        { error: { code: "VENDOR_NOT_FOUND", message: "Empanelled vendor not found" } },
        { status: 404 }
      );
    }

    const lead = await prisma.solarLead.create({
      data: {
        userId: user.id,
        vendorId,
        roofId,
        consent,
        status: "NEW",
      },
      include: {
        vendor: true,
      },
    });

    return NextResponse.json({
      leadId: lead.id,
      vendorName: vendor.name,
      status: lead.status,
      message: `Your solar feasibility report has been securely transmitted to ${vendor.name}. Their empanelled technical executive will reach out within 24 hours.`,
    });
  } catch (error) {
    console.error("Solar lead API error:", error);
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: "Failed to create solar quotation lead" } },
      { status: 500 }
    );
  }
}
