import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  try {
    // Ping PostgreSQL database to ensure pooled connection is healthy
    await prisma.$queryRaw`SELECT 1;`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error.message || "Failed to execute database query",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
