import { z } from "zod";

export const recommendationCategorySchema = z.enum([
  "arts-crafts",
  "food-drinks",
  "bath-body",
  "media",
  "clothing",
]);

export const recommendationSchema = z.object({
  title: z.string().min(1),
  category: recommendationCategorySchema,
  url: z.string().url(),
  excerpt: z.string().min(12),
  isFullyVegan: z.boolean().optional(),
});

export type RecommendationCategory = z.infer<
  typeof recommendationCategorySchema
>;
export type Recommendation = z.infer<typeof recommendationSchema>;
