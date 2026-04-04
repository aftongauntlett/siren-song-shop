import { recommendationSchema, type Recommendation } from './schemas/recommendation';

const recommendations: Recommendation[] = [
  {
    title: 'Neighborhood Tea Atelier',
    category: 'tea',
    url: 'https://example.com/tea-atelier',
    excerpt: 'Small-batch blends with transparent sourcing and ceremonial-level quality.'
  },
  {
    title: 'Wild Coast Bookshop',
    category: 'books',
    url: 'https://example.com/wild-coast-bookshop',
    excerpt: 'A fiercely independent shop with thoughtful curation and hand-written staff notes.'
  },
  {
    title: 'Lumen Studio Ceramics',
    category: 'makers',
    url: 'https://example.com/lumen-ceramics',
    excerpt: 'Functional ceramics made by an artist whose glazes feel like tide pools at dusk.'
  }
];

export const getRecommendations = (): Recommendation[] => {
  return recommendationSchema.array().parse(recommendations);
};
