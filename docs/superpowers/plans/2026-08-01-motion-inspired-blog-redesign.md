# Motion-inspired Personal Blog Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver and publish an image-led, accessible personal blog whose article discovery and GitHub-backed Markdown editing feel as polished as its visual design.

**Architecture:** Astro remains the static renderer and Markdown collections remain the source of truth. Shared layout, image metadata, edit-link generation, and small progressive-enhancement scripts live in focused components; CSS owns visual treatment and motion, so all content remains usable when JavaScript is unavailable.

**Tech Stack:** Astro 5, TypeScript, Astro content collections/Zod, CSS, Vitest, GitHub Pages.

## Global Constraints

- Use the user-authorized `RRTiamo/spring_blogs` hero image only after copying it locally; never render remote GitHub image URLs at runtime.
- Preserve GitHub Pages static deployment and Markdown files under `src/content/` as the canonical content store.
- No database, token, login screen, WYSIWYG editor, autoplay video, 3D scene, or infinite scrolling.
- UI movement must honor `prefers-reduced-motion`; content, navigation, and chronological article lists must work without JavaScript.
- Use semantic landmarks, heading order, keyboard-visible focus, and contrast-preserving image overlays.
- Run `npm test`, `npm run check`, and `npm run build` before deployment. Do not stage `.superpowers/` preview files.

---

## File structure

| File | Responsibility |
| --- | --- |
| `public/images/spring-blogs/hero-background.jpg` | Locally hosted, user-authorized hero asset with a format-correct extension. |
| `src/data/site.ts` | Site copy, source-repository metadata, image credit, and base-path-safe GitHub edit URL helpers. |
| `src/components/SiteHeader.astro` | Floating desktop/mobile navigation and accessible menu disclosure. |
| `src/components/HomeHero.astro` | Full-bleed hero visual and primary reading CTA. |
| `src/components/ArticleFilter.astro` | Progressive-enhancement filter/search controls for collection pages. |
| `src/components/ArticleActions.astro` | Copy permalink and configured GitHub Markdown edit link. |
| `src/components/ReadingProgress.astro` | Optional, client-side scroll progress enhancement. |
| `src/layouts/BaseLayout.astro` | Shared document shell, header/footer, optional home header mode. |
| `src/pages/index.astro` | Hero, featured writing, work, and profile sections. |
| `src/pages/articles/index.astro`, `src/pages/notes/index.astro` | Article/notes headings, filter data, and editorial listing layout. |
| `src/pages/articles/[...slug].astro`, `src/pages/notes/[...slug].astro` | Read layout, related navigation, progress, and edit action. |
| `src/styles/global.css` | Tokens, responsive layout, image treatment, progressive enhancements, and reduced-motion rules. |
| `docs/content-editing.md` | Exact Markdown/GitHub editing workflow for the site owner. |
| `tests/site.test.ts`, `tests/content.test.ts`, `tests/routes.test.ts` | URL generation, schema/data behavior, and rendered page contracts. |

## Task 1: Local asset, configuration, and test contracts

**Files:**
- Create: `public/images/spring-blogs/hero-background.jpg`
- Modify: `src/data/site.ts`
- Modify: `tests/site.test.ts`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- Produces `site.assets.homeHero` with `src`, `credit`, and `sourceUrl` strings.
- Produces `getGitHubEditUrl(collection: 'articles' | 'notes', entryId: string): string | undefined`.
- Later tasks consume `site.assets.homeHero.src` and the edit URL helper; both must be base-path independent.

- [ ] **Step 1: Write failing site-data tests**

```ts
it('creates GitHub edit links only for configured Markdown collections', async () => {
  const { getGitHubEditUrl } = await import('../src/data/site');
  expect(getGitHubEditUrl('articles', 'start-here')).toBe(
    'https://github.com/liuhaojie02/liuhaojie02.github.io/edit/main/src/content/articles/start-here.md',
  );
  expect(getGitHubEditUrl('notes', 'keep-a-small-log')).toContain('/src/content/notes/keep-a-small-log.md');
});
```

- [ ] **Step 2: Run the focused test to verify failure**

Run: `npx vitest run tests/site.test.ts`  
Expected: FAIL because `getGitHubEditUrl` is not exported.

