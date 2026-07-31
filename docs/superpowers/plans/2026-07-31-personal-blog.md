# Personal Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a Chinese-first personal blog where fresh writing leads the home page and portfolio/profile content remains easy to find.

**Architecture:** Astro statically renders Markdown content collections into article, notes, portfolio, and profile pages. A small content-query library centralises sorting and filtering. Shared Astro components deliver a responsive editorial interface, and a GitHub Actions workflow publishes `dist/` to GitHub Pages.

**Tech Stack:** Astro, TypeScript, Markdown content collections, Vitest, GitHub Actions.

## Global Constraints

- Primary public language is Simplified Chinese.
- Homepage must show the newest published articles before profile and portfolio previews.
- Exclude drafts from all public listings and routes.
- Use no database, server runtime, CMS, analytics, comments, or newsletter service.
- Keep the deployment target compatible with GitHub Pages project sites.
- Commit `package-lock.json` so the deploy action can detect npm.

---

## File Structure

- `astro.config.mjs`: static-site configuration, GitHub Pages URL and base path.
- `src/content.config.ts`: validates article, note, and portfolio front matter.
- `src/data/site.ts`: editable personal identity, navigation, and social links.
- `src/lib/content.ts`: typed query, sorting, reading-time, and filtering helpers.
- `src/layouts/BaseLayout.astro`: shared document frame, header, footer, and SEO metadata.
- `src/components/`: article cards, article metadata, portfolio cards, and section headings.
- `src/pages/`: static route pages and dynamic content routes.
- `src/content/`: starter Markdown articles, notes, and portfolio entries.
- `src/styles/global.css`: design tokens, typography, responsive grid, focus styles, and prose styling.
- `tests/content.test.ts`: real-behaviour tests for public content selection.
- `.github/workflows/deploy.yml`: build and Pages deployment.

### Task 1: Establish a minimal Astro and test workspace

**Files:**
- Create: `package.json`, `tsconfig.json`, `astro.config.mjs`, `vitest.config.ts`
- Create: `src/env.d.ts`

**Interfaces:**
- Produces: `npm run dev`, `npm run test`, and `npm run build` commands.

- [ ] **Step 1: Add an empty Vitest test file that is discovered by the test command.**

```ts
import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('runs assertions', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Run `npm run test` and confirm the command fails because the project scripts and dependencies do not yet exist.**

- [ ] **Step 3: Configure Astro, TypeScript, and Vitest with scripts `dev`, `build`, `preview`, and `test`; install exact dependencies and create the lockfile.**

- [ ] **Step 4: Run `npm run test` and confirm the environment test passes.**

- [ ] **Step 5: Commit.**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs vitest.config.ts src/env.d.ts tests
git commit -m "chore: initialize Astro blog workspace"
```

### Task 2: Build the content query boundary with tests first

**Files:**
- Create: `tests/content.test.ts`
- Create: `src/lib/content.ts`
- Create: `src/content.config.ts`

**Interfaces:**
- Consumes: article-like entries `{ id, data: { pubDate: Date; draft?: boolean; featured?: boolean } }`.
- Produces: `getPublishedEntries(entries)`, `getLatestEntries(entries, count)`, `getReadingMinutes(body)`, and `getFeaturedEntries(entries, count)`.

- [ ] **Step 1: Write failing tests for reverse-chronological published entries, draft exclusion, a three-entry latest limit, a one-minute minimum reading time, and featured portfolio filtering.**

```ts
expect(getLatestEntries(entries, 3).map((entry) => entry.id)).toEqual(['new', 'middle', 'old']);
expect(getPublishedEntries(entries).map((entry) => entry.id)).not.toContain('draft');
expect(getReadingMinutes('word '.repeat(201))).toBe(2);
expect(getFeaturedEntries(projects, 2).map((entry) => entry.id)).toEqual(['first', 'second']);
```

- [ ] **Step 2: Run `npm run test -- content` and confirm it fails because `src/lib/content.ts` does not exist.**

- [ ] **Step 3: Implement the smallest typed helpers needed for these visible behaviours, then define matching Zod schemas for `articles`, `notes`, and `projects`.**

- [ ] **Step 4: Run `npm run test -- content` and confirm every helper test passes.**

- [ ] **Step 5: Commit.**

```bash
git add src/lib/content.ts src/content.config.ts tests/content.test.ts
git commit -m "feat: add validated content queries"
```

### Task 3: Add editable starter content and site identity

**Files:**
- Create: `src/data/site.ts`
- Create: `src/content/articles/*.md`
- Create: `src/content/notes/*.md`
- Create: `src/content/projects/*.md`
- Create: `README.md`

