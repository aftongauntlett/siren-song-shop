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
      `Recommendation "${item.title}" violates curation guardrails.`,
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
  },
  {
    title: "Alkemia",
    category: "bath-body",
    url: "https://alkemiaperfumes.com/",
    excerpt:
      "Our alchemies are experimental perfumes blended intuitively for the season and with no written recipe. We release a new one every month.",
    isFullyVegan: true,
  },
  {
    title: "Little & Grim",
    category: "bath-body",
    url: "https://www.littleandgrim.com/",
    excerpt:
      "Handmade perfume, soap, and sundries for the weird and wonderful. A small, fully vegan indie shop with a huge catalog of unique scents and products.",
    isFullyVegan: true,
  },
  {
    title: "Fyrinnae",
    category: "bath-body",
    url: "https://fyrinnae.com/",
    excerpt:
      "A small indie cosmetics company with a huge catalog of cruelty-free, vegan-friendly makeup and body products.",
    isFullyVegan: true,
  },
  {
    title: "Loreworks",
    category: "bath-body",
    url: "https://www.realmoflore.com/",
    excerpt:
      "A small-batch indie perfumery with a huge catalog of cruelty-free, vegan-friendly bath and body scents inspired by folklore, history, and the natural world.",
  },
  {
    title: "Hexennacht",
    category: "bath-body",
    url: "https://www.hexennacht.com/",
    excerpt:
      "Small-batch, cruelty-free perfumes, incense, and body care products are almost entirely vegan - with just a few exceptions made.",
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
    isFullyVegan: true,
  },
  {
    title: "UNLIMEAT",
    category: "food-drinks",
    url: "https://unlimeat.co/",
    excerpt:
      "Plant-Based Meat, Balanced Meal, Trendy Korean Dessert, K-Food. Explore bold, authentic Korean flavors with our plant-based meats, including vegan kimbap, bulgogi, and Korean fried chicken. Available in stores nationwide.",
    isFullyVegan: true,
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
    title: "Birds Before the Storm",
    category: "media",
    url: "https://margaretkilljoy.substack.com/",
    excerpt:
      "Individual and community preparedness. Memoirs of an anarchist life. Reflections on history. Click to read Birds Before the Storm, by Margaret Killjoy, a Substack publication with tens of thousands of subscribers.",
  },
  {
    title: "Known Supply",
    category: "clothing",
    url: "https://knownsupply.com/",
    excerpt:
      "An everyday basics brand with transparent maker stories and a cleaner approach to wardrobe staples.",
  },
  {
    title: "The Peach Fuzz",
    category: "arts-crafts",
    url: "https://shop.thepeachfuzz.co/",
    excerpt:
      "Artist-made hair claws, accessories, and novelties with genuine anti-capitalist energy — 10% of every sale goes directly to mutual aid and community orgs.",
  },
  {
    title: "GheeBeans Crafty",
    category: "arts-crafts",
    url: "https://gheebeanscrafty.com/",
    excerpt:
      "Handmade crochet plushies — emotional support shrimp, sardines, banana slugs — and downloadable patterns. Charming in the best possible way.",
  },
  {
    title: "Cosmic Pocket",
    category: "arts-crafts",
    url: "https://www.instagram.com/cosmic.pocket/",
    excerpt:
      "A multi-media artist and colorist creating handmade original art in Ohio, sold through Instagram.",
  },
  {
    title: "Hot Mango Undies",
    category: "clothing",
    url: "https://hotmangoundies.bigcartel.com/",
    excerpt:
      "Made-to-order undies and bralettes in fun, rotating fabrics. Small-batch and personal in a way that mass-produced basics never are.",
  },
  {
    title: "Firestorm Books",
    category: "media",
    url: "https://firestorm.coop/",
    excerpt:
      "A collectively-owned radical bookstore and community event space in Asheville, NC, building grassroots movements in Southern Appalachia since 2008.",
  },
];

export const getRecommendations = (): Recommendation[] => {
  const parsed = recommendationSchema.array().parse(recommendations);
  parsed.forEach(validateRecommendationGuardrails);
  return parsed;
};
