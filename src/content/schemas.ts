import { z } from 'astro/zod';

export const writingSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  cover: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string(),
  summary: z.string(),
  year: z.number(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  url: z.string().url().optional(),
  repository: z.string().url().optional(),
});
