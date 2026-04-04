import { defineCollection, z } from 'astro:content';

const guides = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    publishedAt: z.coerce.date()
  })
});

export const collections = { guides };
