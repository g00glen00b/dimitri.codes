# Neo-Brutalism Redesign + Tailwind v4 Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate dimitri.codes from scoped Astro component `<style>` blocks to Tailwind v4 utility classes while applying a full Bold Neo-Brutalism visual redesign across every page and component.

**Architecture:** Tailwind v4 is wired via the `@tailwindcss/vite` Vite plugin; `src/styles/global.css` becomes the single CSS entry point with an `@theme {}` block defining all design tokens (colours, fonts, shadow scale). Every component `<style>` block is deleted and replaced with utility classes. The accent-light top band on the homepage is implemented by (1) `Header.astro` always carrying a `bg-accent-light` wrapper, and (2) a named `hero-band` slot added to `SiteLayout.astro` that `index.astro` populates — the two consecutive `bg-accent-light` elements appear seamless.

**Tech Stack:** Astro 6, Tailwind v4 (`tailwindcss@next`, `@tailwindcss/vite`), Montserrat + Roboto + Roboto Mono (Google Fonts), TypeScript strict mode. No test suite — `npm run build` (`astro check && astro build`) is the correctness gate after every task.

---

### Task 1: Install Tailwind v4 and replace `global.css`

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/SiteLayout.astro`
- Modify: `src/components/Head.astro`

- [ ] **Step 1: Install packages**

```bash
npm install tailwindcss@next @tailwindcss/vite
```

Expected: packages added, no errors.

- [ ] **Step 2: Update `astro.config.mjs`**

Full file replacement:

```js
import {defineConfig} from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import remarkSmartypants from 'remark-smartypants';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import {s} from 'hastscript';
import sitemap from "@astrojs/sitemap";
import tailwindcss from '@tailwindcss/vite';

const linkContent = s('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, s('path', {
  d: 'm17.657 14.828l-1.414-1.414L17.657 12A4 4 0 1 0 12 6.343l-1.414 1.414l-1.414-1.414l1.414-1.414a6 6 0 0 1 8.485 8.485l-1.414 1.414Zm-2.828 2.829l-1.415 1.414a6 6 0 0 1-8.485-8.485L6.343 9.17l1.415 1.415L6.343 12A4 4 0 0 0 12 17.657l1.415-1.415l1.414 1.415Zm0-9.9l1.414 1.414l-7.071 7.072l-1.414-1.415l7.07-7.07Z'
}));

