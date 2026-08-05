import { existsSync } from 'node:fs';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'astro';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { site } from '../src/data/site';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const launchPlaceholderMarkers = [
  'your-email@example.com',
  '这里是个人简介占位文字。请替换为你的经历、关注方向，以及希望读者了解的信息。',
  '请替换为你的所在地',
  '编辑提示：这是示例文章。请把其中的经历、目标和表达替换成你自己的内容。',
  '编辑提示：这是示例文章。请替换为你真正使用的工具、流程和经验。',
  '编辑提示：这是示例文章。请用你的真实项目、数据和复盘结论替换本文。',
  '编辑提示：这是示例随笔，请替换成你的真实观察。',
  '编辑提示：发布前请确认上面的站点和仓库链接，并把项目说明替换为你的实际成果。',
  '编辑提示：这是作品占位条目。请替换标题、简介、年份、技术标签和正文；如果项目已上线，可在 front matter 中添加 <code>url</code> 与 <code>repository</code>。',
];

function findLaunchPlaceholders(publicOutput: string): string[] {
  return launchPlaceholderMarkers.filter((marker) => publicOutput.includes(marker));
}

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

  it('渲染图像主导的首页英雄区与突出文章', () => {
    expect(homeHtml).toContain('class="home-hero"');
    expect(homeHtml).toContain('class="home-hero__background"');
    expect(homeHtml).toContain('class="site-header site-header--overlay"');
    expect(homeHtml).toContain('fetchpriority="high"');
    expect(homeHtml).toContain('<h1 id="hero-title">在安静处，持续创造。</h1>');
    expect(homeHtml).toContain('阅读最新文章');
    expect(homeHtml).toContain('浏览作品');
    expect(homeHtml).toContain('最新写作');
    expect(homeHtml).toContain('article-card article-card--featured');
    expect(homeHtml).toContain('images/spring-blogs/hero-background.jpg');
    expect(homeHtml).not.toContain('raw.githubusercontent.com/RRTiamo');
    expect(homeHtml).not.toContain(
      '你好，这里是 liuhaojie 的个人博客，记录技术实践、写作方法与持续完成的作品。</h1>',
    );
    expect(homeHtml.indexOf('最新文章')).toBeLessThan(homeHtml.indexOf('作品精选'));
  });

  it('renders an accessible compact navigation shell', () => {
    expect(homeHtml).toContain('site-header--overlay');
    expect(homeHtml).toContain('data-menu-toggle');
    expect(homeHtml).toContain('aria-controls="primary-navigation"');
    expect(homeHtml).toContain('id="primary-navigation"');
  });

  it('为内页渲染编辑排版与间距系统的结构挂钩', async () => {
    const articlesHtml = await readFile(join(outputDirectory, 'articles', 'index.html'), 'utf8');
    const projectsHtml = await readFile(join(outputDirectory, 'projects', 'index.html'), 'utf8');
    const aboutHtml = await readFile(join(outputDirectory, 'about', 'index.html'), 'utf8');

    expect(articlesHtml).toContain('page-header page-header--editorial');
    expect(articlesHtml).toContain('listing listing--editorial');
    expect(projectsHtml).toContain('portfolio-grid--editorial');
    expect(projectsHtml).toContain('data-project-card');
    expect(aboutHtml).toContain('about-layout--editorial');
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
    const exposedMarkers = findLaunchPlaceholders(publicSiteDataAndPages);
    const aboutHtml = await readFile(join(outputDirectory, 'about', 'index.html'), 'utf8');

    expect(exposedMarkers).toEqual([]);
    expect(aboutHtml).not.toContain('mailto:');
    expect(aboutHtml).not.toContain('目前所在：');
  });
});

describe('launch placeholder detection', () => {
  it('允许作者在普通正文中讨论短提示用语', () => {
    const authorWrittenProse = '这篇文章讨论了“请替换”和“编辑提示”作为界面文案时的语气差异。';

    expect(findLaunchPlaceholders(authorWrittenProse)).toEqual([]);
  });

  it('仍识别完整的旧模板提示与默认邮箱', () => {
    const legacyTemplateOutput = [
      '联系邮箱：your-email@example.com',
      '编辑提示：这是示例文章。请把其中的经历、目标和表达替换成你自己的内容。',
    ].join('\n');

    expect(findLaunchPlaceholders(legacyTemplateOutput)).toEqual([
      'your-email@example.com',
      '编辑提示：这是示例文章。请把其中的经历、目标和表达替换成你自己的内容。',
    ]);
  });

  it('识别渲染为 HTML 的旧作品模板提示', () => {
    const renderedLegacyCallout =
      '编辑提示：这是作品占位条目。请替换标题、简介、年份、技术标签和正文；如果项目已上线，可在 front matter 中添加 <code>url</code> 与 <code>repository</code>。';

    expect(findLaunchPlaceholders(renderedLegacyCallout)).toEqual([renderedLegacyCallout]);
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
