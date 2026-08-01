import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'astro';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { site } from '../src/data/site';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const launchPlaceholderMarkers = ['your-email@example.com', '请替换', '编辑提示'];
let outputDirectory: string;
let homeHtml: string;
let publicHtml: string;

describe('public routes', () => {
  beforeAll(async () => {
    outputDirectory = await mkdtemp(join(tmpdir(), 'personal-blog-routes-'));

    await build({
      root: projectRoot,
      outDir: outputDirectory,
      logLevel: 'silent',
    });

    homeHtml = await readFile(join(outputDirectory, 'index.html'), 'utf8');
    const outputFiles = await readdir(outputDirectory, { recursive: true });
    const renderedPages = await Promise.all(
      outputFiles
        .filter((filename) => filename.endsWith('.html'))
        .map((filename) => readFile(join(outputDirectory, filename), 'utf8')),
    );
    publicHtml = renderedPages.join('\n');
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

  it('为没有外部链接的作品提供内部详情路由', async () => {
    const projectsHtml = await readFile(join(outputDirectory, 'projects', 'index.html'), 'utf8');
    const detailPath = join(outputDirectory, 'projects', 'focus-tool', 'index.html');

    expect(projectsHtml).toContain('href="/projects/focus-tool/"');
    expect(existsSync(detailPath)).toBe(true);

    if (!existsSync(detailPath)) return;

    const detailHtml = await readFile(detailPath, 'utf8');
    expect(detailHtml).toContain('<h1>专注记录工具（示例）</h1>');
    expect(detailHtml).toContain('用尽量少的操作记录一次专注时段');
    expect(detailHtml).toContain('>2026<');
    expect(detailHtml).toContain('>Web<');
  });

  it('不发布启动占位符或缺失的联系信息', async () => {
    const publicSiteDataAndPages = `${JSON.stringify(site)}\n${publicHtml}`;
    const exposedMarkers = launchPlaceholderMarkers.filter((marker) =>
      publicSiteDataAndPages.includes(marker),
    );
    const aboutHtml = await readFile(join(outputDirectory, 'about', 'index.html'), 'utf8');

    expect(exposedMarkers).toEqual([]);
    expect(aboutHtml).not.toContain('mailto:');
    expect(aboutHtml).not.toContain('目前所在：');
  });
});

describe('content asset URLs', () => {
  it('为本地文章封面加上站点基础路径但不改变外部 URL', async () => {
    const siteModule = await import('../src/data/site');
    const toBaseAwareAssetUrl = (
      siteModule as typeof siteModule & {
        toBaseAwareAssetUrl?: (assetUrl: string, base: string) => string;
      }
    ).toBaseAwareAssetUrl;

    expect(toBaseAwareAssetUrl?.('/covers/example.png', '/personal-blog/')).toBe(
      '/personal-blog/covers/example.png',
    );
    expect(toBaseAwareAssetUrl?.('https://cdn.example.com/cover.png', '/personal-blog/')).toBe(
      'https://cdn.example.com/cover.png',
    );
  });
});