export default defineConfig({
  markdown: {
    syntaxHighlight: 'prism',
    rehypePlugins: [rehypeExternalLinks, rehypeSlug, [rehypeAutolinkHeadings, {
      behavior: 'append',
      content: linkContent
    }]],
    remarkPlugins: [remarkSmartypants]
  },
  site: 'https://dimitri.codes',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Rewrite `src/styles/global.css`**

Full file replacement:

```css
@import "tailwindcss";
@import "./OneDark.css";

@theme {
  --color-primary:       #2d3452;
  --color-primary-light: #9c9fbd;
  --color-accent:        #f0803c;
  --color-accent-light:  #facdb3;
  --color-secondary:     #60a5b4;
  --color-ink:           #051923;
  --color-bg:            #ffffff;
  --color-bg-muted:      #f3f3f9;

  --font-sans:    'Roboto', sans-serif;
  --font-heading: 'Montserrat', sans-serif;

  --shadow-brut-xs: 2px 2px 0 0 var(--color-ink);
  --shadow-brut-sm: 4px 4px 0 0 var(--color-ink);
  --shadow-brut-md: 6px 6px 0 0 var(--color-ink);
  --shadow-brut-lg: 8px 8px 0 0 var(--color-ink);
}

* {
  border-radius: 0 !important;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  background-color: var(--color-bg-muted);
  color: var(--color-ink);
}

main {
  max-width: 950px;
  padding: 0 1rem;
  margin: 0 auto;
}
```

- [ ] **Step 4: Update `src/layouts/SiteLayout.astro`**

Remove the two `import` lines for CSS files and add a `hero-band` named slot between Header and ContainerContent. Full file:

```astro
---
import Header from '../components/Header.astro';
import ContainerContent from '../components/ContainerContent.astro';
import Footer from '../components/Footer.astro';
import Head from '../components/Head.astro';
import {type Tag} from '../models/Tag';
import {type Category} from '../models/Category';
import PageTitle from '../components/PageTitle.astro';
import Comments from '../components/Comments.astro';
import {type ReadTimeResults} from 'reading-time';
import {CONFIG} from '../config/config';

export interface Props {
  showHeaderFooter: boolean;
  disableComments: boolean;
  title: string;
  description: string;
  path: string;
  publishedDate?: Date;
  tags?: Tag[];
  categories?: Category[];
  featuredImage?: string;
  metaImage?: string;
  readingTime?: ReadTimeResults;
}

const {showHeaderFooter, disableComments, title, description, path, publishedDate, tags, categories, featuredImage, readingTime, metaImage} = Astro.props;
---

<html lang="en">
  <Head
    title={title}
    description={description}
    path={path}
    publishedDate={publishedDate}
    tags={tags}
    categories={categories}
    metaImage={metaImage || featuredImage || CONFIG.site.logo}
  />
  <body>
    {showHeaderFooter && <Header />}
    <slot name="hero-band" />
    <ContainerContent>
      {publishedDate && featuredImage && readingTime && tags && <PageTitle
        title={title}
        readingTime={readingTime}
        date={publishedDate}
        featuredImage={featuredImage}
        tags={tags}/>}
      <slot />
      {!disableComments && <Comments/>}
    </ContainerContent>
    {showHeaderFooter && <Footer />}
  </body>
</html>
```

- [ ] **Step 5: Add Montserrat weight 800 and 900 to `src/components/Head.astro`**

Replace line 57 (the Google Fonts `<link>`):

```html
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700;800;900&family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" rel="preload" as="style" />
```

- [ ] **Step 6: Verify build**

```bash
npm run build
```

Expected: `astro check` passes, `astro build` completes. The site will look visually broken at this stage — that is expected and fine.

- [ ] **Step 7: Commit**

```bash
git add astro.config.mjs src/styles/global.css src/layouts/SiteLayout.astro src/components/Head.astro package.json package-lock.json
git commit -m "chore: install Tailwind v4 and wire @theme design tokens"
```

---

### Task 2: Redesign `Header.astro`

**Files:**
- Modify: `src/components/Header.astro`

The header is a white bordered box (`2px ink border + 4px ink shadow`) floating inside a full-width `bg-accent-light` wrapper. This `bg-accent-light` wrapper appears on every page; on the homepage it blends seamlessly into the hero band below it.

- [ ] **Step 1: Rewrite `src/components/Header.astro`**

```astro
---
import {CONFIG} from '../config/config';
import {Icon} from 'astro-icon';

const {headerLinks} = CONFIG;
---
<div class="bg-accent-light w-full">
  <div class="max-w-[950px] mx-auto px-4 pt-5">
    <header
      class="flex justify-between items-center bg-bg border-2 border-ink shadow-brut-sm px-6 py-3"
      aria-label="Primary navigation">
      <a href="/" class="font-heading font-black text-xl tracking-tight text-primary no-underline" title="Home">
        <Icon name="logo" aria-label="Website logo" class="w-16 h-auto fill-primary" />
      </a>
      <nav class="flex items-center gap-7">
        {headerLinks.map(({name, to}) => (
          <a
            href={to}
            class="font-heading font-bold text-sm lowercase text-ink no-underline border-b-2 border-transparent pb-0.5 transition-colors duration-100 hover:text-accent hover:border-accent"
          >{name}</a>
        ))}
      </nav>
    </header>
  </div>
</div>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors, build completes.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: redesign header as floating white box on accent-light band"
```

---

### Task 3: Redesign `Footer.astro`, `SocialLinks.astro`, `ContentLinks.astro`

**Files:**
- Modify: `src/components/Footer.astro`
- Modify: `src/components/SocialLinks.astro`
- Modify: `src/components/ContentLinks.astro`

- [ ] **Step 1: Rewrite `src/components/SocialLinks.astro`**

32×32 bordered icon boxes, accent fill on hover with shadow collapse.

```astro
---
import {type SocialNetworks} from '../models/SocialNetworks';
import {Icon} from 'astro-icon';

export interface Props {
  socialNetworks: SocialNetworks
}

const {socialNetworks} = Astro.props;

const iconClass = "w-8 h-8 flex items-center justify-center bg-bg border-2 border-ink shadow-brut-xs text-ink no-underline transition-[box-shadow,transform,background-color] duration-100 hover:bg-accent hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]";
---

<nav class="flex items-center gap-3">
  {socialNetworks.linkedin && <a
    class={iconClass}
    href={`https://linkedin.com/in/${socialNetworks.linkedin}`}
    target="_blank"
    rel="noopener noreferrer"
    title="LinkedIn">
    <Icon name="ri:linkedin-fill" class="w-4 h-4 fill-current" />
  </a>}
  {socialNetworks.github && <a
    class={iconClass}
    href={`https://github.com/${socialNetworks.github}`}
    target="_blank"
    rel="noopener noreferrer"
    title="GitHub">
    <Icon name="ri:github-fill" class="w-4 h-4 fill-current" />
  </a>}
  {socialNetworks.speakerdeck && <a
    class={iconClass}
    href={`https://speakerdeck.com/${socialNetworks.speakerdeck}`}
    target="_blank"
    rel="noopener noreferrer"
    title="Speaker Deck">
    <Icon name="simple-icons:speakerdeck" class="w-4 h-4 fill-current" />
  </a>}
  {socialNetworks.codepen && <a
    class={iconClass}
    href={`https://codepen.io/${socialNetworks.codepen}`}
    target="_blank"
    rel="noopener noreferrer"
    title="CodePen">
    <Icon name="ri:codepen-fill" class="w-4 h-4 fill-current" />
  </a>}
</nav>
```

- [ ] **Step 2: Rewrite `src/components/ContentLinks.astro`**

Uppercase Montserrat links, accent underline on hover.

```astro
---
import {type ContentLink} from '../models/ContentLink';

interface Props {
  links: ContentLink[]
}

const {links} = Astro.props;

const linkClass = "font-heading font-bold text-xs uppercase tracking-widest text-ink no-underline border-b-2 border-transparent pb-0.5 transition-colors duration-100 hover:text-accent hover:border-accent";
---
<nav class="flex items-center gap-6">
  {links.map(({name, to, external}) =>
  external ? (
    <a class={linkClass} href={to} target="_blank" rel="noopener noreferrer">{name}</a>
  ) : (
    <a class={linkClass} href={to}>{name}</a>
  ))}
</nav>
```

- [ ] **Step 3: Rewrite `src/components/Footer.astro`**

White background, 3px ink top border, brutal full-width divider between rows, uppercase copyright.

```astro
---
import {Icon} from 'astro-icon';
import ContentLinks from './ContentLinks.astro';
import SocialLinks from './SocialLinks.astro';
import {CONFIG} from '../config/config';

const {socialNetworks, author: {name: authorName}, footerLinks} = CONFIG;
---
<footer class="bg-bg border-t-[3px] border-ink mt-4">
  <div class="max-w-[950px] mx-auto px-4 py-6 flex justify-between items-center">
    <SocialLinks socialNetworks={socialNetworks}/>
    <ContentLinks links={footerLinks}/>
  </div>
  <hr class="border-0 border-t-[3px] border-ink m-0" />
  <div class="max-w-[950px] mx-auto px-4 py-3 flex justify-end items-center gap-1.5 font-heading font-bold text-[0.7rem] uppercase tracking-widest text-[#888]">
    Made with <Icon name="ri:heart-fill" class="w-3.5 h-3.5 text-accent fill-current" /> by {authorName}
  </div>
</footer>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro src/components/SocialLinks.astro src/components/ContentLinks.astro
git commit -m "feat: redesign footer with brutal divider and boxed social icons"
```

---

### Task 4: Redesign `PostCard.astro` and `PostCardContainer.astro`

**Files:**
- Modify: `src/components/PostCard.astro`
- Modify: `src/components/PostCardContainer.astro`

- [ ] **Step 1: Rewrite `src/components/PostCard.astro`**

Navy header with orange accent category pill, white body, 8px ink shadow. On hover: translate 4px, shadow reduces to 4px.

```astro
---
import {format} from 'date-fns';
import {type Post} from '../models/Post';

export interface Props {
  post: Post;
}

const {categories, slug, title, excerpt, publishedDate, featuredImage} = Astro.props.post;
const [firstCategory] = categories;
const readableDate = format(publishedDate, 'MMMM do, yyyy');
---
<a
  class="flex flex-col bg-bg border-2 border-ink shadow-brut-lg no-underline text-ink transition-[box-shadow,transform] duration-100 hover:shadow-brut-sm hover:translate-x-1 hover:translate-y-1"
  href={`/${slug}`}
  title="View post">
  <div class="bg-primary border-b-2 border-ink px-4 pt-5 pb-4">
    {featuredImage && <img
      src={featuredImage}
      alt={`Featured image for "${title}"`}
      class="w-20 mb-3"
    />}
    <span
      aria-label={`Category ${firstCategory.name}`}
      class="inline-block font-heading font-bold text-[0.6rem] uppercase tracking-widest text-ink bg-accent border-[1.5px] border-ink px-2 py-0.5 mb-2">
      {firstCategory.name}
    </span>
    <h2 class="font-heading font-extrabold text-[1.05rem] leading-snug text-bg m-0 mb-1">
      {title}
    </h2>
    <time
      aria-label={`Posted at ${readableDate}`}
      class="text-primary-light text-xs font-medium">
      {readableDate}
    </time>
  </div>
  <div class="px-4 py-3 flex-1 text-sm leading-relaxed text-[#404c5a]">
    <p class="m-0">{excerpt}</p>
    <span
      aria-hidden
      class="inline-block mt-2 text-xs font-bold uppercase tracking-wide text-ink border-b-2 border-accent">
      Read more →
    </span>
  </div>
</a>
```

- [ ] **Step 2: Rewrite `src/components/PostCardContainer.astro`**

2-column grid on desktop, single column on mobile.

```astro
---
import PostCard from './PostCard.astro';
import {type Post} from '../models/Post';

export interface Props {
  posts: Post[];
}

const {posts} = Astro.props;
---
<section class="grid grid-cols-2 gap-6 mb-8 max-sm:grid-cols-1">
  {posts.map(post => <PostCard post={post}/>)}
</section>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/PostCard.astro src/components/PostCardContainer.astro
git commit -m "feat: redesign post cards with navy header, orange category pill, ink shadow"
```

---

### Task 5: Redesign `AboutHeadline.astro` and `VisitBlogBanner.astro`

**Files:**
- Modify: `src/components/AboutHeadline.astro`
- Modify: `src/components/VisitBlogBanner.astro`

- [ ] **Step 1: Rewrite `src/components/AboutHeadline.astro`**

`<strong>` words get accent-light fill + accent underline (blends into the band on the homepage, underline still shows).

```astro
---
---
<div class="pt-14 pb-10">
  <h1 class="font-heading font-extrabold text-[2.8rem] leading-[1.25] text-ink m-0">
    <small class="block font-heading font-bold text-[1.3rem] leading-none mb-2">
      <span role="img" aria-label="Hand waving emoji">👋</span>
      {` `}
      Hello, I&apos;m Dimitri
    </small>
    I love <strong class="bg-accent-light border-b-[3px] border-accent px-1 font-extrabold">tinkering with code</strong>, and I occasionally <strong class="bg-accent-light border-b-[3px] border-accent px-1 font-extrabold">write</strong> and <strong class="bg-accent-light border-b-[3px] border-accent px-1 font-extrabold">talk</strong> about it.
  </h1>
</div>
```

- [ ] **Step 2: Rewrite `src/components/VisitBlogBanner.astro`**

Ghost button (white bg, ink border + shadow, translate on hover). On the homepage this renders inside the hero band.

```astro
---
---
<div class="pb-10">
  <a
    class="inline-block px-5 py-3 font-heading font-bold text-sm uppercase tracking-widest text-ink bg-bg border-2 border-ink shadow-brut-sm no-underline transition-[box-shadow,transform] duration-100 hover:shadow-none hover:translate-x-1 hover:translate-y-1"
    href="/category/tutorials">
    check my tutorials →
  </a>
</div>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AboutHeadline.astro src/components/VisitBlogBanner.astro
git commit -m "feat: redesign hero headline with emphasis text and ghost CTA button"
```

---

### Task 6: Wire the homepage top band (`index.astro`)

**Files:**
- Modify: `src/pages/index.astro`

The `hero-band` slot (added to SiteLayout in Task 1) is populated here with the full accent-light hero section. `Header.astro` and this band share `bg-accent-light`, so they appear as one continuous strip with no gap. The `VisitBlogBanner` moves from the bottom of the page into the hero band.

- [ ] **Step 1: Rewrite `src/pages/index.astro`**

```astro
---
import {getCollection} from 'astro:content';
import SiteLayout from '../layouts/SiteLayout.astro';
import {CONFIG} from '../config/config';
import AboutHeadline from '../components/AboutHeadline.astro';
import {type Post} from '../models/Post';
import {mapToSortedPosts} from '../utils/post';
import PostCardContainer from '../components/PostCardContainer.astro';
import VisitBlogBanner from '../components/VisitBlogBanner.astro';

const entries = await getCollection('posts');
const posts: Post[] = mapToSortedPosts(entries).slice(0, CONFIG.site.homePageSize);
---

<SiteLayout
  showHeaderFooter={true}
  disableComments={true}
  title="Home"
  description={CONFIG.site.description}
  path="">
  <Fragment slot="hero-band">
    <div class="bg-accent-light w-full">
      <div class="max-w-[950px] mx-auto px-4">
        <AboutHeadline />
        <VisitBlogBanner />
      </div>
    </div>
    <hr class="border-0 border-t-[3px] border-ink m-0 w-full" />
  </Fragment>

  <h2 class="font-heading font-extrabold text-[2rem] text-ink mt-10 mb-6">Recent posts</h2>
  <PostCardContainer posts={posts} />
</SiteLayout>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Start dev server and visually verify homepage**

```bash
npm run dev
```

Open http://localhost:4321. Verify:
- Accent-light band runs from top through headline and CTA button, closed by ink divider
- "Recent posts" heading appears below the divider at 2rem Montserrat 800
- Cards display in 2 columns with navy headers and orange category pills

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: wire homepage hero band with ink divider and section heading"
```

---

### Task 7: Redesign `Pagination.astro`

**Files:**
- Modify: `src/components/Pagination.astro`

Prev/next become ghost buttons (sm size, 3px shadow). Page counter is a bordered badge, not a button.

- [ ] **Step 1: Rewrite `src/components/Pagination.astro`**

```astro
---
export interface Props {
  currentPage: number;
  pageCount: number;
  base: string;
}

const {currentPage, pageCount, base} = Astro.props;

const btnClass = "inline-block px-4 py-1.5 font-heading font-bold text-xs uppercase tracking-widest text-ink bg-bg border-2 border-ink shadow-brut-sm no-underline transition-[box-shadow,transform] duration-100 hover:shadow-none hover:translate-x-1 hover:translate-y-1";
---

<nav class="flex justify-between items-center my-8">
  {currentPage > 1 ? (
    <a
      class={btnClass}
      title="Go to previous page"
      href={`${base}/page/${currentPage - 1}`}>
      ← newer posts
    </a>
  ) : <span />}

  <span class="font-heading font-bold text-xs uppercase tracking-widest text-ink bg-bg border-2 border-ink px-3 py-1.5">
    page {currentPage} of {pageCount}
  </span>

  {currentPage < pageCount ? (
    <a
      class={btnClass}
      title="Go to next page"
      href={`${base}/page/${currentPage + 1}`}>
      older posts →
    </a>
  ) : <span />}
</nav>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/Pagination.astro
git commit -m "feat: redesign pagination with ghost buttons and bordered page counter"
```

---

### Task 8: Redesign `PageTitle.astro`

**Files:**
- Modify: `src/components/PageTitle.astro`

Post detail page header: 2px ink border all sides, 8px ink shadow. Tags rendered as primary-fill pill labels.

- [ ] **Step 1: Rewrite `src/components/PageTitle.astro`**

```astro
---
import {type Tag} from '../models/Tag';
import {Icon} from 'astro-icon';
import {format} from 'date-fns';
import {type ReadTimeResults} from 'reading-time';

export interface Props {
  readingTime: ReadTimeResults;
  tags: Tag[];
  date: Date;
  title: string;
  featuredImage: string;
}
const {readingTime, tags, date, title, featuredImage} = Astro.props;
const readableDate = format(date, 'MMMM do, yyyy');
const minutesRead = Math.round(readingTime.minutes);
---
<div class="flex gap-6 items-start bg-bg border-2 border-ink shadow-brut-lg px-6 pt-6 pb-0 mb-10 max-sm:flex-col">
  {featuredImage && <div class="shrink-0">
    <img
      src={featuredImage}
      alt={`Featured image for "${title}"`}
      class="w-20"
    />
  </div>}
  <div class="flex-1 min-w-0">
    <h1 class="font-heading font-extrabold text-[2rem] text-ink m-0 mb-4 leading-tight">{title}</h1>
    <dl class="flex flex-wrap gap-x-4 gap-y-2 pb-4 m-0">
      <dt class="flex items-center text-primary w-6 h-6 m-0">
        <Icon name="mdi:calendar-blank-outline" aria-label="Calendar icon" class="w-6 h-6 fill-current" />
      </dt>
      <dd class="m-0 text-base leading-6" aria-label={`Posted at ${readableDate}`}>{readableDate}</dd>

      <dt class="flex items-center text-primary w-6 h-6 m-0">
        <Icon name="mdi:stopwatch-outline" aria-label="Stopwatch icon" class="w-6 h-6 fill-current" />
      </dt>
      <dd class="m-0 text-base leading-6">{minutesRead} minute read</dd>

      {tags != null && <>
        <dt class="flex items-center text-primary w-6 h-6 m-0">
          <Icon name="mdi:tag-outline" aria-label="Tag icon" class="w-6 h-6 fill-current" />
        </dt>
        <dd class="m-0 flex flex-wrap gap-1.5 items-center">
          {tags.map(({name, path}) => (
            <a
              href={`/tag/${path}`}
              title={`View all posts tagged with ${name}`}
              class="inline-block font-heading font-bold text-[0.6rem] uppercase tracking-widest text-bg bg-primary border-[1.5px] border-ink px-2 py-0.5 no-underline hover:bg-primary-light transition-colors duration-100">
              {name}
            </a>
          ))}
        </dd>
      </>}
    </dl>
  </div>
</div>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PageTitle.astro
git commit -m "feat: redesign post detail page title with ink border and primary tag pills"
```

---

### Task 9: Update content typography in `ContainerContent.astro`

**Files:**
- Modify: `src/components/ContainerContent.astro`

Markdown-rendered HTML can't receive Tailwind classes directly, so global styles stay in `is:global` but all `var(--old-name)` references are updated to `var(--color-*)` from the new `@theme` tokens, border-radius is removed, and brutalist styles are applied to code, blockquotes, and tables.

- [ ] **Step 1: Rewrite `src/components/ContainerContent.astro`**

```astro
---
---
<main class="container-content">
  <slot />
</main>

<style is:global>
    .container-content {
        font-size: 16px;
    }

    .container-content pre {
        font-size: 1.1rem;
        border: 2px solid var(--color-ink);
        padding: 1rem;
        overflow-x: auto;
    }

    .container-content table *,
    .container-content p,
    .container-content li,
    .container-content .alert,
    .container-content blockquote {
        line-height: 2.1rem;
        font-size: 1.1rem;
    }

    .container-content p {
        margin: 1.5rem 0;
    }

    .container-content li > p {
        margin: 0;
    }

    .container-content h1 { font-size: 2rem; font-weight: 800; font-family: 'Montserrat', sans-serif; }
    .container-content h2 { font-size: 1.8rem; font-weight: 700; font-family: 'Montserrat', sans-serif; letter-spacing: -0.025rem; }
    .container-content h3 { font-size: 1.6rem; font-weight: 700; font-family: 'Montserrat', sans-serif; letter-spacing: -0.025rem; margin: 3rem 0 1rem; }
    .container-content h4 { font-size: 1.4rem; font-weight: 500; font-family: 'Montserrat', sans-serif; letter-spacing: -0.025rem; }

    .container-content p > code,
    .container-content li > code,
    .container-content a > code,
    .container-content td > code,
    .container-content blockquote > code {
        background-color: var(--color-bg-muted);
        border: 1.5px solid var(--color-ink);
        padding: 2px 5px;
        font-family: 'Roboto Mono', monospace;
    }

    .container-content p > strong,
    .container-content li > strong {
        font-weight: 500;
    }

    .container-content a.gatsby-resp-image-link {
        color: transparent;
        border: none;
    }

    .container-content table {
        border-spacing: 0;
        border-collapse: collapse;
        width: 100%;
        margin: 1.5rem 0;
    }

    .container-content table > thead > tr > th {
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.05em;
        padding: 0.8rem;
        text-align: left;
        border-bottom: 2px solid var(--color-ink);
    }

    .container-content table > tbody > tr {
        border-bottom: 1px solid var(--color-bg-muted);
    }

    .container-content table > tbody > tr > td {
        padding: 0.8rem;
        text-align: left;
    }

    .container-content h1 > a,
    .container-content h2 > a,
    .container-content h3 > a,
    .container-content h4 > a,
    .container-content h5 > a,
    .container-content h6 > a {
        border: none;
        background: transparent;
        margin-left: 0.5rem;
        color: var(--color-accent);
        fill: var(--color-accent);
    }

    .container-content h1 > a > svg,
    .container-content h2 > a > svg,
    .container-content h3 > a > svg,
    .container-content h4 > a > svg,
    .container-content h5 > a > svg,
    .container-content h6 > a > svg {
        margin-bottom: -3px;
    }

    .container-content blockquote {
        border-left: 6px solid var(--color-accent);
        border-top: 2px solid var(--color-ink);
        border-right: 2px solid var(--color-ink);
        border-bottom: 2px solid var(--color-ink);
        box-shadow: 4px 4px 0 0 var(--color-ink);
        padding: 0.5rem 0 0.5rem 2rem;
        margin: 1.5rem 0;
    }

    .container-content a {
        color: var(--color-secondary);
        text-decoration: none;
        border-bottom: 2px solid transparent;
        transition: border-color 0.1s;
    }

    .container-content a:hover,
    .container-content a:active {
        border-bottom-color: var(--color-secondary);
    }

    .container-content img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
    }
