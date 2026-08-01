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
});