**Interfaces:**
- Consumes: collection front matter defined in `src/content.config.ts`.
- Produces: authored content supplied to page queries and an editing guide for the owner.

- [ ] **Step 1: Add a failing test that imports the actual content and asserts at least three public articles, one note, and two projects are available.**

```ts
expect(publishedArticles).toHaveLength(3);
expect(publishedNotes).toHaveLength(1);
expect(projects).toHaveLength(2);
```

- [ ] **Step 2: Run `npm run test -- content` and confirm it fails because the content files are absent.**

- [ ] **Step 3: Add Chinese starter entries that clearly indicate which personal details and links to replace, together with a central identity configuration and a concise Markdown editing/publishing guide.**

- [ ] **Step 4: Run `npm run test -- content` and confirm the actual content is queryable and valid.**

- [ ] **Step 5: Commit.**

```bash
git add src/data/site.ts src/content README.md tests/content.test.ts
git commit -m "feat: add starter blog and portfolio content"
```

### Task 4: Render the responsive blog and portfolio experience

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ArticleCard.astro`, `ArticleMeta.astro`, `PortfolioCard.astro`, `SectionHeading.astro`
- Create: `src/pages/index.astro`, `articles/index.astro`, `articles/[...slug].astro`, `notes/index.astro`, `notes/[...slug].astro`, `projects/index.astro`, `about.astro`, `404.astro`
- Create: `src/styles/global.css`

**Interfaces:**
- Consumes: site settings, content query helpers, and typed content entries.
- Produces: accessible static routes for every navigation item and every public content entry.

- [ ] **Step 1: Write a failing Astro build-level test that renders the home route and asserts that `最新文章` occurs before `作品精选`, and that the primary navigation contains `文章`, `随笔`, `作品`, and `关于`.**

```ts
expect(homeHtml.indexOf('最新文章')).toBeLessThan(homeHtml.indexOf('作品精选'));
expect(homeHtml).toContain('aria-label="主导航"');
```

- [ ] **Step 2: Run the route test and confirm it fails because the home page and shared layout are absent.**

- [ ] **Step 3: Implement focused layout and card components, render each route from the content helpers, and add CSS for responsive layout, readable typography, colour contrast, and visible `:focus-visible` states.**

- [ ] **Step 4: Run the route test, then `npm run build`, and confirm both succeed.**

- [ ] **Step 5: Commit.**

```bash
git add src/layouts src/components src/pages src/styles tests
git commit -m "feat: build responsive personal blog pages"
```

### Task 5: Prepare GitHub Pages delivery

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: a GitHub repository named `liuhaojie.github.io` and pushes to `main`.
- Produces: a Pages deployment using the generated `dist/` directory.

- [ ] **Step 1: Write a failing test that imports Astro configuration and expects `site` to equal `https://liuhaojie.github.io` with no project `base` value.**

```ts
expect(config.site).toBe('https://liuhaojie.github.io');
expect(config.base).toBeUndefined();
```

- [ ] **Step 2: Run the configuration test and confirm it fails because the public URL is not configured.**

- [ ] **Step 3: Set the user-site URL, add the official Astro Pages workflow with least-privilege permissions, `main` push trigger, and a deploy job that uses `actions/deploy-pages`.**

- [ ] **Step 4: Run the complete test suite and production build; use `git diff --check` to verify the workflow and source are clean.**

- [ ] **Step 5: Commit.**

```bash
git add astro.config.mjs .github/workflows/deploy.yml tests
git commit -m "ci: deploy blog to GitHub Pages"
```

### Task 6: Publish and verify the live site

**Files:**
- Modify: Git remote configuration only.

**Interfaces:**
- Consumes: a logged-in GitHub CLI session and the local `codex/personal-blog` branch.
- Produces: public repository `liuhaojie/liuhaojie.github.io`, merged `main`, and an active GitHub Pages site.

- [ ] **Step 1: Run `gh auth status`; if unauthenticated, prompt the owner to complete `gh auth login` before continuing.**

- [ ] **Step 2: Create the public repository with `gh repo create liuhaojie.github.io --public --source=. --remote=origin --push`, then push `main`.**

- [ ] **Step 3: Enable Pages with GitHub Actions as the source, if GitHub did not infer the workflow automatically.**

- [ ] **Step 4: Check the Actions run to a successful conclusion and visit `https://liuhaojie.github.io` to confirm the title, newest-article section, and navigation render.**

- [ ] **Step 5: Commit only if live-site fixes were required.**
