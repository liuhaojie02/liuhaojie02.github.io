import { afterEach, describe, expect, it, vi } from 'vitest';

describe('site navigation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('keeps internal links under the configured project base path', async () => {
    vi.stubEnv('BASE_URL', '/personal-blog/');

    const { site } = await import('../src/data/site');

    expect(site.navigation.map((item) => item.href)).toEqual([
      '/personal-blog/',
      '/personal-blog/articles/',
      '/personal-blog/notes/',
      '/personal-blog/projects/',
      '/personal-blog/about/',
    ]);
  });

  it('creates GitHub edit links only for configured Markdown collections', async () => {
    const { getGitHubEditUrl } = await import('../src/data/site');

    expect(getGitHubEditUrl('articles', 'start-here')).toBe(
      'https://github.com/liuhaojie02/liuhaojie02.github.io/edit/main/src/content/articles/start-here.md',
    );
    expect(getGitHubEditUrl('notes', 'keep-a-small-log')).toContain(
      '/src/content/notes/keep-a-small-log.md',
    );
  });
});