- [ ] **Step 3: Fetch and normalize the authorized source image**

Run from the project root:

```bash
mkdir -p public/images/spring-blogs
curl -L --fail --output /tmp/spring-blogs-bg-image \
  https://raw.githubusercontent.com/RRTiamo/spring_blogs/master/public/bg-image.png
sips -s format jpeg /tmp/spring-blogs-bg-image --out public/images/spring-blogs/hero-background.jpg
sips -g pixelWidth -g pixelHeight public/images/spring-blogs/hero-background.jpg
```

Expected: a local JPEG with nonzero dimensions; retain a source/permission comment next to its configuration rather than an external runtime dependency.

- [ ] **Step 4: Implement site metadata and edit URL helper**

Add a `repository` object and `assets` object to `site`, then export a narrow helper:

```ts
type EditableCollection = 'articles' | 'notes';

export function getGitHubEditUrl(collection: EditableCollection, entryId: string): string | undefined {
  const normalizedId = entryId.replace(/^\/+|\/+$/g, '');
  if (!normalizedId || !/^[a-zA-Z0-9/_-]+$/.test(normalizedId)) return undefined;
  return `${site.repository.url}/edit/${site.repository.branch}/src/content/${collection}/${normalizedId}.md`;
}
```

Use `withBasePath('images/spring-blogs/hero-background.jpg')` for `site.assets.homeHero.src`, and store the reference repository URL as human-readable credit metadata.

- [ ] **Step 5: Preserve homepage rendering assertions for Task 3**

Task 1 does not render the homepage. Verify the local asset and site-data helper here; add the rendered home-page asset assertion in Task 3 after `HomeHero` exists.

- [ ] **Step 6: Run focused tests and inspect the asset**

Run: `npx vitest run tests/site.test.ts tests/routes.test.ts`  
Expected: PASS, and `file public/images/spring-blogs/hero-background.jpg` identifies a JPEG image.

- [ ] **Step 7: Commit the independently valid asset/configuration slice**

```bash
git add public/images/spring-blogs/hero-background.jpg src/data/site.ts tests/site.test.ts tests/routes.test.ts
git commit -m "feat: add authorized blog hero asset"
```

## Task 2: Shared layout, navigation, tokens, and footer

