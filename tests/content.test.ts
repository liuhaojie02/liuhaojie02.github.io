import { readdir, readFile } from 'node:fs/promises';
import type { ZodType } from 'astro/zod';
import { parseFrontmatter } from '@astrojs/markdown-remark';
import { describe, expect, it } from 'vitest';
import { projectSchema, writingSchema } from '../src/content/schemas';
import {
  getFeaturedEntries,
  getLatestEntries,
  getPublishedEntries,
  getReadingMinutes,
} from '../src/lib/content';

const entries = [
  { id: 'old', data: { pubDate: new Date('2024-01-01') } },
  { id: 'draft', data: { pubDate: new Date('2024-04-01'), draft: true } },
  { id: 'middle', data: { pubDate: new Date('2024-02-01') } },
  { id: 'new', data: { pubDate: new Date('2024-03-01') } },
];

const projects = [
  { id: 'first', data: { pubDate: new Date('2024-01-01'), featured: true } },
  { id: 'hidden', data: { pubDate: new Date('2024-01-02') } },
  { id: 'second', data: { pubDate: new Date('2024-01-03'), featured: true } },
  { id: 'third', data: { pubDate: new Date('2024-01-04'), featured: true } },
];

async function loadCollection(directoryName: string, schema: ZodType) {
  const directory = new URL(`../src/content/${directoryName}/`, import.meta.url);
  let filenames: string[];

  try {
    filenames = await readdir(directory, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }

  return Promise.all(
    filenames
      .filter((filename) => /\.mdx?$/.test(filename))
      .map(async (filename) => {
        const source = await readFile(new URL(filename, directory), 'utf8');
        const { frontmatter } = parseFrontmatter(source);

        return { id: filename.replace(/\.mdx?$/, ''), data: schema.parse(frontmatter) };
      }),
  );
}

describe('content queries', () => {
  it('excludes drafts and sorts published entries in reverse chronological order', () => {
    expect(getPublishedEntries(entries).map((entry) => entry.id)).toEqual([
      'new',
      'middle',
      'old',
    ]);
    expect(getPublishedEntries(entries).map((entry) => entry.id)).not.toContain('draft');
  });

  it('returns no more than the requested number of latest published entries', () => {
    expect(getLatestEntries(entries, 3).map((entry) => entry.id)).toEqual([
      'new',
      'middle',
      'old',
    ]);
  });

  it('returns a one-minute minimum and rounds reading time up at 200 words per minute', () => {
    expect(getReadingMinutes('')).toBe(1);
    expect(getReadingMinutes('word '.repeat(201))).toBe(2);
  });

  it('counts Chinese characters when estimating reading time', () => {
    expect(getReadingMinutes('文'.repeat(201))).toBe(2);
  });

  it('returns only featured projects up to the requested limit', () => {
    expect(getFeaturedEntries(projects, 2).map((entry) => entry.id)).toEqual([
      'first',
      'second',
    ]);
  });

  it('loads the public starter entries from the configured collections', async () => {
    const [articles, notes, projects] = await Promise.all([
      loadCollection('articles', writingSchema),
      loadCollection('notes', writingSchema),
      loadCollection('projects', projectSchema),
    ]);
    const publishedArticles = getPublishedEntries(articles);
    const publishedNotes = getPublishedEntries(notes);

    expect(publishedArticles).toHaveLength(3);
    expect(publishedNotes).toHaveLength(1);
    expect(projects).toHaveLength(2);
  });
});
