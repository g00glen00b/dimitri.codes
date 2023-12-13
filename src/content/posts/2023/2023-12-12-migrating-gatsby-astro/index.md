---
title: "Why I migrated from Gatsby to Astro"
featuredImage: "/logos/astro.png"
categories: ["General"]
tags: ["Gatsby", "Astro"]
excerpt: "In this blogpost I talk about why I migrated from Gatsby to Astro and what the pros and cons are."
---

### Why I started with Gatsby

I've been blogging for a while now, on several platforms.
Originally, I started on a small shared webhost with WordPress on it.

One of the problems with using WordPress as the frontend was that I was tied into the WordPress ecosystem and PHP.
So after a few years, I decided to still use WordPress as the backend, with Gatsby to statically generate the webpages.
This allowed me to utilize a Content Delivery Network (CDN), which decreased page load times drastically. 

After a year, I decided to export my blogposts to Markdown, and refactored my website to use Markdown as the datasource in stead of WordPress.
This allowed me to shut down the WordPress instance and reduce costs.

### The advantages of using Gatsby

One of the major advantages of Gatsby is that it uses technologies I'm more familiar with in comparison with WordPress.
Before Gatsby, I already worked with React and GraphQL, so designing the website and query'ing the blogposts was pretty easy.

What I also liked is that Gatsby came with a rich ecosystem of plugins, including source plugins.
There's support for most Content Management Systems (CMS), including WordPress.

Retrieving data from these sources is very consistent thanks to the unified datalayer that utilizes GraphQL.
This made the switch from WordPress as a backend to Markdown very smooth.

### The painpoints with Gatsby

