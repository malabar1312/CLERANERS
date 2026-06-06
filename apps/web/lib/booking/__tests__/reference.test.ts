import { describe, it, expect } from "vitest";
import { bookingReference } from "../reference";

describe("bookingReference", () => {
  it("produces BK- prefix + 8 uppercase hex chars", () => {
    const ref = bookingReference("pi_abc123def456ghi789");
    expect(ref).toMatch(/^BK-[A-Z0-9]{8}$/);
  });

  it("is deterministic (same input → same output)", () => {
    const id = "cs_test_xyz";
    expect(bookingReference(id)).toBe(bookingReference(id));
  });
});