</style>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ContainerContent.astro
git commit -m "feat: update content typography — brutalist blockquotes, code borders, teal links"
```

---

### Task 10: Redesign `NotFoundBox.astro`

**Files:**
- Modify: `src/components/NotFoundBox.astro`

404 numeral in primary colour, ghost button link.

- [ ] **Step 1: Rewrite `src/components/NotFoundBox.astro`**

```astro
---
---
<div class="flex flex-col items-center justify-center py-[8vw] w-full">
  <h1 class="font-heading font-black text-[7rem] leading-none text-primary m-0 mb-2">
    404
  </h1>
  <h2 class="font-heading font-normal text-base text-ink m-0 mb-8">
    The page you&apos;re looking for doesn&apos;t exist
  </h2>
  <a
    href="/"
    class="inline-block px-5 py-3 font-heading font-bold text-sm uppercase tracking-widest text-ink bg-bg border-2 border-ink shadow-brut-sm no-underline transition-[box-shadow,transform] duration-100 hover:shadow-none hover:translate-x-1 hover:translate-y-1">
    Take me to the homepage →
  </a>
</div>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/NotFoundBox.astro
git commit -m "feat: redesign 404 page with primary numeral and ghost button"
```

---

### Task 11: Update listing pages (posts, category, tag)

**Files:**
- Modify: `src/pages/posts/index.astro`
- Modify: `src/pages/category/[category].astro`
- Modify: `src/pages/tag/[tag].astro`

These pages use the same pattern: a section heading then cards + pagination. Replace the old `<h1 class="page__title">` with the new `<h2>` section heading style (Montserrat 800, 2rem).

- [ ] **Step 1: Rewrite `src/pages/posts/index.astro`**

```astro
---
import {getCollection} from 'astro:content';
import {mapToSortedPosts} from '../../utils/post';
import {sliceIntoPages} from '../../utils/array';
import {type CollectionPage, emptyPage} from '../../models/CollectionPage';
import {type Post} from '../../models/Post';
import SiteLayout from '../../layouts/SiteLayout.astro';
import PostCardContainer from '../../components/PostCardContainer.astro';
import Pagination from '../../components/Pagination.astro';
import {CONFIG} from '../../config/config';

