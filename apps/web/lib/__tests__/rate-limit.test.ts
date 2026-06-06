import { describe, it, expect } from "vitest";
import { rateLimit } from "../rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", () => {
    const action = `test-allow-${Date.now()}`;
    expect(rateLimit(action, "ip1", { limit: 3, windowMs: 60_000 })).toBe(true);
    expect(rateLimit(action, "ip1", { limit: 3, windowMs: 60_000 })).toBe(true);
    expect(rateLimit(action, "ip1", { limit: 3, windowMs: 60_000 })).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const action = `test-block-${Date.now()}`;
    rateLimit(action, "ip2", { limit: 2, windowMs: 60_000 });
    rateLimit(action, "ip2", { limit: 2, windowMs: 60_000 });
    expect(rateLimit(action, "ip2", { limit: 2, windowMs: 60_000 })).toBe(false);
  });

  it("isolates different IPs", () => {
    const action = `test-iso-${Date.now()}`;
    rateLimit(action, "ip3", { limit: 1, windowMs: 60_000 });
    expect(rateLimit(action, "ip3", { limit: 1, windowMs: 60_000 })).toBe(false);
    // Different IP should still be allowed
    expect(rateLimit(action, "ip4", { limit: 1, windowMs: 60_000 })).toBe(true);
  });
});
