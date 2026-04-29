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
  // Bath & Body additions
  {
    title: "Lovesick Witchery",
    category: "bath-body",
    url: "https://www.lovesickwitchery.com/",
    excerpt:
      "Adorers of the strange are everywhere. The creeps, the lovers of horror and decay, the weirdos. Lovesick is for all of us. A love letter to the ghastly. Perfumes for the darkly inclined, handcrafted with magic.",
  },
  {
    title: "Nui Cobalt Designs",
    category: "bath-body",
    url: "https://nuicobaltdesigns.com/",
    excerpt:
      "Handcrafted Magickal perfume oils, natural wax candles, bath spells, and sundries for the Magickally-minded. Each is carefully charged under optimal astrological conditions.",
  },
  {
    title: "Crow and Pebble",
    category: "bath-body",
    url: "https://crowandpebble.com/",
    excerpt:
      "Hand-blended makeup, crafted in Scotland. Small-batch products draw inspiration from literature, myths, and folklore. Each item is handmade, filled to order, and designed to tell stories.",
  },
  {
    title: "Simon's Nest",
    category: "bath-body",
    url: "https://www.simonsnest.com/",
    excerpt:
      "Hand-drawn whimsical and gothic illustrations, perfumes, wax melts and other gift items. Created and produced by Autumn Simons.",
  },
  {
    title: "Luvmilk",
    category: "bath-body",
    url: "https://www.luvmilk.com/",
    excerpt:
      "Luvmilk Bath and Body was born from one person's self-care journey — handmade, fresh-to-order bath and body treats made with love and packed by hand, just for you.",
  },
  {
    title: "Blackhearted Tart",
    category: "bath-body",
    url: "https://blackheartedtart.com/",
    excerpt:
      "Indie Perfume + Bath & Body for Indie Music Lovers! Freshly Made for You!",
  },
  {
    title: "Pulp Fragrance",
    category: "bath-body",
    url: "https://pulpfragrance.com/",
    excerpt:
      "Artisan perfumery crafts unique, small-batch unisex fragrances. Offerings include indie perfumes and handmade scented bath, body, and home products.",
  },
  {
    title: "Morari Perfumes",
    category: "bath-body",
    url: "https://morariperfumes.com/",
    excerpt:
      "A passion project turned perfume house — MORARI crafts whimsical, skin-safe perfume oils for those who love a scent that lingers. Each 5ml rollerball is blended by a lifelong fragrance obsessive with a flair for the unexpected.",
  },
  {
    title: "Astrid Perfume",
    category: "bath-body",
    url: "https://www.astridperfume.com/",
    excerpt:
      "Astrid Perfume makes exquisite, cruelty-free, perfume and bath items inspired by art nouveau, nature, animals, horses, goth, victoriana, and dark esoteric themes.",
  },
  {
    title: "Birch and Besom",
    category: "bath-body",
    url: "https://www.birchandbesom.com/",
    excerpt:
      "Add some magic to your self-care ritual! We make uniquely irresistible perfumes with a whimsical, witchy vibe.",
  },
  {
    title: "Deconstructing Eden",
    category: "bath-body",
    url: "https://shop.deconstructingeden.net/",
    excerpt:
      "A musician-turned-perfumer who treats fragrance like composition — Toni Sinclair crafts vegan, cruelty-free scents inspired by folklore, mythology, and the dark and esoteric. Every blend is a symphony for the skin.",
    isFullyVegan: true,
  },
  {
    title: "Pearfat Parfum",
    category: "bath-body",
    url: "https://www.pearfatparfum.com/",
    excerpt:
      "Pearfat Parfum combines classical perfumery techniques with modern olfactory innovations to create nods to pop culture, a space for gender fluidity, & scents that speak to instigators. A purveyor of handmade niche fragrance from the midwest.",
  },
  {
    title: "SAMAR Scent Studio",
    category: "bath-body",
    url: "https://www.samarscentstudio.com/",
    excerpt:
      "Shop our collection of transportive, genderful oil perfumes. SAMAR Scent Studio is an award winning duo crafting lush, olfactory vignettes.",
  },
  {
    title: "Paintbox Soapworks",
    category: "bath-body",
    url: "https://paintboxsoapworks.com/",
    excerpt:
      "A rule-breaking soap and fragrance studio born from a desk-job escape — Paintbox Soapworks specializes in coconut-free, vegan formulas across 300+ unique scents inspired by nature, literature, music, and a touch of secular witchcraft.",
  },
  {
    title: "Athame and Alchemy",
    category: "bath-body",
    url: "https://www.athameandalchemy.com/",
    excerpt:
      "A Miami-based indie apothecary born from COVID lockdown alchemy — Kimberly blends soaps, scrubs, wax melts, and body care with creative, ever-evolving scent catalogs, all packaged with a commitment to sustainability and zero pretension.",
  },
  {
    title: "Fae Fragrance",
    category: "bath-body",
    url: "https://faefragrance.com/",
    excerpt:
      "A small-batch shop run by Kylie, who crafts and creates on her own terms — sharing her work and her story with honesty, heart, and no pressure to be anything other than human.",
  },
  {
    title: "Blood Moon Botanica",
    category: "bath-body",
    url: "https://bloodmoonbotanica.com/",
    excerpt:
      "Blood Moon Botanica offers handcrafted perfumes, cold process soaps, herbal skin care, and magical goods for modern mystics and nature lovers.",
  },
  {
    title: "Cardinal Scents",
    category: "bath-body",
    url: "https://cardinalscents.com/",
    excerpt:
      "Miniature poetries and bottled memories — Cardinal Scents is an independent artisan perfumery crafting scents that linger like a feeling you can't quite name.",
  },
  {
    title: "Mount Royal Soaps",
    category: "bath-body",
    url: "https://www.mountroyalsoaps.com/",
    excerpt:
      "A Baltimore-born soap company founded in 2014 by three friends in recovery — Matt, Pat, and Sam turned a healing hobby into a thriving small batch studio crafting palm-free, plant-based soaps, skincare, and home goods with a deep commitment to sustainability and their community.",
  },
  {
    title: "Punk and Dandy",
    category: "bath-body",
    url: "https://punkanddandy.net/",
    excerpt:
      "A husband-and-wife indie perfumery from Asheville, NC — where punk rebellion meets refined dandyism. Zack and Serenity craft fragrances inspired by fine art, 80s punk, and the unapologetic spirit of self-expression.",
  },
  {
    title: "Arcana Wildcraft",
    category: "bath-body",
    url: "https://arcanawildcraft.com/",
    excerpt:
      "A two-decade-strong indie perfume house from Port Angeles, Washington — Arcana Wildcraft blends ancient technique with witchcraft, wild-harvested botanicals, and hand-distilled oils to create deeply concentrated, small-batch scents made for everywhere magic happens.",
  },
  {
    title: "Stone and Wit",
    category: "bath-body",
    url: "https://www.stoneandwit.com/",
    excerpt:
      "A literature-obsessed indie perfumer crafting handmade, ethically sourced perfume oils and beard oils — with scents drawn from fantasy fiction, punk, and post-hardcore, for people who wear their passions on their skin.",
  },
  {
    title: "Cirrus Parfum",
    category: "bath-body",
    url: "https://cirrusparfum.com/",
    excerpt:
      "A perfume house born from the search for something more — Zoey Lake launched Cirrus Parfum in 2024 to bring accessible, elegant fragrances that don't shout, but amplify. Like the clouds they're named for, these scents are designed to enhance who you already are.",
  },
  // Nails
  {
    title: "Lurid Lacquer",
    category: "bath-body",
    url: "https://luridlacquer.com/",
    excerpt:
      "An indie nail polish brand by Karen — offensively vibrant, scandalously emotional, and born from grief turned into art. Each collection tells a story, with polish names drawn from Karen's own poetry.",
  },
  // Candles & Jewelry additions
  {
    title: "Sihaya & Company",
    category: "arts-crafts",
    url: "https://sihayaandcompany.com/",
    excerpt:
      "A Maryland-based indie studio founded by jewelry-artist-turned-candlemaker Christina Allen Page — Sihaya & Company crafts themed candle collections, bath and body, and jewelry while championing independent artisans at every turn.",
  },
  {
    title: "WillowWaxCraft",
    category: "arts-crafts",
    url: "https://www.etsy.com/shop/WillowWaxCraft",
    excerpt:
      "A scent museum in wax form — Samantha crafts complex, perfume-inspired wax melts drawn from books, films, dreams, and everywhere in between, with blends that range from comforting to delightfully unsettling. Not your average candle shop.",
  },
  {
    title: "Wick Wish",
    category: "arts-crafts",
    url: "https://wickwish.com/",
    excerpt:
      "A Northern California studio crafting small-batch candles, wax melts, perfume oils, and hand-stamped jewelry for anyone who loves to lose themselves in a good story — scent-inspired by literature, myth, and the magic in between.",
  },
  {
    title: "Cantrip Candles",
    category: "arts-crafts",
    url: "https://cantripcandles.com/",
    excerpt:
      "Born from a tabletop gaming night and a spilled beer — Cantrip Candles crafts vegan, small-batch soy candles designed to bring atmosphere and immersion to your game table, with scents that actually smell like what they say they do.",
  },
  {
    title: "Serpent & Flame",
    category: "arts-crafts",
    url: "https://www.serpentandflame.com/",
    excerpt:
      "A fandom-inspired fragrance shop run by Andi, who has spent nearly a decade crafting scents that celebrate the books, shows, and characters her customers love — driven by one simple goal: bringing joy.",
  },
  {
    title: "Become Spellbound",
    category: "arts-crafts",
    url: "https://www.becomespellbound.com/",
    excerpt:
      "A Baltimore-based jewelry artist and lifelong crystal devotee — Kari Dern left a corporate career in Manhattan in 2017 to create full time, handcrafting gemstone jewelry inspired by mythology, natural history, and the magic of the everyday world.",
  },
];

export const getRecommendations = (): Recommendation[] => {
  const parsed = recommendationSchema.array().parse(recommendations);
  parsed.forEach(validateRecommendationGuardrails);
  return parsed;
};
