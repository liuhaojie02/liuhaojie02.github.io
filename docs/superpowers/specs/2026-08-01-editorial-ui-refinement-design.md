# Editorial UI refinement design

**Status:** proposed for review  
**Date:** 2026-08-01  
**Scope:** refine the visual hierarchy and typography of the deployed Astro blog without changing its content model or hosting architecture.

## Problem to solve

The current home hero uses the full author introduction as a display headline. Its mixed Chinese/Latin text spans too many lines at a very large size, covering the strongest parts of the moon-and-flower image. The result has neither the calm hierarchy of an editorial site nor the concise rhythm of the reference project.

The redesign will make the background atmospheric rather than competitive with text, reserve the author name for brand/navigation, and apply the same type scale and spacing logic to the home page, listing pages, detail pages, projects, and about page.

## Visual direction

### Core rule

**Background sets the mood; text communicates one thing at a time.**

- The hero title becomes a short, two-line Chinese statement: **“在安静处，持续创造。”**
- `liuhaojie` remains in the site mark/navigation; it is removed from the hero display title.
- The eyebrow is compact: `THINK · MAKE · SHARE`; it does not repeat the title.
- The supporting sentence names the subject matter: technology, writing, and completed work.
- The moon-and-flower image keeps the right half of the hero. A left-to-right contrast overlay supports the text without flattening the image.

### Typography system

| Role | Content | Desktop target | Reading constraint |
| --- | --- | --- | --- |
| Brand | `liuhaojie` | 14–16px sans | Always one line |
| Eyebrow | Section/category | 11–12px sans, uppercase | One line, generous tracking |
| Hero display | Core statement | clamp(48px, 5.2vw, 80px) serif | Maximum 8 Chinese characters per line; max 2 lines |
| Page heading | `文章`, `作品`, `关于` | clamp(42px, 4.2vw, 64px) serif | Max 12 Chinese characters per line |
| Section heading | `最新文章` | clamp(30px, 3vw, 44px) serif | Max 16 Chinese characters per line |
| Lead/body | Context and summaries | 16–19px sans | 28–34 Chinese character measure |
| Metadata/actions | Date, tags, controls | 12–14px sans | Muted and never competes with headings |

No sentence should repeat the same fact in two adjacent text levels. The visible copy must not use `liuhaojie` inside display titles.

## Page design contracts

### Home

1. Fixed/overlay navigation stays compact and visually quiet.
2. The hero is 82–100svh, with the short editorial display, a single supporting paragraph, and one primary action plus one low-emphasis secondary link.
3. A small `01 / PERSONAL JOURNAL` reading marker can anchor the lower-right corner; it is decorative and hidden at small widths.
4. Latest writing becomes a deliberate editorial sequence: one feature story, followed by two quieter cards. The feature label uses Chinese (`最新写作`) rather than an unrelated English badge.
5. Selected work and about sections use light surfaces, larger gutters, and no hero-like background photo.

### Article and note listings

- Start with a concise page title and one-sentence premise.
- Display articles as ruled editorial rows on wide screens: date/tags in a compact left rail, title/deck/action in the reading column.
- Cards use one hover state only: an accent rule and 2px lift. Avoid nested card effects, gradients, and decorative badges.
- The future search/tag controls remain visually subordinate to the page title; they are not required in this refinement unless already implemented.

### Article details, projects, and about

- Detail pages use the same serif title scale, narrow prose measure, clear metadata, and restrained rule separators.
- Projects use a two-column editorial grid with a stable top line for year/tags and one primary action.
- About uses one calm headline, then short sections with spacious separators. It has no large background image.

## Component and data boundaries

| Unit | Change | Data contract |
| --- | --- | --- |
| `src/data/site.ts` | Keep author identity/SEO fields; add a small `home` copy object if needed. | Hero text is configuration, not hard-coded into a shared layout. |
| `src/components/HomeHero.astro` | Render the new short title, lead, primary action, and optional secondary action/marker. | Receives `title`, `description`, `ctaHref`, `backgroundSrc`; no content query. |
| `src/components/ArticleCard.astro` | Adopt featured/standard editorial variants and Chinese feature label. | Keeps existing collection entry and href inputs. |
| `BaseLayout` / `SiteHeader` | Preserve current accessibility and overlay behavior. | No new client dependency. |
| `global.css` | Establish type scale, spacing, responsive composition, and motion rules. | CSS only; defaults remain readable if enhancements fail. |

## Responsive, accessibility, and failure behavior

- At <= 44rem: hero title caps at 52px, left/right gutters are 20px, decorative marker is hidden, and actions wrap without overlap.
- Hero text retains a dark overlay at all widths; no title is placed over the brightest focal region.
- Existing keyboard focus treatment and reduced-motion rules are preserved. Hover effects are never the only affordance.
- If the background image fails, the solid blue-green hero color still provides contrast and the text hierarchy remains intact.
- The title/description remain actual HTML; the image has empty alt because it is decorative.

## Verification

- Add rendered route assertions for the short hero title, the configured hero image, and the Chinese feature label.
- Run `npm test`, `npm run check`, and `npm run build`.
- Inspect home, article list, note list, article detail, project list/detail, and about at 375px, 768px, and 1440px.
- Keyboard-check the skip link, navigation, article links, and actions. Verify reduced-motion does not leave hidden content or obstruct navigation.
- Deploy only after the above passes; verify deployed home HTML does not include the old long hero introduction as an `h1`.

## Explicit non-goals

- No replacement of the current Markdown/GitHub Pages authoring flow.
- No video background, 3D effects, cursor-following animation, carousel, or third-party UI library.
- No new external image runtime dependency.
