# Personal Blog Design

## Goal

Create a Chinese-first personal website that combines a writing-focused blog, a concise profile, and a portfolio. It must be simple to update in Git and deploy automatically to GitHub Pages.

## Decisions

- Primary language: Simplified Chinese. The structure leaves room for later English translations, without building localisation in the first release.
- Home page priority: latest articles, followed by a short introduction and selected work.
- Content areas: articles, notes (short-form writing), portfolio, and about/contact.
- Publishing: GitHub Pages, deployed by a GitHub Actions workflow on pushes to `main`.
- Site identity: use the GitHub account name `liuhaojie` as the initial profile identity, with visible profile copy kept easy to edit in one content file.

## Approaches Considered

1. Plain HTML, CSS, and JavaScript — fastest and dependency-free, but hand-maintaining article lists would become tedious.
2. Astro static site (selected) — Markdown content collections, a fast static output, predictable GitHub Pages deployment, and no server to operate.
3. A hosted CMS — friendlier visual editing, but introduces an external account, additional complexity, and potentially ongoing cost.

Astro is the selected approach because it preserves the low-friction GitHub workflow while making articles and portfolio entries first-class content.

## Information Architecture

### Navigation

- `首页`: newest posts, profile summary, featured projects, and topic links.
- `文章`: full list of long-form writing with category, date, reading time, and search-friendly URLs.
- `随笔`: short notes using the same Markdown content pipeline.
- `作品`: portfolio cards with concise descriptions, technology tags, and optional external links.
- `关于`: profile, areas of interest, contact links, and a minimal editing guide.

### Home Page

The top section introduces the author in one sentence and provides a direct link to the articles list. The first major section is `最新文章`, displaying the three most recently published posts. Below it are a small portfolio preview and a final invitation to view the full profile. This ordering keeps returning readers close to fresh writing while still making the site useful as a portfolio.

### Visual Direction

Use a restrained editorial layout: warm off-white background, near-black typography, one deep blue accent, generous whitespace, readable serif headings paired with a clean sans-serif body face, and subtle hover/focus treatments. The design is responsive from a single-column phone layout to a two-column desktop article layout. It avoids carousels, animated distractions, and heavy client-side JavaScript.

## Content Model

Articles and notes are Markdown files with front matter: `title`, `description`, `pubDate`, `tags`, `draft`, and optional `cover`. Portfolio entries contain `title`, `summary`, `year`, `tags`, `featured`, and optional `url` / `repository` fields. Site-wide identity and social links live in a single TypeScript configuration module.

The initial repository includes realistic starter content in every area, clearly labelled for replacement. New writing should only require adding a Markdown file; sorted listings, reading-time display, tags, and draft exclusion are generated at build time.

## Architecture

Astro renders static pages from content collections. Shared layout, header, footer, article metadata, and portfolio cards stay in focused components. Build-time content helpers query, filter, and sort the collections; pages never duplicate this logic. The project has no database, server runtime, analytics, comments, or newsletter subscription in this first release.

## Publishing and Error Handling

`npm run build` is the local release check. A GitHub Actions workflow installs exact dependencies, builds the static site, uploads the generated `dist` directory, and deploys it to GitHub Pages. The workflow has the least permissions required to publish pages. If the build fails, deployment is stopped and the workflow log identifies the invalid content or configuration.

## Testing and Acceptance Criteria

- Automated tests cover content ordering, draft exclusion, reading-time calculation, and portfolio filtering using real content fixtures.
- The production build completes without warnings or errors.
- The responsive homepage exposes newest writing before profile and portfolio sections.
- Every main navigation route renders with accessible labels and a visible keyboard focus state.
- A push to `main` triggers the Pages deployment workflow after GitHub Pages is enabled for the repository.

## Out of Scope

- Custom domain setup and DNS changes.
- User accounts, comments, a CMS, an API, and a database.
- Newsletter delivery and analytics integrations.
- Full bilingual content and a language switcher.
