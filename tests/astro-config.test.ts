import { describe, expect, it } from 'vitest';
import config from '../astro.config.mjs';

describe('Astro deployment configuration', () => {
  it('uses the GitHub user-site URL without a project base path', () => {
    expect(config.site).toBe('https://liuhaojie.github.io');
    expect(config.base).toBeUndefined();
  });
});
