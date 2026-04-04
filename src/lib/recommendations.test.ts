import { describe, expect, it } from 'vitest';
import { getRecommendations } from './recommendations';

describe('getRecommendations', () => {
  it('returns a non-empty curated recommendation list', () => {
    const items = getRecommendations();
    expect(items.length).toBeGreaterThan(0);
  });

  it('ensures every recommendation has a valid URL', () => {
    const items = getRecommendations();
    expect(items.every((item) => item.url.startsWith('https://'))).toBe(true);
  });
});