export interface Props {
  page: CollectionPage<Post>
}

const entries = await getCollection('posts');
const pages = sliceIntoPages(mapToSortedPosts(entries), CONFIG.site.pageSize);
const page = pages.find(page => page.first) || emptyPage<Post>();
---
<SiteLayout
  showHeaderFooter={true}
  disableComments={true}
  title="Posts"
  description="Posts"
  path="/posts">
  <h2 class="font-heading font-extrabold text-[2rem] text-ink mt-10 mb-6">All posts</h2>
  <PostCardContainer posts={page.results} />
  <Pagination
    pageCount={page.totalPages}
    currentPage={page.page}
    base="/posts" />
</SiteLayout>
```

- [ ] **Step 2: Rewrite `src/pages/category/[category].astro`**

```astro
---
import {getCollection} from 'astro:content';
import {type Category} from '../../models/Category';
import {type CollectionPage} from '../../models/CollectionPage';
import {type Post} from '../../models/Post';
import {mapToCollectionPosts} from '../../utils/post';
import SiteLayout from '../../layouts/SiteLayout.astro';
import PostCardContainer from '../../components/PostCardContainer.astro';
import Pagination from '../../components/Pagination.astro';
import {CONFIG} from '../../config/config';

export interface Props {
  category: Category;
  page: CollectionPage<Post>
}

