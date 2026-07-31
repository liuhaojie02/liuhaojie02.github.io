type PublishedEntry = {
  data: {
    pubDate: Date;
    draft?: boolean;
  };
};

type FeaturedEntry = {
  data: {
    featured?: boolean;
  };
};

export function getPublishedEntries<T extends PublishedEntry>(entries: T[]): T[] {
  return entries
    .filter((entry) => !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function getLatestEntries<T extends PublishedEntry>(entries: T[], count: number): T[] {
  return getPublishedEntries(entries).slice(0, count);
}

export function getReadingMinutes(body: string): number {
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return Math.max(1, Math.ceil(wordCount / 200));
}

export function getFeaturedEntries<T extends FeaturedEntry>(entries: T[], count: number): T[] {
  return entries.filter((entry) => entry.data.featured).slice(0, count);
}