**Files:**
- Create: `src/components/SiteHeader.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- `BaseLayout` accepts `pageClass?: string` and `headerMode?: 'default' | 'overlay'`.
- `SiteHeader` accepts `{ navigation: readonly NavigationItem[]; homeHref: string; overlay?: boolean }`.
- Downstream pages set `headerMode="overlay"` only where a dark image hero is present.

- [ ] **Step 1: Write a failing rendered-layout test**

```ts
it('renders an accessible compact navigation shell', () => {
  expect(homeHtml).toContain('class="site-header site-header--overlay"');
  expect(homeHtml).toContain('data-menu-toggle');
  expect(homeHtml).toContain('aria-controls="primary-navigation"');
  expect(homeHtml).toContain('id="primary-navigation"');
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npx vitest run tests/routes.test.ts`  
Expected: FAIL because the old inline header has no menu control or overlay class.

- [ ] **Step 3: Extract `SiteHeader.astro` and pass `headerMode` through `BaseLayout`**

Use a button with a textual visually-hidden label and `aria-expanded="false"`; include all navigation links in the HTML before the inline progressive-enhancement script runs. Toggle a `data-menu-open` attribute on the header, update `aria-expanded`, and close on Escape.

```astro
<button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="primary-navigation">
  <span class="visually-hidden">打开导航</span><span aria-hidden="true"></span>
</button>
```

- [ ] **Step 4: Replace global tokens and shared CSS**

Define cool neutral, ink, accent, surface, and shadow custom properties. Implement:

```css
.site-header--overlay { position: absolute; inset: 0 0 auto; background: transparent; border: 0; }
.header-inner { margin: .9rem auto 0; padding: .65rem .8rem; border: 1px solid color-mix(in srgb, #fff 30%, transparent); border-radius: 1rem; background: color-mix(in srgb, var(--header-surface) 74%, transparent); backdrop-filter: blur(18px) saturate(135%); }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
```

At mobile widths, show a stacked navigation if JavaScript is absent, then collapse it only under a `.has-js` class added by the layout script.

- [ ] **Step 5: Redesign the footer as a quiet closing panel**

Retain copyright and social links; include local image credit text in a small, non-intrusive footer line. Do not use another full-bleed remote image.

- [ ] **Step 6: Run route tests and keyboard-check the header in a local dev server**

Run: `npx vitest run tests/routes.test.ts`  
Expected: PASS.  
Run: `npm run dev` and verify Tab reaches skip link, logo, menu, and all navigation links; verify Escape closes the enhanced menu.

- [ ] **Step 7: Commit layout slice**

```bash
git add src/components/SiteHeader.astro src/layouts/BaseLayout.astro src/styles/global.css tests/routes.test.ts
git commit -m "feat: add polished responsive site shell"
```

## Task 3: Home hero and editorial preview cards

**Files:**
- Create: `src/components/HomeHero.astro`
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- `HomeHero` consumes `{ intro: string; description: string; ctaHref: string; backgroundSrc: string }`.
- `ArticleCard` retains current `entry`, `href`, and `headingLevel` props, and adds optional `featured?: boolean`.
- The homepage provides the first latest article with `featured={true}` and keeps static semantic `article` markup.

- [ ] **Step 1: Write failing home-page hierarchy tests**

```ts
expect(homeHtml).toContain('class="home-hero"');
expect(homeHtml).toContain('class="home-hero__background"');
expect(homeHtml).toContain('fetchpriority="high"');
expect(homeHtml).toContain('article-card article-card--featured');
expect(homeHtml).toContain('images/spring-blogs/hero-background.jpg');
expect(homeHtml).not.toContain('raw.githubusercontent.com/RRTiamo');
expect(homeHtml.indexOf('最新文章')).toBeLessThan(homeHtml.indexOf('作品精选'));
```

- [ ] **Step 2: Run the route test to verify failure**

Run: `npx vitest run tests/routes.test.ts`  
Expected: FAIL because `HomeHero` and feature-card classes do not exist.

- [ ] **Step 3: Implement `HomeHero.astro`**

Render a decorative `<img>` with empty `alt`, eager/priority loading, and a separate overlay element. Keep heading and CTA in the normal document order:

```astro
<section class="home-hero" aria-labelledby="hero-title">
  <img class="home-hero__background" src={backgroundSrc} alt="" width="4200" height="2800" fetchpriority="high" />
  <div class="home-hero__overlay" aria-hidden="true"></div>
  <div class="shell home-hero__content">…</div>
</section>
```

- [ ] **Step 4: Implement editorial card variants**

Add a `data-tags` value containing lowercased tags and title to each card for Task 4. The primary article gets larger grid space, distinct but non-flashy accent, and an entire title/read link with visible focus treatment. Do not nest links.

- [ ] **Step 5: Compose homepage sections and responsive CSS**

Set the page `headerMode="overlay"`. Use a hero min-height of `min(46rem, 100svh)`, a contrast overlay, and only opacity/translate/reduced-scale transitions. On narrow viewports place feature and subsequent cards in one column; leave copy as actual text, never baked into images.

- [ ] **Step 6: Run focused tests and visual checks**

Run: `npx vitest run tests/routes.test.ts`  
Expected: PASS.  
Run: `npm run dev`; inspect 375px, 768px, and 1440px wide views and ensure hero copy remains legible over both light and dark areas of the image.

- [ ] **Step 7: Commit home slice**

```bash
git add src/components/HomeHero.astro src/components/ArticleCard.astro src/pages/index.astro src/styles/global.css tests/routes.test.ts
git commit -m "feat: create image-led editorial homepage"
```

## Task 4: Searchable article and note listings

**Files:**
- Create: `src/components/ArticleFilter.astro`
- Modify: `src/pages/articles/index.astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- `ArticleFilter` consumes `{ tags: string[]; label: string; resultsSelector: string }`.
- It expects cards matching `resultsSelector` to expose `data-tags` and `data-search` attributes.
- JavaScript enhances filtering only; the default rendered order remains reverse chronological.

- [ ] **Step 1: Write failing collection-listing assertions**

```ts
const articlesHtml = await readFile(join(outputDirectory, 'articles', 'index.html'), 'utf8');
expect(articlesHtml).toContain('data-article-filter');
expect(articlesHtml).toContain('data-filter-tag="all"');
expect(articlesHtml).toContain('data-article-card');
expect(articlesHtml).toContain('data-search=');
```

- [ ] **Step 2: Run the route test to verify failure**

Run: `npx vitest run tests/routes.test.ts`  
Expected: FAIL because the listing has no filter controls or filter data.

- [ ] **Step 3: Implement filter markup and data collection**

Derive tags with `Array.from(new Set(entries.flatMap((entry) => entry.data.tags))).sort((a, b) => a.localeCompare(b, 'zh-CN'))`. Render a search input and buttons with `aria-pressed`; active '全部' begins true.

- [ ] **Step 4: Add a small progressive-enhancement controller**

Within `ArticleFilter.astro`, query only its closest listing region. Filter by normalized `data-search` plus selected tag, assign `hidden` on nonmatching cards, update a live result count, and preserve all cards when script fails. Update `?tag=` and `?q=` via `history.replaceState` only after user input.

```ts
const matches = selectedTag === 'all' || tags.split('|').includes(selectedTag);
card.hidden = !matches || !searchText.includes(query);
```

- [ ] **Step 5: Style controls and empty state**

Make inputs and chips keyboard-visible, ensure `hidden` removes cards from layout, and use a `<p hidden data-filter-empty>` no-results message. Keep list cards plain readable rows beneath the controls.

- [ ] **Step 6: Run tests and manually test no-JS fallback**

Run: `npx vitest run tests/routes.test.ts`  
Expected: PASS.  
Run a local server, search a title and select a tag; then disable JavaScript and verify every article and note remains visible and linked.

- [ ] **Step 7: Commit filter slice**

```bash
git add src/components/ArticleFilter.astro src/pages/articles/index.astro src/pages/notes/index.astro src/styles/global.css tests/routes.test.ts
git commit -m "feat: add progressive article discovery filters"
```

## Task 5: Article reading experience, permalink actions, and edit flow

**Files:**
- Create: `src/components/ArticleActions.astro`
- Create: `src/components/ReadingProgress.astro`
- Modify: `src/pages/articles/[...slug].astro`
- Modify: `src/pages/notes/[...slug].astro`
- Modify: `src/styles/global.css`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- `ArticleActions` consumes `{ permalink: string; editUrl?: string }` and outputs a normal permalink plus optional edit anchor.
- `ReadingProgress` consumes `{ targetSelector: string }` and emits a purely decorative `data-reading-progress` element.
- Detail routes call `getGitHubEditUrl('articles' | 'notes', entry.id)` and calculate previous/next from `getPublishedEntries`.

- [ ] **Step 1: Write failing rendered article-detail tests**

```ts
const articleHtml = await readFile(join(outputDirectory, 'articles', 'start-here', 'index.html'), 'utf8');
expect(articleHtml).toContain('data-reading-progress');
expect(articleHtml).toContain('复制链接');
expect(articleHtml).toContain('编辑本文');
expect(articleHtml).toContain('/edit/main/src/content/articles/start-here.md');
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npx vitest run tests/routes.test.ts`  
Expected: FAIL because no action/progress components are rendered.

- [ ] **Step 3: Implement actions with resilient fallbacks**

Render the permalink as a visible `<a>` and a separate copy `<button>`. The script uses `navigator.clipboard?.writeText(location.href)` and updates only the button label; if unavailable it leaves the permalink usable. Render the GitHub editor anchor only when `editUrl` is defined, with `rel="noreferrer"` and no token/client authentication.

- [ ] **Step 4: Implement optional reading progress**

Render `<div class="reading-progress" data-reading-progress aria-hidden="true"><span></span></div>`. The enhancement calculates target scroll distance and sets `--reading-progress` with an animation-frame-throttled scroll handler. In reduced-motion mode, use no transition; if scripts fail, it remains a harmless 0% line.

- [ ] **Step 5: Add article hierarchy and adjacent navigation**

Place actions after metadata, give prose `id="article-content"`, and render adjacent published entries where present. Preserve covers using `toBaseAwareAssetUrl`. Apply a narrow serif prose column, legible code blocks, and no background image under body text.

- [ ] **Step 6: Run focused tests and interaction checks**

Run: `npx vitest run tests/routes.test.ts`  
Expected: PASS.  
In a browser, verify progress updates, copy feedback restores, previous/next links point to existing pages, and `编辑本文` opens the configured GitHub Markdown file.

- [ ] **Step 7: Commit article-interaction slice**

```bash
git add src/components/ArticleActions.astro src/components/ReadingProgress.astro src/pages/articles/'[...slug].astro' src/pages/notes/'[...slug].astro' src/styles/global.css tests/routes.test.ts
git commit -m "feat: improve article reading and editing actions"
```

## Task 6: Supporting pages, content author guide, and release verification

**Files:**
- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/projects/[...slug].astro`
- Modify: `src/pages/about.astro`
- Create: `docs/content-editing.md`
- Modify: `tests/content.test.ts`
- Modify: `tests/routes.test.ts`
- Modify: `src/styles/global.css`

**Interfaces:**
- Existing project frontmatter remains compatible: `{ title, summary, year, tags, featured, url?, repository? }`.
- `docs/content-editing.md` describes existing `writingSchema` fields and the GitHub edit-link behavior introduced in Task 5.

- [ ] **Step 1: Write failing content and render tests**

```ts
it('documents the supported authoring workflow', async () => {
  const guide = await readFile(new URL('../docs/content-editing.md', import.meta.url), 'utf8');
  expect(guide).toContain('src/content/articles');
  expect(guide).toContain('编辑本文');
  expect(guide).toContain('npm run dev');
});
```

Add a route assertion that the about page has the `about-hero` class and the projects page has `portfolio-grid--page` plus `data-project-card`.

- [ ] **Step 2: Run tests to verify failure**

Run: `npx vitest run tests/content.test.ts tests/routes.test.ts`  
Expected: FAIL because the guide and the new page hooks do not exist.

- [ ] **Step 3: Refine project/about presentation without changing content semantics**

Make projects use a responsive editorial tile grid with year/tag hierarchy. Make the about page use a calm desktop two-column opening and structured sections. Use gradients/textures only, no duplicate full-screen photo.

- [ ] **Step 4: Write the owner editing guide**

Include this exact frontmatter example and paths:

```md
---
title: 文章标题
description: 一句话摘要。
pubDate: 2026-08-01
tags: [写作, 工具]
draft: false
cover: /images/covers/example.jpg
---
```

Document creating `src/content/articles/<slug>.md`, local preview via `npm run dev`, GitHub web editing through the `编辑本文` action, and publishing by committing/pushing to `main`.

- [ ] **Step 5: Run all automated verification**

Run: `npm test`  
Expected: PASS.

Run: `npm run check`  
Expected: 0 errors and 0 warnings.

Run: `npm run build`  
Expected: static HTML output completes successfully.

- [ ] **Step 6: Perform final visual/accessibility checks**

Run a production preview and inspect home, articles, a detail article, notes, projects, and about at 375px, 768px, and 1440px. Keyboard-test skip link, desktop/mobile nav, chips, cards, copy action, and edit link. Simulate reduced motion and image failure; text must stay legible.

- [ ] **Step 7: Commit final implementation and publish**

```bash
git add src/pages src/styles/global.css docs/content-editing.md tests/content.test.ts tests/routes.test.ts
git commit -m "feat: complete motion-inspired blog redesign"
git push origin main
```

After GitHub Pages reports success, fetch `https://liuhaojie02.github.io/` and one article URL to confirm the deployed HTML includes the hero image and article action controls.

## Plan self-review

- **Spec coverage:** Tasks 1–3 implement the local authorized asset, hero, shared visual system, navigation, cards, and motion. Task 4 implements article discovery. Task 5 implements reading, copy, direct GitHub edit, and adjacent navigation. Task 6 covers projects/about, author documentation, test, accessibility, and deployment.
- **Failure handling:** Each enhanced behavior specifies semantic/no-script fallback; image and edit-link failure behavior is explicit in Tasks 1, 2, 4, and 5.
- **Completeness scan:** Every task has concrete paths, commands, test assertions, and named interfaces; no deferred implementation markers remain.
- **Type consistency:** `getGitHubEditUrl`, `HomeHero`, `ArticleFilter`, `ArticleActions`, and `ReadingProgress` names/props match their consumers in later tasks.
