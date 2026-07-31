import { describe, expect, it } from 'vitest';
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

  it('returns only featured projects up to the requested limit', () => {
    expect(getFeaturedEntries(projects, 2).map((entry) => entry.id)).toEqual([
      'first',
      'second',
    ]);
  });
});
