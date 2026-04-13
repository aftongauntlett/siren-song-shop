import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetContactRateLimitStoreForTests,
  checkRateLimit,
  contactSchema,
  getClientIp,
  isRateLimited,
  isSameOrigin,
  REASON_VALUES,
} from "./contact";

describe("contact API helpers", () => {
  beforeEach(() => {
    __resetContactRateLimitStoreForTests();
  });

  it("validates known reason values", () => {
    expect(REASON_VALUES).toContain("general");

    const parsed = contactSchema.safeParse({
      name: "Siren",
      email: "hello@example.com",
      reason: "general",
      message: "This is long enough to pass schema validation.",
    });

    expect(parsed.success).toBe(true);
  });

  it("enforces rate limits by key", () => {
    const key = "ip:203.0.113.7:burst";
    expect(isRateLimited(key, 1000, 2)).toBe(false);
    expect(isRateLimited(key, 1000, 2)).toBe(false);
    expect(isRateLimited(key, 1000, 2)).toBe(true);
  });

  it("validates same-origin browser requests", () => {
    const request = new Request("https://sirensong.guide/api/contact", {
      headers: {
        origin: "https://sirensong.guide",
        referer: "https://sirensong.guide/contact",
      },
    });

    expect(isSameOrigin(request)).toBe(true);
  });

  it("extracts client ip from forwarding headers", () => {
    const request = new Request("https://sirensong.guide/api/contact", {
      headers: {
        "x-forwarded-for": "198.51.100.12, 10.0.0.4",
      },
    });

    expect(getClientIp(request)).toBe("198.51.100.12");
  });

  it("falls back to in-memory limits when redis is unavailable", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("redis unavailable"));

    try {
      const redisConfig = {
        url: "https://redis.example.test",
        token: "token",
      };
      const key = "ip:203.0.113.7:burst";

      expect(await checkRateLimit(key, 1_000, 2, redisConfig)).toBe(false);
      expect(await checkRateLimit(key, 1_000, 2, redisConfig)).toBe(false);
      expect(await checkRateLimit(key, 1_000, 2, redisConfig)).toBe(true);
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
