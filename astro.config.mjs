import {defineConfig} from 'astro/config';
import rehypeExternalLinks from 'rehype-external-links';
import remarkSmartypants from 'remark-smartypants';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import {s} from 'hastscript';
import sitemap from "@astrojs/sitemap";

const linkContent = s('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '24',
  viewBox: '0 0 24 24',
  fill: 'currentColor'
}, s('path', {
  d: 'm17.657 14.828l-1.414-1.414L17.657 12A4 4 0 1 0 12 6.343l-1.414 1.414l-1.414-1.414l1.414-1.414a6 6 0 0 1 8.485 8.485l-1.414 1.414Zm-2.828 2.829l-1.415 1.414a6 6 0 0 1-8.485-8.485L6.343 9.17l1.415 1.415L6.343 12A4 4 0 0 0 12 17.657l1.415-1.415l1.414 1.415Zm0-9.9l1.414 1.414l-7.071 7.072l-1.414-1.415l7.07-7.07Z'
}));


// https://astro.build/config
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
});