import {
  recommendationSchema,
  type Recommendation,
} from "./schemas/recommendation";

const recommendations: Recommendation[] = [
  {
    title: "CocoaPink",
    category: "bath-body",
    url: "https://cocoapink.net/",
    excerpt:
      "A playful indie fragrance and body-care shop with giant scent catalogs and serious cozy energy.",
  },
  {
    title: "Spoonflower",
    category: "arts-crafts",
    url: "https://www.spoonflower.com/",
    excerpt:
      "A maker-friendly marketplace for custom fabric and craft materials with tons of artist-made patterns.",
  },
  {
    title: "Rancho Gordo",
    category: "food-drinks",
    url: "https://www.ranchogordo.com/",
    excerpt:
      "A beloved pantry source for heirloom beans and staples that make plant-forward cooking feel grounded and generous.",
  },
  {
    title: "Rishi Tea",
    category: "food-drinks",
    url: "https://rishi-tea.com/",
    excerpt:
      "Consistent, high-quality tea with clear sourcing and blends that hold up for both daily and ritual cups.",
  },
  {
    title: "Powell's Books",
    category: "media",
    url: "https://www.powells.com/",
    excerpt:
      "An iconic independent bookstore with deep, thoughtfully curated catalogs and reliable picks beyond algorithmic bestsellers.",
  },
  {
    title: "Bookshop.org",
    category: "media",
    url: "https://bookshop.org/",
    excerpt:
      "A practical way to buy books online while still supporting independent bookstores.",
  },
  {
    title: "Known Supply",
    category: "clothing",
    url: "https://knownsupply.com/",
    excerpt:
      "An everyday basics brand with transparent maker stories and a cleaner approach to wardrobe staples.",
  },
];

export const getRecommendations = (): Recommendation[] => {
  return recommendationSchema.array().parse(recommendations);
};
