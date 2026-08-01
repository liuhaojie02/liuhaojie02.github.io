import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'astro';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
let outputDirectory: string;
let homeHtml: string;

describe('public routes', () => {
  beforeAll(async () => {
    outputDirectory = await mkdtemp(join(tmpdir(), 'personal-blog-routes-'));

    await build({
      root: projectRoot,
      outDir: outputDirectory,
      logLevel: 'silent',
    });

    homeHtml = await readFile(join(outputDirectory, 'index.html'), 'utf8');
  }, 30_000);

  afterAll(async () => {
    if (outputDirectory) await rm(outputDirectory, { recursive: true, force: true });
  });

  it('渲染首页编辑顺序与完整的主导航', () => {
    expect(homeHtml).toContain('最新文章');
    expect(homeHtml).toContain('作品精选');
    expect(homeHtml.indexOf('最新文章')).toBeLessThan(homeHtml.indexOf('作品精选'));
    expect(homeHtml).toContain('aria-label="主导航"');

    for (const label of ['文章', '随笔', '作品', '关于']) {
      expect(homeHtml).toContain(`>${label}</a>`);
    }
  });
});
