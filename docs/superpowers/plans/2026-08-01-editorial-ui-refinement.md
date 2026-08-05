# Editorial UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the oversized, repetitive hero and uneven typography with a calm editorial UI system across the blog, then deploy the verified result to GitHub Pages.

**Architecture:** Keep Astro, content collections, and the current local hero asset. Move home-specific copy into `site.home`, keep `HomeHero` a presentational component, and apply the editorial system through CSS and existing page/component contracts rather than a UI library or client framework.

**Tech Stack:** Astro 5, TypeScript, CSS, Astro content collections, Vitest, GitHub Pages.

## Global Constraints

- Hero title is exactly `在安静处，持续创造。`; `liuhaojie` remains brand/navigation text and does not appear in the hero `h1`.
- Hero display is maximum two lines, uses `clamp(48px, 5.2vw, 80px)`, and keeps the local user-authorized image source.
- Preserve static GitHub Pages deployment, Markdown content, semantic landmarks, keyboard focus, reduced-motion behavior, and no-script navigation.
- No video, 3D/cursor effects, carousel, third-party UI library, external image runtime dependency, or authoring-flow change.
- Test and build before pushing; deploy directly to `main` once all checks pass.

---

## File structure

| File | Responsibility |
| --- | --- |
| `src/data/site.ts` | Configured home title, lead, primary/secondary action copy, and existing asset metadata. |
| `src/components/HomeHero.astro` | Semantic image-led home hero rendered from explicit props. |
| `src/components/ArticleCard.astro` | Standard and featured article presentation with Chinese feature label. |
| `src/components/PortfolioCard.astro` | Project card hook for the uniform editorial grid. |
| `src/pages/index.astro` | Passes configured home copy and composes feature/latest sections. |
| `src/pages/articles/index.astro`, `src/pages/notes/index.astro` | Editorial listing page hooks without changing collection queries. |
| `src/pages/projects/index.astro`, `src/pages/about.astro` | Uniform page-level editorial layout hooks. |
| `src/styles/global.css` | Type scale, measure, page spacing, image composition, and responsive rules. |
| `tests/site.test.ts`, `tests/routes.test.ts` | Content/config and rendered UI contracts. |

## Task 1: Recompose the home hero and latest-writing hierarchy

