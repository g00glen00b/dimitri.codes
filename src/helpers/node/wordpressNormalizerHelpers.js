const he = require('he');
const striptags = require('striptags');
const contentUrlRegex = new RegExp(process.env.URL_REPLACEMENT_FROM, 'g');
const normalizers = [normalizeContentUrls, normalizeTitleEntities, normalizeExcerpt, normalizeSourceUrl];

function normalizeContentUrls({content, ...rest}) {
  if (content != null) {
    const newContent = content.replace(contentUrlRegex, process.env.URL_REPLACEMENT_TO);
    return {content: newContent, ...rest};
  } else {
    return rest;
  }
}

function normalizeTitleEntities({title, ...rest}) {
  if (title != null) {
    const newTitle = he.decode(title);
    return {title: newTitle, ...rest};
  } else {
    return rest;
  }
}

function normalizeExcerpt({excerpt, ...rest}) {
  if (excerpt != null) {
    const simpleExcerpt = he.decode(striptags(excerpt));
    return {excerpt, simpleExcerpt, ...rest};
  } else {
    return rest;
  }
}

function normalizeSourceUrl({source_url, ...rest}) {
  if (source_url != null) {
    const newSourceUrl = source_url.replace(/^(https?:\/\/.*)-e\d+\.(.+?)$/g, '$1.$2');
    return{source_url: newSourceUrl, ...rest};
  } else {
    return rest;
  }
}

function normalize(entity) {
  return normalizers.reduce((entity, normalizer) => normalizer(entity), entity);
}

module.exports = {
  normalize,
  normalizeExcerpt,
  normalizeContentUrls,
  normalizeSourceUrl,
  normalizeTitleEntities
};
