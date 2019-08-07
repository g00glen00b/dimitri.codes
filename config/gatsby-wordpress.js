const readingTime = require('reading-time');
const he = require('he');
const striptags = require('striptags');

const normalize = entity => {
  const normalizers = [normalizeContentUrls, normalizeReadingTime, normalizeTitleEntities, normalizeExcerpt];
  return normalizers.reduce((entity, normalizer) => normalizer(entity), entity);
};

const normalizeContentUrls = ({content, ...rest}) => {
  if (content != null) {
    const newContent = content
      .replace(new RegExp(process.env.URL_REPLACEMENT_FROM, 'g'), process.env.URL_REPLACEMENT_TO)
      .replace(new RegExp(process.env.IMAGE_REPLACEMENT_FROM, 'g'), process.env.IMAGE_REPLACEMENT_TO);
    return {content: newContent, ...rest};
  } else {
    return {...rest};
  }
};

const normalizeReadingTime = ({content, ...rest}) => {
  if (content != null) {
    return {content, readingTime: readingTime(content), ...rest};
  } else {
    return {...rest};
  }
};

const normalizeTitleEntities = ({title, ...rest}) => {
  if (title != null) {
    const newTitle = he.decode(title);
    return {title: newTitle, ...rest};
  } else {
    return {...rest};
  }
};

const normalizeExcerpt = ({excerpt, ...rest}) => {
  if (excerpt != null) {
    return {excerpt, simpleExcerpt: he.decode(striptags(excerpt)), ...rest};
  } else {
    return {...rest};
  }
};

module.exports = [
  {
    resolve: `gatsby-source-wordpress`,
    options: {
      baseUrl: process.env.WORDPRESS_API_HOST,
      protocol: process.env.WORDPRESS_API_PROTOCOL,
      hostingWPCOM: false,
      useACF: false,
      perPage: 100,
      concurrentRequests: 10,
      includedRoutes: [
        `**/categories`,
        `**/posts`,
        `**/pages`,
        `**/media`,
        `**/tags`,
        `**/taxonomies`
      ],
      excludedRoutes: [],
      normalizer: ({entities}) => entities.map(normalize)
    }
  }
];
