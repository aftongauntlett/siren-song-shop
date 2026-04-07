import {
  recommendationSchema,
  type Recommendation,
} from "./schemas/recommendation";

const disallowedRecommendationTerms = [
  /butcher/i,
  /slaughter/i,
  /meat market/i,
  /hunting/i,
  /pet\s?(store|shop|supplies|food)?/i,
  /breeder/i,
  /dairy farm/i,
  /factory farm/i,
];

const exceptionTerms = [
  /animal equality/i,
  /animal sanctuary/i,
  /animal rescue/i,
  /animal rehab/i,
  /wildlife rehab/i,
  /sliding[-\s]?scale vet/i,
  /low[-\s]?cost vet/i,
  /cruelty[-\s]?free/i,
  /vegan/i,
];

const textIncludesPattern = (text: string, patterns: RegExp[]) =>
  patterns.some((pattern) => pattern.test(text));

const validateRecommendationGuardrails = (item: Recommendation) => {
  const combinedText = `${item.title} ${item.excerpt} ${item.url}`;
  const hasDisallowedTerm = textIncludesPattern(
    combinedText,
    disallowedRecommendationTerms,
  );
  const hasException = textIncludesPattern(combinedText, exceptionTerms);

  if (hasDisallowedTerm && !hasException) {
    throw new Error(
      `Recommendation \"${item.title}\" violates curation guardrails.`,
    );
  }
};

const recommendations: Recommendation[] = [
  {
    title: "CocoaPink",
    category: "bath-body",
    url: "https://cocoapink.net/",
    excerpt:
      "A playful indie fragrance and body-care shop with giant scent catalogs and serious cozy energy.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Spoonflower",
    category: "arts-crafts",
    url: "https://www.spoonflower.com/",
    excerpt:
      "A maker-friendly marketplace for custom fabric and craft materials with tons of artist-made patterns.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Rancho Gordo",
    category: "food-drinks",
    url: "https://www.ranchogordo.com/",
    excerpt:
      "A beloved pantry source for heirloom beans and staples that make plant-forward cooking feel grounded and generous.",
    veganSupport: "fully-vegan-shop",
  },
  {
    title: "Rishi Tea",
    category: "food-drinks",
    url: "https://rishi-tea.com/",
    excerpt:
      "Consistent, high-quality tea with clear sourcing and blends that hold up for both daily and ritual cups.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Powell's Books",
    category: "media",
    url: "https://www.powells.com/",
    excerpt:
      "An iconic independent bookstore with deep, thoughtfully curated catalogs and reliable picks beyond algorithmic bestsellers.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Bookshop.org",
    category: "media",
    url: "https://bookshop.org/",
    excerpt:
      "A practical way to buy books online while still supporting independent bookstores.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Known Supply",
    category: "clothing",
    url: "https://knownsupply.com/",
    excerpt:
      "An everyday basics brand with transparent maker stories and a cleaner approach to wardrobe staples.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "The Peach Fuzz",
    category: "arts-crafts",
    url: "https://shop.thepeachfuzz.co/",
    excerpt:
      "Artist-made hair claws, accessories, and novelties with genuine anti-capitalist energy — 10% of every sale goes directly to mutual aid and community orgs.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "GheeBeans Crafty",
    category: "arts-crafts",
    url: "https://gheebeanscrafty.com/",
    excerpt:
      "Handmade crochet plushies — emotional support shrimp, sardines, banana slugs — and downloadable patterns. Charming in the best possible way.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Cosmic Pocket",
    category: "arts-crafts",
    url: "https://www.instagram.com/cosmic.pocket/",
    excerpt:
      "A multi-media artist and colorist creating handmade original art in Ohio, sold through Instagram.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Hot Mango Undies",
    category: "clothing",
    url: "https://hotmangoundies.bigcartel.com/",
    excerpt:
      "Made-to-order undies and bralettes in fun, rotating fabrics. Small-batch and personal in a way that mass-produced basics never are.",
    veganSupport: "supports-vegan-products",
  },
  {
    title: "Firestorm Books",
    category: "media",
    url: "https://firestorm.coop/",
    excerpt:
      "A collectively-owned radical bookstore and community event space in Asheville, NC, building grassroots movements in Southern Appalachia since 2008.",
    veganSupport: "supports-vegan-products",
  },
];

export const getRecommendations = (): Recommendation[] => {
  const parsed = recommendationSchema.array().parse(recommendations);
  parsed.forEach(validateRecommendationGuardrails);
  return parsed;
};
