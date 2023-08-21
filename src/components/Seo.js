import React from "react";
import { Script } from "gatsby";

export const Seo = ({title, siteTitle, author, description, siteUrl, imageUrl, iconUrl, path, publishedDate = null, tags = [], categories = []}) => (
  <>
    <title>{title} | {siteTitle}</title>
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content={siteTitle} />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:url" content={`${siteUrl}${path}`} />
    <meta property="og:image" content={`${siteUrl}${imageUrl}`} />
    <meta property="og:image:secure_url" content={`${siteUrl}${imageUrl}`} />
    {publishedDate && <meta property="og:updated_time" content={publishedDate} />}
    {publishedDate && <meta property="article:published_time" content={publishedDate} />}
    {publishedDate && <meta property="article:modified_time" content={publishedDate} />}
    <meta name="author" content={author} />
    <meta name="description" content={description} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:creator" content={author} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:site" content={author} />
    <meta name="twitter:image" content={`${siteUrl}${imageUrl}`} />
    {(tags || []).map(({name}) => (
      <meta key={name} property="article:tag" content={name} />
    ))}
    {(categories || []).map(({name}) => (
      <meta key={name} property="article:section" content={name} />
    ))}
    <link rel="alternate" type="application/rss+xml" title="Feed" href={`${siteUrl}/rss.xml`} />
    <link rel="icon" href={`${siteUrl}${iconUrl}`} />
    <Script async data-id="101423246" src="//static.getclicky.com/js" />
  </>
);
