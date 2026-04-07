import { describe, expect, it } from "vitest";
import { getRecommendations } from "./recommendations";

describe("getRecommendations", () => {
  it("returns a non-empty curated recommendation list", () => {
    const items = getRecommendations();
    expect(items.length).toBeGreaterThan(0);
  });

  it("ensures every recommendation has a valid URL", () => {
    const items = getRecommendations();
    expect(items.every((item) => item.url.startsWith("https://"))).toBe(true);
  });

  it("returns records with unique titles and required metadata", () => {
    const items = getRecommendations();
    const uniqueTitles = new Set(items.map((item) => item.title));

    expect(uniqueTitles.size).toBe(items.length);
    expect(
      items.every(
        (item) =>
          item.excerpt.trim().length > 0 && item.category.trim().length > 0,
      ),
    ).toBe(true);
  });
});
