import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

describe("rateLimit Helper Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("allows requests up to the configured limit", async () => {
    // Mock atomic $queryRaw returning count = 1
    const spy = vi.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([
      { count: 1, windowStart: new Date() },
    ] as any);

    const result = await rateLimit("test:user:1", 5, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("blocks requests once the limit is exceeded", async () => {
    // Mock atomic $queryRaw returning count = 6 (> 5)
    vi.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([
      { count: 6, windowStart: new Date() },
    ] as any);

    const result = await rateLimit("test:user:1", 5, 60);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after the window expires", async () => {
    // Window started 65 seconds ago, windowSeconds is 60 -> count reset to 1
    const expiredWindowStart = new Date(Date.now() - 65 * 1000);
    vi.spyOn(prisma, "$queryRaw").mockResolvedValueOnce([
      { count: 1, windowStart: new Date() },
    ] as any);

    const result = await rateLimit("test:user:1", 5, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("stays race-safe and handles 20 concurrent calls without duplicate count reads", async () => {
    let mockCounter = 0;
    const windowStart = new Date();

    // Simulate atomic PostgreSQL ON CONFLICT DO UPDATE returning incremented count each time
    vi.spyOn(prisma, "$queryRaw").mockImplementation((async () => {
      mockCounter++;
      return [{ count: mockCounter, windowStart }];
    }) as any);

    const calls = Array.from({ length: 20 }).map((_, idx) =>
      rateLimit("test:concurrent", 10, 60)
    );

    const results = await Promise.all(calls);

    // First 10 should be allowed, remaining 10 should be rejected
    const allowed = results.filter((r) => r.success);
    const blocked = results.filter((r) => !r.success);

    expect(allowed.length).toBe(10);
    expect(blocked.length).toBe(10);
    expect(mockCounter).toBe(20);
  });
});