export async function getStaticPaths() {
  const entries = await getCollection('posts');
  const groups = mapToCollectionPosts(entries, post => post.categories, CONFIG.site.pageSize);
  return groups.flatMap(({group: category, results}) => {
    return results
      .filter(page => page.first)
      .map(page => ({
        params: {category: category.path},
        props: {category, page},
      }));
  });
}

const {category, page} = Astro.props;
---
<SiteLayout
  showHeaderFooter={true}
  disableComments={true}
  title={category.name}
  description={category.name}
  path={`/category/${category.path}`}>
  <h2 class="font-heading font-extrabold text-[2rem] text-ink mt-10 mb-6">
    Posts within the <strong class="bg-accent-light border-b-[3px] border-accent px-1">{category.name}</strong> category
  </h2>
  <PostCardContainer posts={page.results} />
  <Pagination
    pageCount={page.totalPages}
    currentPage={page.page}
    base={`/category/${category.path}`}/>
</SiteLayout>
```

- [ ] **Step 3: Rewrite `src/pages/tag/[tag].astro`**

```astro
---
import {getCollection} from 'astro:content';
import {type CollectionPage} from '../../models/CollectionPage';
import {type Post} from '../../models/Post';
import {mapToCollectionPosts} from '../../utils/post';
import SiteLayout from '../../layouts/SiteLayout.astro';
import PostCardContainer from '../../components/PostCardContainer.astro';
import Pagination from '../../components/Pagination.astro';
import {type Tag} from '../../models/Tag';
import {CONFIG} from '../../config/config';

