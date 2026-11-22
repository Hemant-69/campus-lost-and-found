import { prisma } from "./prisma";
import { headers } from "next/headers";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Atomic PostgreSQL-backed rate limiter.
 * Executes a single atomic INSERT ... ON CONFLICT DO UPDATE statement.
 * Thread-safe and race-condition free across serverless instances.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const rows = await prisma.$queryRaw<Array<{ count: number; windowStart: Date }>>`
      INSERT INTO "RateLimit" ("key", "count", "windowStart")
      VALUES (${key}, 1, NOW())
      ON CONFLICT ("key") DO UPDATE
      SET
        "count" = CASE
          WHEN "RateLimit"."windowStart" + (${windowSeconds} || ' seconds')::INTERVAL < NOW() THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "windowStart" = CASE
          WHEN "RateLimit"."windowStart" + (${windowSeconds} || ' seconds')::INTERVAL < NOW() THEN NOW()
          ELSE "RateLimit"."windowStart"
        END
      RETURNING "count", "windowStart";
    `;

    if (!rows || rows.length === 0) {
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetSeconds: windowSeconds,
      };
    }

    const currentCount = rows[0].count;
    const windowStart = new Date(rows[0].windowStart).getTime();
    const now = Date.now();
    const elapsedSeconds = Math.max(0, Math.floor((now - windowStart) / 1000));
    const resetSeconds = Math.max(1, windowSeconds - elapsedSeconds);

    const isAllowed = currentCount <= limit;

    return {
      success: isAllowed,
      limit,
      remaining: Math.max(0, limit - currentCount),
      resetSeconds,
    };
  } catch (error) {
    // In edge cases or offline testing where database is unreachable, log warning and allow request
    console.error("Rate limit query failed:", error);
    return {
      success: true,
      limit,
      remaining: 1,
      resetSeconds: windowSeconds,
    };
  }
}

/**
 * Extracts client IP from request headers, falling back to localhost.
 */
export function getClientIp(): string {
  try {
    const reqHeaders = headers();
    const forwardedFor = reqHeaders.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = reqHeaders.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // headers() might not be available in non-request contexts
  }
  return "127.0.0.1";
}
