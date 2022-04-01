export function getTagMetadata(tags = []) {
  return tags != null ? tags.map(({name}) => ({name: 'article:tag', content: name})) : [];
}

export function getSectionMetadata(categories = []) {
  return categories != null ? categories.map(({name}) => ({name: 'article:section', content: name})) : [];
}

export function getTimeMetadata(publishedAt) {
  return [
    {name: `og:updated_time`, content: publishedAt},
    {name: `article:published_time`, content: publishedAt},
    {name: `article:modified_time`, content: publishedAt}
  ];
}

export function getOpenGraphMetadata(site, title, metaDescription, location, image) {
  return [
    {property: `og:title`, content: title},
    {property: `og:description`, content: metaDescription},
    {property: `og:site_name`, content: site.siteMetadata.title},
    {property: `og:type`, content: `website`},
    {property: `og:locale`, content: `en_US`},
    {property: `og:url`, content: `${site.siteMetadata.siteUrl}${location.pathname}`},
    {property: `og:image`, content: `${site.siteMetadata.siteUrl}${image}`},
    {property: `og:image:secure_url`, content: `${site.siteMetadata.siteUrl}${image}`}
  ];
}

export function getTwitterMetadata(site, title, metaDescription, image) {
  return [
    {name: `twitter:card`, content: `summary_large_image`},
    {name: `twitter:creator`, content: site.siteMetadata.author},
    {name: `twitter:title`, content: title},
    {name: `twitter:description`, content: metaDescription},
    {name: `twitter:site`, content: site.siteMetadata.author},
    {name: `twitter:image`, content: `${site.siteMetadata.siteUrl}${image}`}
  ];
}