export interface Props {
  tag: Tag;
  page: CollectionPage<Post>
}

export async function getStaticPaths() {
  const entries = await getCollection('posts');
  const groups = mapToCollectionPosts(entries, post => post.tags, CONFIG.site.pageSize);
  return groups.flatMap(({group: tag, results}) => {
    return results
      .filter(page => page.first)
      .map(page => ({
        params: {tag: tag.path},
        props: {tag, page},
      }));
  });
}

const {tag, page} = Astro.props;
---
<SiteLayout
  showHeaderFooter={true}
  disableComments={true}
  title={`${tag.name} posts`}
  description={`${tag.name} posts`}
  path={`/tag/${tag.path}`}>
  <h2 class="font-heading font-extrabold text-[2rem] text-ink mt-10 mb-6">
    Posts tagged with <strong class="bg-accent-light border-b-[3px] border-accent px-1">{tag.name}</strong>
  </h2>
  <PostCardContainer posts={page.results} />
  <Pagination
    pageCount={page.totalPages}
    currentPage={page.page}
    base={`/tag/${tag.path}`}/>
</SiteLayout>
```

- [ ] **Step 4: Verify build**

```bash
npm run build
```

Expected: no TypeScript errors, build completes successfully.

- [ ] **Step 5: Commit**

```bash
git add src/pages/posts/index.astro src/pages/category/[category].astro src/pages/tag/[tag].astro
git commit -m "feat: update listing pages with section headings and emphasis on category/tag names"
```

---

### Task 12: Final verification

**Files:** none — verification only.

- [ ] **Step 1: Full production build**

```bash
npm run build
```

Expected: exits 0 with no TypeScript errors or build warnings about missing CSS.

- [ ] **Step 2: Preview smoke test**

```bash
npm run preview
```

Open http://localhost:4321 and verify each page:

| Page | Check |
|------|-------|
| `/` | Accent-light band (header + hero) → ink divider → "Recent posts" heading → 2-col cards |
| `/posts` | Header accent-light band → "All posts" heading → cards → pagination |
| `/category/java` | Header band → category heading with emphasis → cards → pagination |
| `/tag/spring-boot` | Header band → tag heading with emphasis → cards → pagination |
| Any post URL | PageTitle block with ink shadow → post content with teal links and brutalist blockquotes |
| `/404` | Primary-colour 404 numeral → ghost button |

- [ ] **Step 3: Commit if any last fixes were made**

```bash
git add -p  # stage only intentional changes
git commit -m "fix: final polish after smoke test"
```
