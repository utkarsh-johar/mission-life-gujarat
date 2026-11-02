import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { title, multiplier = 1.5, durationDays = 7, wardIds } = await request.json();

    if (!title) {
      return NextResponse.json({ error: { message: "Campaign title is required" } }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        title,
        multiplier: parseFloat(multiplier) || 1.5,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + durationDays * 86400000),
        wardIds: wardIds ? JSON.stringify(wardIds) : null,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (err) {
    return NextResponse.json({ error: { message: "Failed to create campaign" } }, { status: 500 });
  }
}

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { startsAt: "desc" },
    take: 10,
  });
  return NextResponse.json(campaigns);
}