**Files:**
- Modify: `src/data/site.ts`
- Modify: `src/components/HomeHero.astro`
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/site.test.ts`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- `site.home` produces `{ eyebrow, title, description, primaryAction, secondaryAction, marker }` string fields.
- `HomeHero` consumes `{ eyebrow, title, description, primaryHref, primaryLabel, secondaryHref, secondaryLabel, marker, backgroundSrc }`.
- `ArticleCard` retains `entry`, `href`, `headingLevel`, and `featured`; it renders `最新写作` only when `featured` is true.

- [ ] **Step 1: Write failing home configuration and route tests**

```ts
expect(site.home.title).toBe('在安静处，持续创造。');
expect(site.home.title).not.toContain('liuhaojie');
expect(homeHtml).toContain('<h1 id="hero-title">在安静处，持续创造。</h1>');
expect(homeHtml).toContain('阅读最新文章');
expect(homeHtml).toContain('浏览作品');
expect(homeHtml).toContain('最新写作');
expect(homeHtml).not.toContain('你好，这里是 liuhaojie 的个人博客，记录技术实践、写作方法与持续完成的作品。</h1>');
```

- [ ] **Step 2: Run the focused tests to verify failure**

Run: `npx vitest run tests/site.test.ts tests/routes.test.ts`  
Expected: FAIL because `site.home` and the short hero markup do not exist.

- [ ] **Step 3: Add configured copy and explicit hero props**

Implement the source-of-truth copy:

```ts
home: {
  eyebrow: 'THINK · MAKE · SHARE',
  title: '在安静处，持续创造。',
  description: '关于技术、写作与正在完成的作品。把短暂的经验，整理成值得反复返回的内容。',
  primaryAction: '阅读最新文章',
  secondaryAction: '浏览作品',
  marker: '01 / PERSONAL JOURNAL',
},
```

Render the hero title from `title`, not `site.author.intro`; output a primary anchor and a quiet secondary anchor. Keep the image decorative (`alt=""`) and the hero title as the only `h1`.

- [ ] **Step 4: Add the home CSS composition**

Use the target display scale and measure:

```css
.home-hero__title { max-width: 8ch; font-size: clamp(48px, 5.2vw, 80px); line-height: .98; letter-spacing: -.065em; }
.home-hero__content { width: min(100% - 2.5rem, 30rem); padding-block: clamp(8rem, 18vh, 11rem) clamp(3rem, 8vh, 5rem); }
.home-hero__copy { max-width: 28rem; font-size: clamp(1rem, 1.35vw, 1.18rem); line-height: 1.7; }
```

Place the marker in the lower-right visual area and hide it under 44rem. Move the background focal point so the moon and flowers are not under text. Make the featured card label `最新写作` in Chinese and remove the old English pseudo-label.

- [ ] **Step 5: Run focused verification and inspect the page**

Run: `npx vitest run tests/site.test.ts tests/routes.test.ts`  
Expected: PASS.

Run: `npm run check && npm run build`  
Expected: 0 Astro diagnostics and 12 static pages built.

Inspect at 375px, 768px, and 1440px: title must not exceed two lines at desktop, must not overlap navigation, and must leave the moon/flowers visibly unobstructed.

- [ ] **Step 6: Commit the home hierarchy**

```bash
git add src/data/site.ts src/components/HomeHero.astro src/components/ArticleCard.astro src/pages/index.astro src/styles/global.css tests/site.test.ts tests/routes.test.ts
git commit -m "feat: refine editorial home hierarchy"
```

## Task 2: Apply the editorial type and spacing system to every page

**Files:**
- Modify: `src/components/PortfolioCard.astro`
- Modify: `src/pages/articles/index.astro`
- Modify: `src/pages/notes/index.astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/styles/global.css`
- Modify: `tests/routes.test.ts`

**Interfaces:**
- Existing content collection and card prop contracts remain unchanged.
- New class hooks are `page-header--editorial`, `listing--editorial`, `portfolio-grid--editorial`, `about-layout--editorial`, and `data-project-card`.
- CSS provides the visual change; no new client-side scripts or dependency are introduced.

- [ ] **Step 1: Write failing rendered page-contract tests**

```ts
const articlesHtml = await readFile(join(outputDirectory, 'articles', 'index.html'), 'utf8');
const projectsHtml = await readFile(join(outputDirectory, 'projects', 'index.html'), 'utf8');
const aboutHtml = await readFile(join(outputDirectory, 'about', 'index.html'), 'utf8');
expect(articlesHtml).toContain('page-header page-header--editorial');
expect(articlesHtml).toContain('listing listing--editorial');
expect(projectsHtml).toContain('portfolio-grid--editorial');
expect(projectsHtml).toContain('data-project-card');
expect(aboutHtml).toContain('about-layout--editorial');
```

- [ ] **Step 2: Run the focused route test to verify failure**

Run: `npx vitest run tests/routes.test.ts`  
Expected: FAIL because the page-specific editorial hooks do not exist.

- [ ] **Step 3: Add page-level hooks without changing content order**

Keep the existing `h1`, descriptions, collection sort order, and links. Add only the specified classes and `data-project-card`:

```astro
<header class="page-header page-header--editorial shell">…</header>
<div class="listing listing--editorial shell">…</div>
<article class="portfolio-card" data-project-card>…</article>
```

- [ ] **Step 4: Implement readable editorial CSS**

Apply one coherent system:

```css
.page-header--editorial { max-width: 62rem; padding-block: clamp(7rem, 13vw, 10rem) clamp(2.5rem, 5vw, 4rem); }
.page-header--editorial h1 { max-width: 12ch; font-size: clamp(42px, 4.2vw, 64px); }
.listing--editorial .article-card { grid-template-columns: minmax(8rem, .3fr) minmax(0, 1fr); border-top-color: color-mix(in srgb, var(--ink) 16%, transparent); }
.portfolio-grid--editorial { gap: clamp(1rem, 2.2vw, 1.65rem); }
```

Set paragraphs/summaries to a 28–34 Chinese character measure, make project metadata calm rather than badge-like, and retain one subtle card hover (2px translation plus accent rule). Do not add gradients or full-image sections to inner pages.

- [ ] **Step 5: Test, inspect, and commit page system**

Run: `npx vitest run tests/routes.test.ts && npm run check && npm run build`  
Expected: all tests pass, 0 Astro diagnostics, and 12 pages build.

Inspect article list, note list, projects, project detail, article detail, and about at 375px/768px/1440px. Confirm no typography is clipped, no paragraph becomes an overly wide slab, and the visual hierarchy is consistent.

```bash
git add src/components/PortfolioCard.astro src/pages/articles/index.astro src/pages/notes/index.astro src/pages/projects/index.astro src/pages/about.astro src/styles/global.css tests/routes.test.ts
git commit -m "feat: unify editorial page typography"
```

## Task 3: Release verification and direct deployment

**Files:**
- Modify: `tests/routes.test.ts` only if a final rendered regression assertion is missing.

**Interfaces:**
- The published root URL is `https://liuhaojie02.github.io/`.
- The GitHub Actions workflow deploys when `main` is pushed.

