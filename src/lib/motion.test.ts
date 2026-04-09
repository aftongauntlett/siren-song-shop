// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { isReducedMotionEnabled } from "./motion";

describe("isReducedMotionEnabled", () => {
  it("returns true when user toggle is enabled", () => {
    document.documentElement.dataset.reducedMotion = "true";
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: false }));

    expect(isReducedMotionEnabled()).toBe(true);
  });

  it("returns true when prefers-reduced-motion media query matches", () => {
    document.documentElement.dataset.reducedMotion = "false";
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));

    expect(isReducedMotionEnabled()).toBe(true);
  });
});
