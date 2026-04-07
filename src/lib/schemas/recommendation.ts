import { z } from "zod";

export const recommendationCategorySchema = z.enum([
  "arts-crafts",
  "food-drinks",
  "bath-body",
  "media",
  "clothing",
]);

export const recommendationVeganSupportSchema = z.enum([
  "supports-vegan-products",
  "fully-vegan-shop",
]);

export const recommendationSchema = z.object({
  title: z.string().min(1),
  category: recommendationCategorySchema,
  url: z.string().url(),
  excerpt: z.string().min(12),
  veganSupport: recommendationVeganSupportSchema,
});

export type RecommendationCategory = z.infer<
  typeof recommendationCategorySchema
>;
export type RecommendationVeganSupport = z.infer<
  typeof recommendationVeganSupportSchema
>;
export type Recommendation = z.infer<typeof recommendationSchema>;