- [ ] **Step 1: Run the complete release suite**

Run:

```bash
npm test
npm run check
npm run build
```

Expected: all Vitest files pass, Astro reports 0 errors/warnings, and all 12 static pages build.

- [ ] **Step 2: Inspect production-equivalent output**

Run a local preview and verify:

```bash
npm run preview -- --host 127.0.0.1
```

Check `/`, `/articles/`, `/articles/start-here/`, `/notes/`, `/projects/`, and `/about/`. Use keyboard navigation and reduced-motion settings to confirm content remains usable.

- [ ] **Step 3: Push main and confirm Pages**

From the primary checkout after the branch-level final review has passed, fast-forward the isolated implementation branch into `main`:

```bash
git -C /Users/macbookpro2020/Documents/个人博客 merge --ff-only codex/editorial-ui-refinement
git -C /Users/macbookpro2020/Documents/个人博客 status -sb
git -C /Users/macbookpro2020/Documents/个人博客 push origin main
gh run list --repo liuhaojie02/liuhaojie02.github.io --commit "$(git -C /Users/macbookpro2020/Documents/个人博客 rev-parse HEAD)" --limit 1 --json databaseId,status,conclusion,url
```

The release controller performs this merge/push; the Task 3 implementer validates the feature worktree and must not push an unmerged `main` ref.

```bash
git status -sb
git rev-parse HEAD
```

Wait for the run to complete successfully, then assert the public home HTML contains `在安静处，持续创造。` and does not contain the old long author introduction inside an `h1`.

- [ ] **Step 4: Commit any final regression assertion only if added**

```bash
git add tests/routes.test.ts
git commit -m "test: lock refined editorial hierarchy"
git push origin main
```

## Plan self-review

- **Spec coverage:** Task 1 implements the corrected hero, text hierarchy, feature label, local image composition, and responsive behavior. Task 2 applies the same typography/spacing rules to listings, projects, and about. Task 3 validates and deploys the completed site.
- **Failure handling:** The plan retains the existing solid hero fallback, semantic image treatment, no-script navigation, keyboard focus, and reduced-motion behavior.
- **Completeness scan:** Each task includes exact paths, expected test behavior, commands, markup/CSS contracts, and a commit boundary.
- **Type consistency:** `site.home`, `HomeHero` props, existing card props, and named editorial hooks match every consuming task.