While the unified datalayer had several advantages, it also made some things more complex by times.
For example, for each blogpost, I wanted to dynamically generate an image for social networks.
To implement such a thing, you have to use a hook to listen for Gatsby post nodes, convert the Markdown to HTML by yourself (because at that point Gatsby didn't create the HTML yet), create an image node, and link it to the original post node.

Another difficulty I had with Gatsby is that the upgrade process wasn't really smooth.
APIs became deprecated very rapidly, and during the upgrade from Gatsby v2 to v3 and from v3 to v4, I had to spend several hours to make everything work again.

In the later releases, the Gatsby process also required more and more memory, up to the point that build platforms like Netlify would unexpectedly exit, even for a small blog.
Luckily this no longer seems to be a problem.

A final issue is that, since the acquisition by Netlify early in 2023, there has been less activity.
Most of the original staff also left ([source](https://twitter.com/wardpeet/status/1693014604694061194)) or were layed off ([source](https://twitter.com/calcsam/status/1679913751397683202)).
The future doesn't look bright.

### Why I switched to Astro

In search for something simpler, I stumbled upon Astro.
Astro has its own language that is inspired upon Markdown and React.
This made the language quite familiar from the start.
It also allows you to use React, Vue and Svelte and even combine them in the same project.
This allows you to bring any UI library you prefer.

Another nice thing is that by default, it generates a full static website without any client-side JavaScript.

A final advantage I noticed with Astro is that build times are about 25% faster than with Gatsby.

### The painpoints with Astro

Due to Astro having its own language, there's specific IDE support needed for things to work.
So far, Astro is only supported in VS Code and the JetBrains IDE's as far as I'm aware.
On top of that, support within the JetBrains IDE's is a bit flaky, with imports breaking once in a while.

Another painpoint is that it seems to be pretty difficult to use the same webpage for multiple routes.
For example, for my blog I want to `/posts` and `/posts/page/1` to refer to the same webpage.
The only solution I found was by relying on meta-tags to redirect to the other page. 
This made development kind of difficult though, because those redirects are cached by the webbrowser, and if you make one mistake, you have to clear your cache before trying again. 

### How I migrated

Astro has some pretty good documentation, including a migration guide for many platforms, including [Gatsby](https://docs.astro.build/en/guides/migrate-to-astro/from-gatsby/).

Due to Markdown being supported by both Astro and Gatsby, I just had to finetune the location (Astro expects the content in **src/content**).
Astro also comes with a concept called [content collections](https://docs.astro.build/en/tutorials/add-content-collections/), which allow you to retrieve and loop over the blogposts.

One thing I had to override is the way the slugs are generated.
This was necessary because I prefer using separate folders for each year, but I didn't want to include those in the slug.
I did this by using a regular expression to parse the original slug and pass the new slug within the `getStaticPaths()` parameters:

```typescript
export async function getStaticPaths() {
  const entries = await getCollection('posts');
  // Regular expression for /[year]/[year]-[month]-[day]-[slug]
  const pathRegex: RegExp = /^\d{4}\/(\d{4})-(\d{2})-(\d{2})-(.+?)$/;
  return entries.map(entry => {
    const matches = pathRegex.exec(entry.slug as string);
    if (matches == null) throw 'Could not map';
    const [, year, month, day, slug] = matches;
    // ...
    return {
      params: {slug}, // Pass slug as parameter
      props: {entry},
    };
  });
}
```

The code that generates the images for the social networks, could be used again with Astro.
The major difference is that instead of linking it with some framework-feature, I exposed them using [endpoints](https://docs.astro.build/en/core-concepts/endpoints/), and included them myself in the `<head>`.

An example of the endpoint would be:

```typescript
export async function GET(context: APIContext) {
  const slug = context.params.post;
  const entries = await getCollection('posts');
  const posts = mapToSortedPosts(entries);
  const post = posts.find(post => post.slug === slug);
  if (post == null) return new Response(null, {status: 404, statusText: 'Not found'});
  const image: ArrayBuffer = await generateImage(post);
  return new Response(image, {
    headers: {'Content-Type': 'image/png'},
  });
}

export async function getStaticPaths() {
  const entries = await getCollection('posts');
  const posts = mapToSortedPosts(entries);
  return posts.map(post => ({params: {post: post.slug}}));
}
```

Speaking about the `<head>`, since we're not using React, we don't have to rely on libraries such as React Helmet.
Instead, we can write the same kind of code as if we were writing another Astro component.

Similar to the social network images, I used an API route for generating a [Web Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest).
This allowed me to generate resized versions of my logo automatically.

For example:

```typescript
export async function GET() {
  const icons = CONFIG.manifest.iconSizes.map(size => ({
    src: `/favicon-${size}.png`,
    type: `image/png`,
    sizes: `${size}x${size}`,
  }));

  const manifest = {
    name: CONFIG.site.title,
    description: CONFIG.site.description,
    start_url: '/',
    display: CONFIG.manifest.display,
    'background_color': CONFIG.manifest.backgroundColor,
    'theme_color': CONFIG.manifest.themeColor,
    icons,
  };

  return new Response(JSON.stringify(manifest))
}
```

With Astro, you can also easily add Remark and Hype plugins without having it to be wrapped (like with Gatsby).
For example, if you want to use the `rehype-external-links` plugin, all you need to do is install it, and add it to `astro.config.mjs`:

```javascript
export default defineConfig({
  markdown: {
    rehypePlugins: [rehypeExternalLinks, rehypeSlug, rehypeAutolinkHeadings],
    remarkPlugins: [remarkSmartypants]
  },
  site: 'https://dimitri.codes',
});
```

Another thing I changed is the syntax highlighting.
By default, Astro uses Shiki while Gatsby used Prism.
Astro does support Prism as well though, and the only thing you have to do to switch is to configure it in `astro.config.mjs`:

```javascript
export default defineConfig({
  syntaxHighlight: 'prism', // Add this
  site: 'https://dimitri.codes',
});
```

If you're interested in seeing the full source code, you can by checking [GitHub](https://dimitri.codes).
The changes I made can be found [here](https://github.com/g00glen00b/dimitri.codes/commit/bf296f521c4fdc21f72f4a7326b3e0ce24c0dcfe).