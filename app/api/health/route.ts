import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    // Quick DB ping
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "HEALTHY",
      uptimeSeconds: process.uptime(),
      dbConnected: true,
      registeredUsers: userCount,
      timestamp: new Date().toISOString(),
      openMeteo: "ONLINE_READY",
    });
  } catch (error) {
    return NextResponse.json(
      { status: "DEGRADED", error: "Database unreachable", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
