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
  const cjkCharacterCount =
    body.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)
      ?.length ?? 0;
  const englishWordCount =
    body
      .replace(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu, ' ')
      .match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  const wordCount = cjkCharacterCount + englishWordCount;

  return Math.max(1, Math.ceil(wordCount / 200));
}

export function getFeaturedEntries<T extends FeaturedEntry>(entries: T[], count: number): T[] {
  return entries.filter((entry) => entry.data.featured).slice(0, count);
}
