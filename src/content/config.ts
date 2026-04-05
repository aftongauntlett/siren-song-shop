import { defineCollection, z } from "astro:content";

const guides = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    publishedAt: z.coerce.date(),
  }),
});

const resources = defineCollection({
  type: "data",
  schema: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    category: z.enum(["orgs", "hiring", "charities"]),
    description: z.string().min(1),
    featured: z.boolean().default(false),
  }),
});

export const collections = { guides, resources };
