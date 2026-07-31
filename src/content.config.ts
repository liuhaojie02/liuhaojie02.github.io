import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema, writingSchema } from './content/schemas';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: writingSchema,
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: writingSchema,
});

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: projectSchema,
});

export const collections = { articles, notes, projects };
